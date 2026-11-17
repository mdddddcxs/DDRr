import type { Debate, NewsItem } from '../types';
import { listNews } from './db';

// La clé YouTube n'est plus dans le navigateur : on passe par /api/youtube (cache 30 min côté serveur).
// Vraies vidéos publiées par la DDR (affichées tant que la clé YouTube n'est pas configurée).
const featured = (id: string, title: string): Debate => ({
  id,
  title,
  description: '',
  videoUrl: `https://www.youtube-nocookie.com/embed/${id}`,
  date: 'Sélection DDR',
  speaker: 'La DDR',
  location: 'YouTube',
  thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
});
const FEATURED: Debate[] = [
  featured('fUztTS7W3lc', 'Le rappel de la DDR à Ficgayo, suivi de questions-réponses avec Oustaz Diané et Ismaël Aka'),
  featured('dT_DDr_z_Ao', 'Questions et réponses avec la DDR à Yopougon Ficgayo — Ismaël Aka'),
  featured('rUQSCf3FXW4', 'Le rappel hebdomadaire de la DDR à Yopougon Ficgayo avec Ismaël Aka'),
  featured('OHeYDaCjqs0', 'Débat religieux avec Oustaz Diané'),
  featured('QekF9qvXCkw', 'Débat entre la DDR et un évangéliste, suivi d’une conversion à l’islam'),
  featured('nZhAtPAQpbE', 'Le rappel de la DDR à Daloa, suivi d’un débat religieux'),
];

let memo: { at: number; data: Debate[] } | null = null;


export async function fetchYoutubeDebates(): Promise<Debate[]> {
  if (memo && Date.now() - memo.at < 10 * 60 * 1000) return memo.data;
  try {
    const r = await fetch('/api/youtube');
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    const videos: any[] = Array.isArray(data.videos) ? data.videos : [];
    if (!videos.length) return FEATURED;
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
    // API pas encore configurée : sélection de vraies vidéos de la DDR.
    return FEATURED;
  }
}

/** Actualités publiées par l'admin (liste vide si rien n'est encore publié). */
export async function fetchNews(): Promise<NewsItem[]> {
  return (await listNews().catch(() => null)) || [];
}
