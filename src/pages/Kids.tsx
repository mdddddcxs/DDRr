import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, Check, RotateCcw, Sparkles, Star, Trophy, X } from 'lucide-react';
import { Container } from '../components/ui';
import { GOOD_DEEDS, LETTERS, PRAYERS_ORDER, QUIZ, type QuizQuestion } from '../data/kids';

const shuffle = <T,>(a: T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const store = {
  get: (k: string, d: any) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k: string, v: unknown) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  },
};

type Game = 'quiz' | 'memory' | 'prayers' | 'deeds';
const GAMES: { id: Game; title: string; text: string; emoji: string; color: string }[] = [
  { id: 'quiz', title: 'Le grand quiz', text: '8 questions sur l’Islam', emoji: '🧠', color: 'from-sky-500/30 to-sky-500/5 border-sky-400/30' },
  { id: 'memory', title: 'Mémo des lettres', text: 'Associe chaque lettre arabe à son nom', emoji: 'ب', color: 'from-emerald-500/30 to-emerald-500/5 border-emerald-400/30' },
  { id: 'prayers', title: 'Les 5 prières', text: 'Remets-les dans le bon ordre', emoji: '🕌', color: 'from-gold-400/30 to-gold-400/5 border-gold-300/30' },
  { id: 'deeds', title: 'Mes bonnes actions', text: 'Gagne des étoiles chaque jour', emoji: '⭐', color: 'from-pink-500/30 to-pink-500/5 border-pink-400/30' },
];

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------
const Quiz = () => {
  const newGame = () => shuffle(QUIZ).slice(0, 8);
  const [qs, setQs] = useState<QuizQuestion[]>(newGame);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => store.get('ddr_kids_quiz_best', 0));
  const done = i >= qs.length;
  const q = qs[i];

  useEffect(() => {
    if (done && score > best) {
      setBest(score);
      store.set('ddr_kids_quiz_best', score);
    }
  }, [done, score, best]);

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  };
  const restart = () => {
    setQs(newGame());
    setI(0);
    setPicked(null);
    setScore(0);
  };

  if (done) {
    const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
    return (
      <div className="text-center">
        <Trophy className="mx-auto h-16 w-16 text-gold-300" />
        <p className="mt-4 font-serif text-4xl font-semibold text-cream-50">{score} / {qs.length}</p>
        <div className="mt-3 flex justify-center gap-1">
          {[0, 1, 2].map((s) => (
            <Star key={s} className={`h-9 w-9 ${s < stars ? 'fill-gold-300 text-gold-300' : 'text-white/15'}`} />
          ))}
        </div>
        <p className="mt-4 text-lg text-cream-200">{score >= 7 ? 'Machâ’Allah, bravo champion !' : score >= 4 ? 'Très bien ! Encore un petit effort.' : 'Ce n’est pas grave, on apprend en jouant !'}</p>
        <p className="mt-1 text-sm text-sand-400">Ton meilleur score : {Math.max(best, score)} / 8</p>
        <button onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 font-bold text-white hover:bg-sky-400">
          <RotateCcw className="h-5 w-5" /> Rejouer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold text-sand-400">
        <span>Question {i + 1} / {qs.length}</span>
        <span className="flex items-center gap-1 text-gold-300"><Star className="h-4 w-4 fill-current" /> {score}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>
      <p className="mt-6 text-5xl" aria-hidden>{q.emoji}</p>
      <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug text-cream-50 md:text-3xl">{q.q}</h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.choices.map((c, k) => {
          const isRight = picked !== null && k === q.answer;
          const isWrong = picked === k && k !== q.answer;
          return (
            <button
              key={c}
              onClick={() => choose(k)}
              disabled={picked !== null}
              className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-lg font-bold transition ${
                isRight ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : isWrong ? 'border-red-400 bg-red-500/15 text-red-100' : 'border-white/10 bg-white/[0.03] text-cream-100 hover:border-sky-400/60 hover:bg-sky-500/10'
              }`}
            >
              {c}
              {isRight && <Check className="h-6 w-6" />}
              {isWrong && <X className="h-6 w-6" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-6 animate-fade-up rounded-2xl border border-white/10 bg-black/25 p-5">
          <p className="font-bold text-cream-50">{picked === q.answer ? '🎉 Bonne réponse !' : '💡 Presque ! La bonne réponse est : ' + q.choices[q.answer]}</p>
          <p className="mt-1 text-cream-200">{q.why}</p>
          <button
            onClick={() => {
              setI(i + 1);
              setPicked(null);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 font-bold text-white hover:bg-sky-400"
          >
            {i + 1 < qs.length ? 'Question suivante' : 'Voir mon score'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Jeu de mémoire : lettre arabe <-> nom
// ---------------------------------------------------------------------------
type Card = { id: number; pair: number; face: string; isLetter: boolean };
const Memory = () => {
  const deal = (): Card[] => {
    const picks = shuffle(LETTERS).slice(0, 6);
    return shuffle(picks.flatMap((l, p) => [
      { id: p * 2, pair: p, face: l.char, isLetter: true },
      { id: p * 2 + 1, pair: p, face: l.name, isLetter: false },
    ]));
  };
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const won = found.length === 6;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => cards.find((c) => c.id === id)!);
    const t = setTimeout(() => {
      if (a.pair === b.pair) setFound((f) => [...f, a.pair]);
      setOpen([]);
    }, a.pair === b.pair ? 350 : 900);
    return () => clearTimeout(t);
  }, [open, cards]);

  const flip = (c: Card) => {
    if (open.length >= 2 || open.includes(c.id) || found.includes(c.pair)) return;
    if (open.length === 1) setMoves((m) => m + 1);
    setOpen((o) => [...o, c.id]);
  };
  const restart = () => {
    setCards(deal());
    setOpen([]);
    setFound([]);
    setMoves(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold text-sand-400">
        <span>Paires trouvées : {found.length} / 6</span>
        <span>Coups : {moves}</span>
      </div>
      {won ? (
        <div className="py-10 text-center">
          <p className="text-6xl" aria-hidden>🏆</p>
          <p className="mt-4 font-serif text-3xl font-semibold text-cream-50">Bravo, tu as tout trouvé !</p>
          <p className="mt-2 text-sand-400">En {moves} coups. Peux-tu faire mieux ?</p>
          <button onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-400"><RotateCcw className="h-5 w-5" /> Nouvelle partie</button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {cards.map((c) => {
            const visible = open.includes(c.id) || found.includes(c.pair);
            return (
              <button
                key={c.id}
                onClick={() => flip(c)}
                aria-label={visible ? c.face : 'Carte cachée'}
                className={`grid aspect-square place-items-center rounded-2xl border-2 transition-all duration-300 ${
                  found.includes(c.pair) ? 'border-emerald-400/60 bg-emerald-500/15' : visible ? 'border-gold-300/60 bg-gold-400/10' : 'border-white/10 bg-gradient-to-br from-emerald-600/40 to-night-800 hover:scale-[1.03]'
                }`}
              >
                {visible ? (
                  <span className={c.isLetter ? 'font-arabic text-5xl text-cream-50' : 'text-xl font-extrabold text-cream-50'} lang={c.isLetter ? 'ar' : undefined}>{c.face}</span>
                ) : (
                  <Sparkles className="h-7 w-7 text-emerald-200/70" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Remettre les 5 prières dans l'ordre
// ---------------------------------------------------------------------------
const PrayerOrder = () => {
  const [pool, setPool] = useState(() => shuffle(PRAYERS_ORDER));
  const [chosen, setChosen] = useState<string[]>([]);
  const [wrong, setWrong] = useState('');
  const done = chosen.length === PRAYERS_ORDER.length;

  const pick = (name: string) => {
    if (name === PRAYERS_ORDER[chosen.length].name) {
      setChosen((c) => [...c, name]);
      setWrong('');
    } else {
      setWrong(name);
      setTimeout(() => setWrong(''), 600);
    }
  };

  return (
    <div>
      <p className="text-cream-200">Touche les prières dans l’ordre de la journée, de l’aube jusqu’à la nuit.</p>
      <ol className="mt-5 grid grid-cols-5 gap-2">
        {PRAYERS_ORDER.map((p, k) => (
          <li key={p.name} className={`grid h-20 place-items-center rounded-2xl border-2 border-dashed text-center ${chosen[k] ? 'border-gold-300/70 bg-gold-400/15' : 'border-white/15'}`}>
            {chosen[k] ? (
              <span><span className="block text-2xl" aria-hidden>{p.emoji}</span><span className="text-xs font-bold text-cream-50 sm:text-sm">{p.name}</span></span>
            ) : (
              <span className="text-lg font-bold text-white/20">{k + 1}</span>
            )}
          </li>
        ))}
      </ol>
      {done ? (
        <div className="mt-8 text-center">
          <p className="font-serif text-3xl font-semibold text-cream-50">Machâ’Allah, parfait ! 🎉</p>
          <p className="mt-2 text-sand-400">Fajr, Dhouhr, Asr, Maghrib et Icha : tu connais les 5 prières.</p>
          <button onClick={() => { setPool(shuffle(PRAYERS_ORDER)); setChosen([]); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-bold text-night-950"><RotateCcw className="h-5 w-5" /> Rejouer</button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {pool.filter((p) => !chosen.includes(p.name)).map((p) => (
            <button
              key={p.name}
              onClick={() => pick(p.name)}
              className={`rounded-2xl border-2 px-5 py-3 text-lg font-bold transition ${wrong === p.name ? 'translate-x-1 border-red-400 bg-red-500/15 text-red-100' : 'border-white/10 bg-white/[0.04] text-cream-50 hover:border-gold-300/60'}`}
            >
              {p.name}
              <span className="block text-xs font-medium text-sand-400">{p.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Bonnes actions du jour (sauvegardées sur l'appareil)
// ---------------------------------------------------------------------------
const Deeds = () => {
  const today = new Date().toDateString();
  const [state, setState] = useState<{ day: string; done: string[]; total: number }>(() => {
    const s = store.get('ddr_kids_deeds', { day: today, done: [], total: 0 });
    return s.day === today ? s : { day: today, done: [], total: s.total || 0 };
  });
  useEffect(() => {
    store.set('ddr_kids_deeds', state);
  }, [state]);
  const toggle = (id: string) =>
    setState((s) => {
      const has = s.done.includes(id);
      return { ...s, done: has ? s.done.filter((d) => d !== id) : [...s.done, id], total: s.total + (has ? -1 : 1) };
    });

  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl bg-pink-500/10 p-4">
        <span className="font-bold text-cream-50">Aujourd’hui : {state.done.length} / {GOOD_DEEDS.length}</span>
        <span className="flex items-center gap-1 font-bold text-gold-300"><Star className="h-5 w-5 fill-current" /> {state.total} étoiles au total</span>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {GOOD_DEEDS.map((d) => {
          const on = state.done.includes(d.id);
          return (
            <li key={d.id}>
              <button onClick={() => toggle(d.id)} aria-pressed={on} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition ${on ? 'border-pink-300/70 bg-pink-500/15 text-cream-50' : 'border-white/10 text-cream-200 hover:border-pink-300/40'}`}>
                <span className="text-2xl" aria-hidden>{d.emoji}</span>
                <span className="flex-1">{d.label}</span>
                <span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${on ? 'border-gold-300 bg-gold-300 text-night-950' : 'border-white/20'}`}>{on && <Star className="h-4 w-4 fill-current" />}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {state.done.length === GOOD_DEEDS.length && <p className="mt-5 text-center font-serif text-2xl text-gold-200">Quelle belle journée ! Qu’Allah te récompense 🤲</p>}
    </div>
  );
};

const Kids = () => {
  const [game, setGame] = useState<Game>('quiz');
  const current = useMemo(() => GAMES.find((g) => g.id === game)!, [game]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-[90px]" aria-hidden />
      <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-pink-500/15 blur-[90px]" aria-hidden />
      <Container className="relative pb-10 pt-12 md:pt-16">
        <header className="text-center">
          <p className="text-5xl" aria-hidden>🌙⭐📚</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-cream-50 md:text-6xl">L’espace des petits musulmans</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-sand-400">Apprendre l’Islam en s’amusant : quiz, jeux de lettres arabes et bonnes actions du jour.</p>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label="Jeux">
          {GAMES.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={game === g.id}
              onClick={() => setGame(g.id)}
              className={`rounded-3xl border bg-gradient-to-br p-4 text-left transition md:p-5 ${g.color} ${game === g.id ? 'scale-[1.02] ring-2 ring-white/40' : 'opacity-80 hover:opacity-100'}`}
            >
              <span className={`block text-3xl ${g.id === 'memory' ? 'font-arabic' : ''}`} aria-hidden>{g.emoji}</span>
              <span className="mt-2 block font-extrabold text-cream-50">{g.title}</span>
              <span className="block text-xs text-cream-200/80 md:text-sm">{g.text}</span>
            </button>
          ))}
        </div>

        <section className="card mx-auto mt-8 max-w-3xl p-6 md:p-10" role="tabpanel" aria-label={current.title}>
          <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-semibold text-cream-50">
            <Brain className="h-6 w-6 text-sky-300" /> {current.title}
          </h2>
          {game === 'quiz' && <Quiz />}
          {game === 'memory' && <Memory />}
          {game === 'prayers' && <PrayerOrder />}
          {game === 'deeds' && <Deeds />}
        </section>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-sand-500">
          Parents : tout se passe sur cet appareil, sans compte ni publicité. Pour aller plus loin, lisez ensemble les histoires du Prophète ﷺ dans le Centre du savoir.
        </p>
      </Container>
    </div>
  );
};

export default Kids;
