import { KNOWLEDGE_BASE, KnowledgeEntry } from '../data/knowledgeBase';

// Recherche locale (sans IA) : sert de secours quand le Compagnon en ligne n'est pas disponible.
const STOP = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'd', 'l', 'et', 'ou', 'a', 'au', 'aux', 'en', 'dans', 'sur', 'pour', 'par', 'est', 'ce', 'que', 'qui', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'comment', 'pourquoi', 'quand', 'ou', 'je', 'tu', 'il', 'on', 'nous', 'vous', 'mon', 'ma', 'mes', 'se', 'sa', 'son', 'ses', 'y', 'ne', 'pas', 'plus', 'il', 'c', 'qu', 'the', 'what', 'is', 'who', 'svp', 'stp', 'bonjour', 'salut', 'salam']);

export const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

const tokens = (t: string) => normalize(t).split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));

/** Classe les fiches par pertinence (mots en commun, avec bonus pour la question et les mots-clés). */
export const searchKnowledgeBaseLocal = async (query: string): Promise<KnowledgeEntry[]> => {
  const q = tokens(query);
  if (!q.length) return [];
  const scored = KNOWLEDGE_BASE.map((e) => {
    const qt = new Set(tokens(e.question));
    const kt = new Set(e.keywords.flatMap(tokens));
    const at = new Set(tokens(e.answer));
    let score = 0;
    for (const w of q) {
      const stem = w.slice(0, 5);
      const hit = (set: Set<string>) => set.has(w) || [...set].some((x) => x.length > 4 && x.startsWith(stem));
      if (hit(qt)) score += 3;
      if (hit(kt)) score += 3;
      else if (hit(at)) score += 1;
    }
    return { e, score };
  }).filter((x) => x.score >= 3);
  return scored.sort((a, b) => b.score - a.score).map((x) => x.e);
};
