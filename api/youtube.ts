// GET /api/youtube — dernières vidéos de la chaîne YouTube de la DDR.
// La clé YouTube reste sur le serveur (variable YOUTUBE_API_KEY) et la réponse
// est mise en cache 30 min par le CDN de Vercel pour économiser le quota.
// Coût : ~3 unités de quota par rafraîchissement (au lieu de 101 avec search).

const API = 'https://www.googleapis.com/youtube/v3';

type Video = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  isLive: boolean;
  isUpcoming: boolean;
};

const json = (body: unknown, status = 200, cache = true) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache ? 'public, s-maxage=1800, stale-while-revalidate=86400' : 'no-store',
    },
  });

async function yt(path: string, params: Record<string, string>, key: string) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', key);
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`YouTube ${path} ${r.status}`);
  return r.json();
}

export async function GET(): Promise<Response> {
  const key = process.env.YOUTUBE_API_KEY;
  const handle = (process.env.YOUTUBE_CHANNEL_HANDLE || 'ddrlavraiechaine').replace(/^@/, '');
  const channelIdEnv = process.env.YOUTUBE_CHANNEL_ID;
  if (!key) return json({ videos: [], configured: false }, 200, false);

  try {
    // 1. Chaîne -> playlist des vidéos publiées (1 unité)
    const chan = await yt('/channels', channelIdEnv ? { part: 'contentDetails,snippet', id: channelIdEnv } : { part: 'contentDetails,snippet', forHandle: handle }, key);
    const channel = chan.items?.[0];
    const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return json({ videos: [], configured: true }, 200);

    // 2. 12 dernières vidéos (1 unité)
    const list = await yt('/playlistItems', { part: 'snippet,contentDetails', playlistId: uploads, maxResults: '12' }, key);
    const ids: string[] = (list.items || []).map((i: any) => i.contentDetails?.videoId).filter(Boolean);
    if (!ids.length) return json({ videos: [], configured: true }, 200);

    // 3. Détails (direct en cours / à venir) (1 unité)
    const details = await yt('/videos', { part: 'snippet', id: ids.join(',') }, key);
    const byId = new Map<string, any>((details.items || []).map((v: any) => [v.id, v]));

    const videos: Video[] = ids
      .map((id) => {
        const v = byId.get(id);
        if (!v) return null;
        const s = v.snippet;
        const t = s.thumbnails || {};
        return {
          id,
          title: String(s.title || ''),
          description: String(s.description || '').slice(0, 400),
          publishedAt: s.publishedAt,
          thumbnail: (t.maxres || t.high || t.medium || t.default || {}).url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          isLive: s.liveBroadcastContent === 'live',
          isUpcoming: s.liveBroadcastContent === 'upcoming',
        };
      })
      .filter(Boolean) as Video[];

    return json({ configured: true, channelTitle: channel?.snippet?.title || 'La DDR', videos });
  } catch (e) {
    console.error('[api/youtube]', e);
    return json({ videos: [], configured: true, error: 'unavailable' }, 200, false);
  }
}
