-- Audit de sécurité (2026-11-19), finding confirmé
-- supabase/migrations/init.sql:newsletter_subscribers-email-unique-anon-insert-oracle
--
-- Problème : un visiteur pouvait insérer directement dans newsletter_subscribers.
-- Comme email est UNIQUE, la réponse différait (erreur 23505 / HTTP 409 ou succès)
-- selon que l'adresse était déjà inscrite : n'importe qui pouvait tester si une
-- personne suit la newsletter de l'association.
--
-- Correctif : l'inscription passe par une fonction qui répond toujours de la même
-- façon (ON CONFLICT DO NOTHING), et l'insertion directe est retirée aux visiteurs.

create or replace function public.subscribe_newsletter(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.newsletter_subscribers (email)
  values (lower(trim(p_email)))
  on conflict (email) do nothing;
$$;

revoke all on function public.subscribe_newsletter(text) from public;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;

drop policy if exists "newsletter: visiteur s'inscrit" on public.newsletter_subscribers;
