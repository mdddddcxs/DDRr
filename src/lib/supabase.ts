import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Client Supabase (clé publique "anon" : elle est faite pour être dans le navigateur,
 * la sécurité est assurée par les règles RLS de la base). `null` si non configuré.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export const isBackendReady = () => supabase !== null;

export class BackendNotConfigured extends Error {
  constructor() {
    super("Le service est en cours de configuration. Merci de nous contacter par téléphone en attendant.");
  }
}

export function db(): SupabaseClient {
  if (!supabase) throw new BackendNotConfigured();
  return supabase;
}

/** Transforme une erreur technique en message compréhensible. */
export function friendlyError(e: unknown): string {
  const msg = (e as any)?.message ? String((e as any).message) : '';
  if (e instanceof BackendNotConfigured) return e.message;
  if (/Trop de demandes/.test(msg)) return msg;
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Connexion impossible. Vérifiez votre internet et réessayez.";
  if (/check constraint|violates/i.test(msg)) return "Certaines informations ne sont pas valides. Vérifiez le formulaire.";
  return "Une erreur est survenue. Merci de réessayer dans un instant.";
}
