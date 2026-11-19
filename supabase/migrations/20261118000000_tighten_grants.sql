-- Fonctions de déclencheur : jamais appelables via l'API
revoke execute on function public.limit_submissions() from public, anon, authenticated;
revoke execute on function public.refresh_campaign_total() from public, anon, authenticated;
-- Fonctions réservées aux admins connectés : pas pour les visiteurs anonymes
revoke execute on function public.list_admins() from anon;
revoke execute on function public.remove_admin(uuid) from anon;
