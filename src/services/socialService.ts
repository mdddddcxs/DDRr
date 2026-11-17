import type { Debate, NewsItem } from '../types';
import { listNews } from './db';

// La clé YouTube n'est plus dans le navigateur : on passe par /api/youtube (cache 30 min côté serveur).
let memo: { at: number; data: Debate[] } | null = null;

export { SOCIAL_LINKS } from '../constants';

export async function fetchYoutubeDebates(): Promise<Debate[]> {
  if (memo && Date.now() - memo.at < 10 * 60 * 1000) return memo.data;
  try {
    const r = await fetch('/api/youtube');
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    const videos: any[] = Array.isArray(data.videos) ? data.videos : [];
    if (!videos.length) return [];
    const list: Debate[] = videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      videoUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
      date: new Date(v.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      speaker: data.channelTitle || 'La DDR',
      location: 'YouTube',
      thumbnailUrl: v.thumbnail,
      isLive: !!v.isLive,
      isUpcoming: !!v.isUpcoming,
    }));
    memo = { at: Date.now(), data: list };
    return list;
  } catch {
    // Pas de fausses vidéos : la page propose alors d'ouvrir la chaîne YouTube.
    return [];
  }
}

/** Actualités publiées par l'admin (liste vide si rien n'est encore publié). */
export async function fetchNews(): Promise<NewsItem[]> {
  return (await listNews().catch(() => null)) || [];
}
