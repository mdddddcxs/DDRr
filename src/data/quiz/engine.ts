// Moteur du quiz infini.
// - Questions rédigées (banque) + générateurs qui fabriquent des milliers de variantes à partir de données vérifiées.
// - Anti-répétition : les dernières questions posées ne reviennent pas tout de suite.
// - Révision : une question ratée revient quelques questions plus tard, jusqu'à être réussie.
// - Progression : la difficulté monte avec le niveau du joueur.
import { BANK, type Theme } from './bank';
import { LETTERS, MONTHS, NAMES, PRAYERS, PROPHETS, SURAHS } from './datasets';

export type Question = {
  id: string;
  theme: Theme;
  level: 1 | 2 | 3;
  prompt: string;
  arabic?: string;
  options: string[];
  answer: string;
  explain: string;
};

const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]) => arr[rnd(arr.length)];
export const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
/** n éléments distincts de `pool`, différents de `exclude`. */
const distractors = <T,>(pool: T[], exclude: T, n = 3, key: (x: T) => string = String) => {
  const ex = key(exclude);
  const seen = new Set([ex]);
  const out: T[] = [];
  for (const x of shuffle(pool)) {
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
    if (out.length === n) break;
  }
  return out;
};
const make = (q: Omit<Question, 'options'> & { wrong: string[] }): Question => ({ ...q, options: shuffle([q.answer, ...q.wrong]) });

/* ---------------- Générateurs ---------------- */

type Gen = { theme: Theme; level: 1 | 2 | 3; make: () => Question };

// Sourates connues (courtes, très récitées) pour les niveaux faciles
const FAMOUS = [1, 2, 18, 19, 36, 55, 56, 67, 97, 103, 108, 112, 113, 114];
const surahPool = (level: number) => (level === 1 ? SURAHS.filter((s) => FAMOUS.includes(s.n)) : level === 2 ? SURAHS.filter((s) => s.n >= 78 || FAMOUS.includes(s.n)) : SURAHS);

const GENS: Gen[] = [
  // Sourates : sens du nom
  ...([1, 2, 3] as const).map((level) => ({
    theme: 'sourates' as Theme,
    level,
    make: () => {
      const pool = surahPool(level).filter((s) => s.fr !== s.name);
      const s = pick(pool);
      return make({
        id: `s-sens-${s.n}`, theme: 'sourates', level,
        prompt: `Que signifie le nom de la sourate « ${s.name} » ?`,
        answer: s.fr,
        wrong: distractors(SURAHS.filter((x) => x.fr !== x.name), s, 3, (x) => x.fr).map((x) => x.fr),
        explain: `${s.name} (sourate ${s.n}) signifie « ${s.fr} ». Elle compte ${s.ayat} versets.`,
      });
    },
  })),
  // Sourates : numéro
  ...([2, 3] as const).map((level) => ({
    theme: 'sourates' as Theme,
    level,
    make: () => {
      const s = pick(surahPool(level));
      const near = SURAHS.filter((x) => Math.abs(x.n - s.n) <= 12 && x.n !== s.n);
      return make({
        id: `s-num-${s.n}`, theme: 'sourates', level,
        prompt: `Quelle est la sourate numéro ${s.n} ?`,
        answer: s.name,
        wrong: distractors(near.length >= 3 ? near : SURAHS, s, 3, (x) => x.name).map((x) => x.name),
        explain: `La sourate ${s.n} est ${s.name}, « ${s.fr} ».`,
      });
    },
  })),
  // Sourates : nombre de versets
  ...([2, 3] as const).map((level) => ({
    theme: 'sourates' as Theme,
    level,
    make: () => {
      const s = pick(surahPool(level));
      const counts = [...new Set(SURAHS.map((x) => x.ayat))].filter((c) => c !== s.ayat).sort((a, b) => Math.abs(a - s.ayat) - Math.abs(b - s.ayat));
      const wrong = shuffle(counts.slice(0, 6)).slice(0, 3).map(String);
      return make({
        id: `s-ayat-${s.n}`, theme: 'sourates', level,
        prompt: `Combien de versets compte la sourate ${s.name} (« ${s.fr} ») ?`,
        answer: String(s.ayat), wrong,
        explain: `${s.name} compte ${s.ayat} versets.`,
      });
    },
  })),
  // Sourates : mecquoise ou médinoise
  {
    theme: 'sourates', level: 3,
    make: () => {
      const s = pick(SURAHS);
      const answer = s.medine ? 'Médinoise' : 'Mecquoise';
      return {
        id: `s-lieu-${s.n}`, theme: 'sourates', level: 3,
        prompt: `La sourate ${s.name} (« ${s.fr} ») est-elle mecquoise ou médinoise ?`,
        options: ['Mecquoise', 'Médinoise'], answer,
        explain: `${s.name} est ${answer.toLowerCase()}, c’est-à-dire révélée ${s.medine ? 'après' : 'avant'} l’hégire, selon la classification la plus répandue.`,
      };
    },
  },
  // Lettres arabes
  ...([1, 2] as const).map((level) => ({
    theme: 'arabe' as Theme,
    level,
    make: () => {
      const l = pick(LETTERS);
      return make({
        id: `l-nom-${l.name}`, theme: 'arabe', level,
        prompt: 'Comment s’appelle cette lettre ?', arabic: l.ar,
        answer: l.name,
        wrong: distractors(LETTERS, l, 3, (x) => x.name).map((x) => x.name),
        explain: `C’est la lettre ${l.name}, la ${LETTERS.indexOf(l) + 1}ᵉ de l’alphabet arabe.`,
      });
    },
  })),
  {
    theme: 'arabe', level: 2,
    make: () => {
      const l = pick(LETTERS);
      return make({
        id: `l-forme-${l.name}`, theme: 'arabe', level: 2,
        prompt: `Laquelle de ces lettres est le « ${l.name} » ?`,
        answer: l.ar,
        wrong: distractors(LETTERS, l, 3, (x) => x.ar).map((x) => x.ar),
        explain: `Le ${l.name} s’écrit ${l.ar}.`,
      });
    },
  },
  {
    theme: 'arabe', level: 3,
    make: () => {
      const i = rnd(LETTERS.length - 1);
      const l = LETTERS[i];
      const next = LETTERS[i + 1];
      return make({
        id: `l-suite-${l.name}`, theme: 'arabe', level: 3,
        prompt: `Dans l’alphabet arabe, quelle lettre vient juste après « ${l.name} » (${l.ar}) ?`,
        answer: `${next.name} (${next.ar})`,
        wrong: distractors(LETTERS, next, 3, (x) => x.name).map((x) => `${x.name} (${x.ar})`),
        explain: `L’ordre est : ${l.name} (${l.ar}), puis ${next.name} (${next.ar}).`,
      });
    },
  },
  // Noms d'Allah
  ...([1, 2] as const).map((level) => ({
    theme: 'noms' as Theme,
    level,
    make: () => {
      const n = pick(level === 1 ? NAMES.slice(0, 15) : NAMES);
      return make({
        id: `n-sens-${n.tr}`, theme: 'noms', level,
        prompt: `Que signifie le nom d’Allah « ${n.tr} » ?`, arabic: n.ar,
        answer: n.fr,
        wrong: distractors(NAMES, n, 3, (x) => x.fr).map((x) => x.fr),
        explain: `${n.tr} (${n.ar}) : ${n.fr}.`,
      });
    },
  })),
  {
    theme: 'noms', level: 3,
    make: () => {
      const n = pick(NAMES);
      return make({
        id: `n-inv-${n.tr}`, theme: 'noms', level: 3,
        prompt: `Quel nom d’Allah signifie « ${n.fr} » ?`,
        answer: n.tr,
        wrong: distractors(NAMES, n, 3, (x) => x.tr).map((x) => x.tr),
        explain: `${n.fr} se dit ${n.tr} (${n.ar}).`,
      });
    },
  },
  // Prophètes : noms arabes / français
  ...([1, 2] as const).map((level) => ({
    theme: 'prophetes' as Theme,
    level,
    make: () => {
      const p = pick(PROPHETS);
      const ar2fr = level === 2;
      return make({
        id: `p-${ar2fr ? 'ar' : 'fr'}-${p.fr}`, theme: 'prophetes', level,
        prompt: ar2fr ? `Quel est le nom français du prophète ${p.ar} ?` : `Comment le Coran appelle-t-il le prophète ${p.fr} ?`,
        answer: ar2fr ? p.fr : p.ar,
        wrong: distractors(PROPHETS, p, 3, (x) => x.fr).map((x) => (ar2fr ? x.fr : x.ar)),
        explain: `${p.fr} se dit ${p.ar} en arabe.`,
      });
    },
  })),
  // Calendrier
  {
    theme: 'calendrier', level: 2,
    make: () => {
      const i = rnd(12);
      return make({
        id: `m-rang-${i}`, theme: 'calendrier', level: 2,
        prompt: `Quel est le ${i === 0 ? '1er' : `${i + 1}ᵉ`} mois du calendrier hégirien ?`,
        answer: MONTHS[i],
        wrong: distractors(MONTHS, MONTHS[i]),
        explain: `${MONTHS[i]} est le ${i === 0 ? 'premier' : `${i + 1}ᵉ`} mois de l’année hégirienne.`,
      });
    },
  },
  {
    theme: 'calendrier', level: 3,
    make: () => {
      const i = rnd(12);
      const next = MONTHS[(i + 1) % 12];
      return make({
        id: `m-suite-${i}`, theme: 'calendrier', level: 3,
        prompt: `Quel mois vient juste après ${MONTHS[i]} ?`,
        answer: next,
        wrong: distractors(MONTHS.filter((m) => m !== MONTHS[i]), next),
        explain: `Après ${MONTHS[i]} vient ${next}.`,
      });
    },
  },
  // Prière : nombre d'unités
  {
    theme: 'priere', level: 1,
    make: () => {
      const p = pick(PRAYERS);
      return make({
        id: `r-${p.rakat}-${p.name}`, theme: 'priere', level: 1,
        prompt: `Combien d’unités (rak‘a) compte la prière obligatoire de ${p.name} ?`,
        answer: String(p.rakat),
        wrong: ['2', '3', '4', '5'].filter((x) => x !== String(p.rakat)).slice(0, 3),
        explain: `${p.name} : ${p.rakat} rak‘a. Au total, les cinq prières comptent 17 rak‘a par jour.`,
      });
    },
  },
];

/* ---------------- Banque rédigée ---------------- */

const BANK_Q: Question[] = BANK.map(([theme, level, prompt, answer, wrong, explain], i) => ({
  id: `b-${i}`, theme, level, prompt, answer, explain, options: [answer, ...wrong],
}));

/* ---------------- Mémoire du joueur ---------------- */

type Memory = { seen: Record<string, number>; wrong: string[] };
const MEM_KEY = 'ddr_quiz_memory_v1';
const loadMem = (): Memory => {
  try {
    const m = JSON.parse(localStorage.getItem(MEM_KEY) || '');
    if (m && typeof m === 'object' && m.seen && Array.isArray(m.wrong)) return m;
  } catch {
    /* mémoire indisponible */
  }
  return { seen: {}, wrong: [] };
};
const saveMem = (m: Memory) => {
  try {
    // On garde la mémoire légère
    const keys = Object.keys(m.seen);
    if (keys.length > 1500) keys.sort((a, b) => m.seen[a] - m.seen[b]).slice(0, keys.length - 1200).forEach((k) => delete m.seen[k]);
    localStorage.setItem(MEM_KEY, JSON.stringify({ seen: m.seen, wrong: m.wrong.slice(-60) }));
  } catch {
    /* stockage plein ou désactivé : le jeu continue sans mémoire */
  }
};

export type DeckOptions = { themes?: Theme[]; maxLevel?: 1 | 2 | 3 };

/** Un « paquet » infini : chaque appel à next() renvoie une nouvelle question. */
export function createDeck(initial: DeckOptions = {}) {
  let opts = { ...initial };
  const mem = loadMem();
  const recent: string[] = [];
  const review: { q: Question; due: number }[] = [];
  let count = 0;

  const allowed = (t: Theme, l: number) => (!opts.themes || opts.themes.includes(t)) && l <= (opts.maxLevel ?? 3);

  const fromBank = (avoidRecent = true) => {
    const pool = BANK_Q.filter((q) => allowed(q.theme, q.level) && !(avoidRecent && recent.includes(q.id)));
    if (!pool.length) return null;
    // Priorité aux questions jamais vues, puis aux plus anciennes
    const sorted = shuffle(pool).sort((a, b) => (mem.seen[a.id] || 0) - (mem.seen[b.id] || 0));
    const q = sorted[rnd(Math.min(6, sorted.length))];
    return { ...q, options: shuffle(q.options) };
  };
  const fromGen = () => {
    const gens = GENS.filter((g) => allowed(g.theme, g.level));
    if (!gens.length) return null;
    for (let t = 0; t < 12; t++) {
      const q = pick(gens).make();
      if (!recent.includes(q.id)) return q;
    }
    return pick(gens).make();
  };

  return {
    /** La difficulté peut monter en cours de partie. */
    setMaxLevel(l: 1 | 2 | 3) {
      opts = { ...opts, maxLevel: l };
    },
    next(): Question {
      count++;
      let q: Question | null = null;
      // 1. Une question ratée qui doit revenir ?
      const due = review.findIndex((r) => r.due <= count);
      if (due >= 0) {
        const r = review.splice(due, 1)[0].q;
        q = { ...r, options: shuffle(r.options) };
      }
      // 2. Sinon : moitié questions rédigées, moitié questions générées
      if (!q) q = Math.random() < 0.5 ? fromBank() || fromGen() : fromGen() || fromBank();
      // 3. Petit thème épuisé : on autorise une question récente, mais toujours dans le thème choisi
      if (!q) q = fromBank(false);
      if (!q) q = { ...BANK_Q[rnd(BANK_Q.length)] };
      recent.push(q.id);
      if (recent.length > 40) recent.shift();
      return q;
    },
    /** À appeler après chaque réponse. */
    record(q: Question, correct: boolean) {
      mem.seen[q.id] = Date.now();
      if (!correct) {
        // La question reviendra 4 à 7 questions plus tard, avec ses options mélangées
        review.push({ q, due: count + 4 + rnd(4) });
        if (!mem.wrong.includes(q.id)) mem.wrong.push(q.id);
      } else {
        mem.wrong = mem.wrong.filter((id) => id !== q.id);
      }
      saveMem(mem);
    },
  };
}

/** Nombre de questions différentes que le moteur peut produire (ordre de grandeur, pour l'affichage). */
export const QUESTION_COUNT = BANK_Q.length + SURAHS.length * 4 + LETTERS.length * 3 + NAMES.length * 2 + PROPHETS.length * 2 + 24 + PRAYERS.length;
