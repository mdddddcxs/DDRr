-- Statistiques de fréquentation, anonymes et sans cookie publicitaire.
-- Chaque page vue enregistre : la page, la source (domaine seulement), le type d'appareil,
-- un identifiant de visiteur aléatoire (stocké dans le navigateur, sans lien avec une personne).
-- Les « événements » mesurent l'usage des outils (quiz joué, verset écouté, carte créée…).

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null check (char_length(path) between 1 and 200),
  referrer text check (referrer is null or char_length(referrer) <= 120),
  device text not null default 'desktop' check (device in ('mobile', 'tablet', 'desktop')),
  visitor text not null check (visitor ~ '^[a-z0-9]{8,40}$'),
  session text not null check (session ~ '^[a-z0-9]{8,40}$'),
  event text check (event is null or event ~ '^[a-z0-9_]{2,40}$')
);
alter table public.page_views enable row level security;

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_idx on public.page_views (visitor, created_at desc);

drop policy if exists "stats: visiteur enregistre" on public.page_views;
create policy "stats: visiteur enregistre" on public.page_views for insert to anon, authenticated
  with check (created_at > now() - interval '1 minute' and created_at < now() + interval '1 minute');
drop policy if exists "stats: admin lit" on public.page_views;
create policy "stats: admin lit" on public.page_views for select to authenticated using (public.is_admin());
drop policy if exists "stats: admin supprime" on public.page_views;
create policy "stats: admin supprime" on public.page_views for delete to authenticated using (public.is_admin());

-- Anti-abus : 240 enregistrements par heure et par visiteur au maximum
create or replace function public.limit_page_views()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.page_views p where p.visitor = new.visitor and p.created_at > now() - interval '1 hour') >= 240 then
    return null; -- ignoré sans erreur
  end if;
  return new;
end $$;
revoke execute on function public.limit_page_views() from public, anon, authenticated;
drop trigger if exists page_views_limit on public.page_views;
create trigger page_views_limit before insert on public.page_views for each row execute function public.limit_page_views();

-- Tableau de bord : tout est calculé côté base, seul un administrateur peut l'appeler.
create or replace function public.admin_stats(days int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  d int := least(greatest(coalesce(days, 30), 1), 365);
  since timestamptz := date_trunc('day', now() at time zone 'UTC') - make_interval(days => d - 1);
  prev timestamptz := since - make_interval(days => d);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'range', jsonb_build_object('days', d, 'since', since),
    'totals', (
      select jsonb_build_object(
        'views', count(*) filter (where event is null),
        'visitors', count(distinct visitor),
        'sessions', count(distinct session),
        'events', count(*) filter (where event is not null)
      ) from public.page_views where created_at >= since
    ),
    'previous', (
      select jsonb_build_object(
        'views', count(*) filter (where event is null),
        'visitors', count(distinct visitor),
        'sessions', count(distinct session)
      ) from public.page_views where created_at >= prev and created_at < since
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', g.day, 'views', coalesce(v.views, 0), 'visitors', coalesce(v.visitors, 0)) order by g.day), '[]')
      from generate_series(since::date, (now() at time zone 'UTC')::date, interval '1 day') as g(day)
      left join (
        select (created_at at time zone 'UTC')::date as day, count(*) filter (where event is null) as views, count(distinct visitor) as visitors
        from public.page_views where created_at >= since group by 1
      ) v on v.day = g.day::date
    ),
    'hours', (
      select coalesce(jsonb_agg(jsonb_build_object('hour', h, 'views', n) order by h), '[]') from (
        select extract(hour from created_at at time zone 'Africa/Abidjan')::int as h, count(*) as n
        from public.page_views where created_at >= since and event is null group by 1
      ) x
    ),
    'pages', (
      select coalesce(jsonb_agg(jsonb_build_object('path', path, 'views', n, 'visitors', u) order by n desc), '[]') from (
        select path, count(*) as n, count(distinct visitor) as u from public.page_views
        where created_at >= since and event is null group by path order by n desc limit 12
      ) x
    ),
    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('source', s, 'visitors', n) order by n desc), '[]') from (
        select coalesce(nullif(referrer, ''), 'Accès direct') as s, count(distinct session) as n from public.page_views
        where created_at >= since and event is null group by 1 order by n desc limit 8
      ) x
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('device', device, 'visitors', n) order by n desc), '[]') from (
        select device, count(distinct visitor) as n from public.page_views where created_at >= since group by device
      ) x
    ),
    'events', (
      select coalesce(jsonb_agg(jsonb_build_object('event', event, 'count', n) order by n desc), '[]') from (
        select event, count(*) as n from public.page_views where created_at >= since and event is not null group by event
      ) x
    ),
    'forms', (
      select jsonb_build_object(
        'appointments', (select count(*) from public.appointments where created_at >= since),
        'conversions', (select count(*) from public.conversion_requests where created_at >= since),
        'testimonies', (select count(*) from public.messages where created_at >= since),
        'newsletter', (select count(*) from public.newsletter_subscribers where created_at >= since)
      )
    ),
    'live', (select count(distinct visitor) from public.page_views where created_at > now() - interval '5 minutes')
  ) into result;
  return result;
end $$;
revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;

-- Ménage : on ne garde que 13 mois d'historique
create or replace function public.purge_old_page_views()
returns void language sql security definer set search_path = public as $$
  delete from public.page_views where created_at < now() - interval '13 months' and public.is_admin();
$$;
revoke all on function public.purge_old_page_views() from public, anon;
grant execute on function public.purge_old_page_views() to authenticated;
