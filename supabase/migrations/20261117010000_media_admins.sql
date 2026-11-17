-- =============================================================================
-- La DDR — photos du site + gestion des administrateurs
-- =============================================================================

-- Photos publiques du site (intervenants, campagne, actualités).
-- Tout le monde peut les voir ; seuls les admins peuvent en ajouter ou en supprimer.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "media: admin ajoute" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin modifie" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media: admin supprime" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- Les admins voient la liste des admins avec leur email (pour la page Réglages).
create or replace function public.list_admins()
returns table (user_id uuid, email text, display_name text, created_at timestamptz)
language sql stable security definer set search_path = public, auth as $$
  select a.user_id, u.email::text, a.display_name, a.created_at
    from public.admins a join auth.users u on u.id = a.user_id
   where public.is_admin()
   order by a.created_at;
$$;
revoke all on function public.list_admins() from public;
grant execute on function public.list_admins() to authenticated;

-- Un admin peut retirer les droits d'un autre admin (jamais les siens, jamais le dernier).
create or replace function public.remove_admin(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès refusé'; end if;
  if target = auth.uid() then raise exception 'Vous ne pouvez pas retirer vos propres droits.'; end if;
  if (select count(*) from public.admins) <= 1 then raise exception 'Il doit rester au moins un administrateur.'; end if;
  delete from public.admins where user_id = target;
end $$;
revoke all on function public.remove_admin(uuid) from public;
grant execute on function public.remove_admin(uuid) to authenticated;
