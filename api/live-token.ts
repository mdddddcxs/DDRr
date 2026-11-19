// POST /api/live-token — jeton temporaire (1 utilisation, 30 min) pour la discussion vocale.
// Le navigateur ne voit jamais la vraie clé Gemini : il reçoit un jeton limité au
// modèle vocal et à la personnalité du Compagnon DDR.
import { GoogleGenAI, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './_lib/companion.js';
import { json, rateLimited, sameOrigin } from './_lib/guard.js';

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);
  if (rateLimited(req, 6, 60 * 60 * 1000, 'live')) {
    return json({ error: 'rate_limited', message: 'Trop de sessions vocales. Réessayez plus tard ou utilisez le chat écrit.' }, 429);
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: 'not_configured' }, 503);

  const model = process.env.GEMINI_LIVE_MODEL || 'gemini-3.8-live';
  try {
    const client = new GoogleGenAI({ apiKey: key });
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: SYSTEM_INSTRUCTION,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        },
      },
    });
    return json({ token: token.name, model });
  } catch (e) {
    console.error('[api/live-token]', e);
    return json({ error: 'upstream' }, 502);
  }
}
