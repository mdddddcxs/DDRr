// Accès au texte du Coran (api.alquran.cloud) : arabe (uthmani), phonétique, traduction Hamidullah,
// et récitation audio verset par verset. Les réponses sont gardées en cache pour la session.
import { SURAHS } from '../../data/quiz/datasets';

export type Ayah = {
  global: number; // numéro du verset dans tout le Coran (1 à 6236)
  surah: number;
  n: number; // numéro dans la sourate
  arabic: string;
  phonetic: string;
  french: string;
  audio?: string;
  audioAlt?: string;
};

export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy', hint: 'Voix douce et claire' },
  { id: 'ar.husary', name: 'Mahmoud Al-Husary', hint: 'Lent, idéal pour apprendre' },
  { id: 'ar.minshawi', name: 'Al-Minshawi', hint: 'Récitation posée' },
  { id: 'ar.abdurrahmaansudais', name: 'As-Sudais', hint: 'Imam de La Mecque' },
];

/** Début de chaque juz : [sourate, verset]. */
export const JUZ_START: [number, number][] = [
  [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
  [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
  [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1],
];

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

const cache = new Map<string, Promise<any>>();
const getJson = (url: string) => {
  if (!cache.has(url)) {
    const p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (j.code !== 200) throw new Error('Réponse invalide');
        return j.data;
      });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return cache.get(url)!;
};

const merge = (arabic: any[], phon: any[], fr: any[], audio: any[] | null): Ayah[] =>
  arabic.map((a, i) => {
    let text: string = a.text;
    // Le premier verset contient la basmala en tête (sauf Al-Fâtiha) : on l'affiche à part
    if (a.numberInSurah === 1 && a.surah?.number !== 1 && text.startsWith(BASMALA)) text = text.slice(BASMALA.length).trim();
    return {
      global: a.number,
      surah: a.surah?.number,
      n: a.numberInSurah,
      arabic: text,
      phonetic: phon[i]?.text || '',
      french: fr[i]?.text || '',
      audio: audio?.[i]?.audio,
      audioAlt: audio?.[i]?.audioSecondary?.[0],
    };
  });

/** Une sourate complète, avec la voix du récitateur choisi. */
export async function loadSurah(n: number, reciter: string): Promise<Ayah[]> {
  const data = await getJson(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,en.transliteration,fr.hamidullah,${reciter}`);
  const [ar, ph, fr, au] = data;
  return merge(
    ar.ayahs.map((a: any) => ({ ...a, surah: { number: n } })),
    ph.ayahs,
    fr.ayahs,
    au?.ayahs || null,
  );
}

/** Un juz complet (peut couvrir plusieurs sourates). */
export async function loadJuz(n: number, reciter: string): Promise<Ayah[]> {
  const get = (ed: string) => getJson(`https://api.alquran.cloud/v1/juz/${n}/${ed}`);
  const [ar, ph, fr, au] = await Promise.all([get('quran-uthmani'), get('en.transliteration'), get('fr.hamidullah'), get(reciter).catch(() => null)]);
  return merge(ar.ayahs, ph.ayahs, fr.ayahs, au?.ayahs || null);
}

export const surahInfo = (n: number) => SURAHS[n - 1];
export const hasBasmala = (n: number) => n !== 1 && n !== 9;
export { BASMALA };

/** Sourates conseillées pour commencer à apprendre (les plus courtes et les plus récitées). */
export const STARTER = [1, 112, 113, 114, 108, 103, 110, 111, 109, 107, 106, 105, 97, 95, 94, 93];

/** Versets du jour (référence vérifiable). */
export const VERSES_OF_DAY: { s: number; a: number; ar: string; fr: string }[] = [
  { s: 2, a: 255, ar: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', fr: 'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même.' },
  { s: 94, a: 6, ar: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', fr: 'Oui, à côté de la difficulté est une facilité.' },
  { s: 13, a: 28, ar: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', fr: 'N’est-ce point par l’évocation d’Allah que se tranquillisent les cœurs ?' },
  { s: 2, a: 186, ar: 'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ', fr: 'Et quand Mes serviteurs t’interrogent sur Moi, alors Je suis tout proche.' },
  { s: 65, a: 3, ar: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ', fr: 'Et quiconque place sa confiance en Allah, Il lui suffit.' },
  { s: 39, a: 53, ar: 'لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ', fr: 'Ne désespérez pas de la miséricorde d’Allah.' },
  { s: 20, a: 114, ar: 'وَقُل رَّبِّ زِدْنِى عِلْمًا', fr: 'Et dis : « Ô mon Seigneur, accroît mes connaissances ! »' },
];

/** Petit stockage local sûr. */
export const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* stockage plein ou désactivé */
    }
  },
};
