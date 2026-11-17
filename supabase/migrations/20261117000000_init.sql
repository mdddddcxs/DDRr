-- =============================================================================
-- La DDR — schéma initial Supabase
-- Principe : le site est public (aucun compte visiteur). Les visiteurs peuvent
-- seulement ENVOYER des formulaires (rendez-vous, témoignages, conversion,
-- newsletter). Tout le reste (lecture des demandes, modération, contenus) est
-- réservé aux administrateurs listés dans la table public.admins.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Administrateurs
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admins: un admin voit la liste" on public.admins
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Réglages du site (mode maintenance, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create policy "settings: lecture publique" on public.settings for select using (true);
create policy "settings: admin écrit" on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.settings (key, value) values ('maintenance', 'false'::jsonb)
  on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Campagnes de dons
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  id text primary key,
  title text not null,
  description text not null default '',
  target_amount bigint not null check (target_amount > 0),
  current_amount bigint not null default 0 check (current_amount >= 0),
  image_url text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create policy "campaigns: lecture publique" on public.campaigns for select using (is_active or public.is_admin());
create policy "campaigns: admin écrit" on public.campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.campaigns (id, title, description, target_amount, current_amount, image_url)
values (
  'ecole-science-foi',
  'Grande Mosquée & École « Science & Foi »',
  'La DDR lance la construction d''un complexe éducatif islamique à Abidjan, alliant excellence académique et éducation religieuse.',
  50000000, 0, null
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Dons (écrits par l'admin pour les dons reçus hors ligne, ou plus tard par
-- le serveur de paiement avec la clé service_role — jamais par le navigateur)
-- ---------------------------------------------------------------------------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id text references public.campaigns (id) on delete set null,
  amount bigint not null check (amount > 0),
  donor_name text not null default 'Anonyme' check (char_length(donor_name) <= 120),
  is_anonymous boolean not null default true,
  donor_phone text check (char_length(donor_phone) <= 30),
  method text not null default 'Autre' check (method in ('Wave', 'OrangeMoney', 'MTN', 'Moov', 'Carte', 'Espèces', 'Autre')),
  status text not null default 'success' check (status in ('pending', 'success', 'failed')),
  provider_ref text unique,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);
alter table public.donations enable row level security;
create policy "donations: admin tout" on public.donations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Lecture publique : seulement les derniers dons réussis, sans téléphone,
-- avec le nom masqué si le donateur a choisi l'anonymat
create or replace function public.recent_donations(max_rows int default 20)
returns table (id uuid, campaign_id text, amount bigint, donor_name text, method text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select d.id, d.campaign_id, d.amount,
         case when d.is_anonymous then 'Anonyme' else d.donor_name end,
         d.method, d.created_at
    from public.donations d
   where d.status = 'success'
   order by d.created_at desc
   limit least(greatest(max_rows, 1), 50);
$$;
revoke all on function public.recent_donations(int) from public;
grant execute on function public.recent_donations(int) to anon, authenticated;

-- Le montant collecté de la campagne se recalcule tout seul
create or replace function public.refresh_campaign_total()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid text;
begin
  for cid in select distinct x from unnest(array[
      case when tg_op in ('INSERT','UPDATE') then new.campaign_id end,
      case when tg_op in ('UPDATE','DELETE') then old.campaign_id end]) as x where x is not null
  loop
    update public.campaigns
       set current_amount = coalesce((select sum(amount) from public.donations
                                      where campaign_id = cid and status = 'success'), 0),
           updated_at = now()
     where id = cid;
  end loop;
  return null;
end $$;
create trigger donations_refresh_total
  after insert or update or delete on public.donations
  for each row execute function public.refresh_campaign_total();

-- ---------------------------------------------------------------------------
-- Actualités
-- ---------------------------------------------------------------------------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 200),
  summary text not null default '',
  body text not null default '',
  image_url text,
  category text not null default 'News' check (category in ('Event', 'News', 'Announcement')),
  author text not null default 'La DDR',
  tags text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.news enable row level security;
create policy "news: lecture publique" on public.news for select using (published or public.is_admin());
create policy "news: admin écrit" on public.news for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Formulaires publics (insertion seule pour les visiteurs)
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  subject text not null check (char_length(subject) <= 120),
  requested_date date,
  message text not null default '' check (char_length(message) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  admin_comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text', 'audio')),
  sender_name text not null check (char_length(sender_name) between 2 and 120),
  sender_phone text check (char_length(sender_phone) <= 30),
  content text not null check (char_length(content) <= 4000), -- texte, ou chemin du fichier audio
  audio_duration text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

create table if not exists public.conversion_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  location text check (char_length(location) <= 200),
  method text not null default 'presentiel' check (method in ('presentiel', 'video')),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;
alter table public.messages enable row level security;
alter table public.conversion_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Les visiteurs peuvent seulement créer (pas lire, ni modifier, ni supprimer)
create policy "appointments: visiteur envoie" on public.appointments for insert to anon, authenticated
  with check (status = 'pending' and admin_comment is null);
create policy "messages: visiteur envoie" on public.messages for insert to anon, authenticated
  with check (is_read = false and expires_at <= now() + interval '8 days');
create policy "conversion: visiteur envoie" on public.conversion_requests for insert to anon, authenticated
  with check (status = 'pending');
create policy "newsletter: visiteur s'inscrit" on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

create policy "appointments: admin tout" on public.appointments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "messages: admin tout" on public.messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "conversion: admin tout" on public.conversion_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "newsletter: admin tout" on public.newsletter_subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Anti-spam : pas plus de N envois par numéro de téléphone sur 24 h
create or replace function public.limit_submissions()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int; max_per_day int := coalesce(tg_argv[0]::int, 3); phone_value text;
begin
  if public.is_admin() then return new; end if;
  phone_value := coalesce(to_jsonb(new) ->> 'phone', to_jsonb(new) ->> 'sender_phone');
  if phone_value is null then return new; end if;
  execute format(
    'select count(*) from %I.%I as t
      where coalesce(to_jsonb(t) ->> ''phone'', to_jsonb(t) ->> ''sender_phone'') = $1
        and t.created_at > now() - interval ''24 hours''',
    tg_table_schema, tg_table_name)
    using phone_value into n;
  if n >= max_per_day then
    raise exception 'Trop de demandes envoyées aujourd''hui avec ce numéro. Réessayez demain.' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger appointments_limit before insert on public.appointments
  for each row execute function public.limit_submissions('3');
create trigger messages_limit before insert on public.messages
  for each row execute function public.limit_submissions('2');
create trigger conversion_limit before insert on public.conversion_requests
  for each row execute function public.limit_submissions('2');

create index if not exists appointments_created_idx on public.appointments (created_at desc);
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists conversion_created_idx on public.conversion_requests (created_at desc);
create index if not exists donations_campaign_idx on public.donations (campaign_id, status);

-- ---------------------------------------------------------------------------
-- Stockage des témoignages audio (bucket privé)
-- Les visiteurs peuvent déposer un fichier audio (max 3 Mo), seuls les admins
-- peuvent l'écouter.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('testimonies', 'testimonies', false, 3145728,
        array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac'])
on conflict (id) do nothing;

create policy "testimonies: visiteur dépose" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'testimonies' and (storage.foldername(name))[1] = 'incoming');
create policy "testimonies: admin lit" on storage.objects for select to authenticated
  using (bucket_id = 'testimonies' and public.is_admin());
create policy "testimonies: admin supprime" on storage.objects for delete to authenticated
  using (bucket_id = 'testimonies' and public.is_admin());
