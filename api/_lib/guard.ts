// Petits garde-fous partagés par les fonctions serveur (fichiers "_lib" = pas des routes).

/** Limite simple par adresse IP (mémoire de l'instance : protection "best effort"). */
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, max: number, windowMs: number, bucket = 'default'): boolean {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  const key = bucket + ':' + ip;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

/** Refuse les appels venant d'un autre site (le navigateur envoie toujours l'en-tête Origin en POST). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // appels serveur-à-serveur / outils : pas d'Origin
  try {
    const o = new URL(origin).host;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    return o === host || allowed.some((a) => { try { return new URL(a).host === o; } catch { return a === o; } });
  } catch {
    return false;
  }
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
