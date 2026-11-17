// POST /api/admin-users — un administrateur crée le compte d'un nouvel administrateur.
// Corps : { email, password, name }   En-tête : Authorization: Bearer <jeton de session de l'admin>
// Nécessite SUPABASE_SERVICE_ROLE_KEY (secrète, uniquement côté serveur).
import { json, rateLimited, sameOrigin } from './_lib/guard.js';

const URL_ = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');

async function callerIsAdmin(token: string, service: string): Promise<boolean> {
  const base = URL_();
  const u = await fetch(`${base}/auth/v1/user`, { headers: { apikey: service, authorization: `Bearer ${token}` } });
  if (!u.ok) return false;
  const user = await u.json();
  if (!user?.id) return false;
  const r = await fetch(`${base}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, {
    headers: { apikey: service, authorization: `Bearer ${service}` },
  });
  const rows = r.ok ? await r.json() : [];
  return Array.isArray(rows) && rows.length === 1;
}

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);
  if (rateLimited(req, 10, 60 * 60 * 1000, 'admin-users')) return json({ error: 'rate_limited' }, 429);

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!service || !URL_()) return json({ error: 'not_configured', message: 'SUPABASE_SERVICE_ROLE_KEY manquante dans Vercel.' }, 503);

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await callerIsAdmin(token, service))) return json({ error: 'forbidden' }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const name = String(body?.name || '').trim().slice(0, 80);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'bad_request', message: 'Email invalide.' }, 400);
  if (password.length < 10) return json({ error: 'bad_request', message: 'Le mot de passe doit faire au moins 10 caractères.' }, 400);

  const base = URL_();
  const headers = { apikey: service, authorization: `Bearer ${service}`, 'content-type': 'application/json' };
  const created = await fetch(`${base}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }),
  });
  const user = await created.json().catch(() => ({}));
  if (!created.ok || !user?.id) {
    const exists = /already|registered|exists/i.test(JSON.stringify(user));
    return json({ error: 'create_failed', message: exists ? 'Un compte existe déjà avec cet email.' : 'Création du compte impossible.' }, 400);
  }
  const ins = await fetch(`${base}/rest/v1/admins`, {
    method: 'POST',
    headers: { ...headers, prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: user.id, display_name: name || null }),
  });
  if (!ins.ok) return json({ error: 'create_failed', message: 'Compte créé, mais impossible de lui donner les droits.' }, 500);
  return json({ ok: true });
}
