// POST /api/chat — Le Compagnon DDR (texte). La clé Gemini reste sur le serveur.
// Corps : { messages: [{ role: 'user' | 'model', text: string }] }
import { SYSTEM_INSTRUCTION } from './_lib/companion.js';
import { json, rateLimited, sameOrigin } from './_lib/guard.js';

const MAX_MESSAGES = 12;
const MAX_CHARS = 1500;

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);
  if (rateLimited(req, 20, 10 * 60 * 1000, 'chat')) {
    return json({ error: 'rate_limited', message: 'Vous avez envoyé beaucoup de questions. Patientez quelques minutes, puis réessayez.' }, 429);
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: 'not_configured' }, 503);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const messages = raw
    .filter((m: any) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_MESSAGES)
    .map((m: any) => ({ role: m.role, parts: [{ text: m.text.slice(0, MAX_CHARS) }] }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'bad_request' }, 400);

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: messages,
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 },
      }),
    });
    if (!r.ok) {
      console.error('[api/chat] gemini', r.status, (await r.text()).slice(0, 300));
      return json({ error: 'upstream' }, 502);
    }
    const data = await r.json();
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p?.text || '').join('').trim();
    if (!text) return json({ error: 'empty' }, 502);
    return json({ text });
  } catch (e) {
    console.error('[api/chat]', e);
    return json({ error: 'upstream' }, 502);
  }
}
