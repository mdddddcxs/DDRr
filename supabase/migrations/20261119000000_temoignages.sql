-- Témoignages : consentement, conservation et publication par l'administration.
--  * Les messages restent 30 jours (au lieu de 7) ; l'admin peut les « conserver » sans limite.
--  * Le visiteur peut accepter que son témoignage soit publié (prénom seulement, jamais le téléphone).
--  * L'admin publie ou retire un témoignage ; seuls les témoignages publiés ET consentis sont visibles.

alter table public.messages
  add column if not exists consent_publish boolean not null default false,
  add column if not exists published boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists display_name text check (display_name is null or char_length(display_name) <= 60),
  add column if not exists city text check (city is null or char_length(city) <= 80);

alter table public.messages alter column expires_at set default now() + interval '30 days';

-- On ne peut pas publier sans consentement
alter table public.messages drop constraint if exists messages_publish_needs_consent;
alter table public.messages add constraint messages_publish_needs_consent check (not published or consent_publish);

-- Le visiteur dépose un témoignage non publié, qui expire au plus tard dans 31 jours
drop policy if exists "messages: visiteur envoie" on public.messages;
create policy "messages: visiteur envoie" on public.messages for insert to anon, authenticated
  with check (is_read = false and published = false and published_at is null and expires_at <= now() + interval '31 days');

create index if not exists messages_published_idx on public.messages (published_at desc) where published;

-- Lecture publique : uniquement les champs sans données personnelles
create or replace function public.public_testimonies(max_rows int default 30)
returns table (id uuid, type text, display_name text, city text, content text, audio_duration text, published_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, m.type, coalesce(nullif(m.display_name, ''), split_part(m.sender_name, ' ', 1)), m.city,
         m.content, m.audio_duration, m.published_at
  from public.messages m
  where m.published and m.consent_publish
  order by m.published_at desc nulls last
  limit least(greatest(max_rows, 1), 60);
$$;
revoke all on function public.public_testimonies(int) from public;
grant execute on function public.public_testimonies(int) to anon, authenticated;

-- Écoute publique des seuls audios publiés et consentis.
-- (Fonction security definer : un visiteur n'a pas le droit de lire la table messages.)
create or replace function public.is_published_testimony_audio(path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.messages m
    where m.type = 'audio' and m.content = path and m.published and m.consent_publish
  );
$$;
revoke all on function public.is_published_testimony_audio(text) from public;
grant execute on function public.is_published_testimony_audio(text) to anon, authenticated;

drop policy if exists "testimonies: public écoute les publiés" on storage.objects;
create policy "testimonies: public écoute les publiés" on storage.objects for select to anon, authenticated
  using (bucket_id = 'testimonies' and public.is_published_testimony_audio(name));
