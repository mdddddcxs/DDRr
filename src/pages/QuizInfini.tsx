// Le Grand Quiz : un quiz islamique infini, en trois modes.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Flame, Heart, RotateCcw, Share2, Target, Timer, Trophy, X, Sparkles, BookOpen } from 'lucide-react';
import { Container } from '../components/ui';
import { THEMES, type Theme } from '../data/quiz/bank';
import { createDeck, QUESTION_COUNT, type Question } from '../data/quiz/engine';
import { rubriqueVars } from '../lib/rubriques';
import { trackEvent } from '../lib/analytics';

type Mode = 'marathon' | 'chrono' | 'entrainement';

/* ---------------- Progression enregistrée sur l'appareil ---------------- */

type Stats = { best: Record<Mode, number>; answered: number; correct: number; xp: number };
const STATS_KEY = 'ddr_quiz_stats_v1';
const emptyStats: Stats = { best: { marathon: 0, chrono: 0, entrainement: 0 }, answered: 0, correct: 0, xp: 0 };
const loadStats = (): Stats => {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY) || '');
    if (s && typeof s === 'object' && s.best) return { ...emptyStats, ...s, best: { ...emptyStats.best, ...s.best } };
  } catch {
    /* rien d'enregistré */
  }
  return emptyStats;
};
const saveStats = (s: Stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible */
  }
};

const RANKS = [
  { xp: 0, title: 'Débutant', icon: '🌱' },
  { xp: 100, title: 'Apprenti', icon: '📗' },
  { xp: 300, title: 'Étudiant', icon: '🎓' },
  { xp: 800, title: 'Chercheur de savoir', icon: '🔎' },
  { xp: 2000, title: 'Savant en herbe', icon: '🌟' },
  { xp: 5000, title: 'Érudit', icon: '💎' },
];
const rankOf = (xp: number) => {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  return { ...RANKS[i], next: RANKS[i + 1], index: i };
};

const buzz = (ms: number | number[]) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* pas de vibration */
  }
};

/* ---------------- Écran d'accueil du quiz ---------------- */

const ModeCard = ({ icon: Icon, title, text, onClick, tag }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; onClick: () => void; tag: string }) => (
  <button onClick={onClick} className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-white p-5 text-left shadow-[0_20px_44px_-30px_rgba(20,36,74,0.55)] ring-1 ring-ink-900/[0.06] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_var(--r-to)] sm:p-6">
    <span className="r-grad grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-lg transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
      <Icon className="h-7 w-7" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="r-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">{tag}</span>
      <span className="mt-0.5 block font-serif text-2xl font-semibold text-ink-900">{title}</span>
      <span className="mt-1 block text-[15px] leading-snug text-ink-500">{text}</span>
    </span>
    <ArrowRight className="r-ink h-6 w-6 shrink-0 transition group-hover:translate-x-1" />
  </button>
);

const Menu = ({ stats, onStart }: { stats: Stats; onStart: (m: Mode, themes?: Theme[]) => void }) => {
  const [picking, setPicking] = useState(false);
  const [chosen, setChosen] = useState<Theme[]>([]);
  const rank = rankOf(stats.xp);
  const pct = rank.next ? Math.round(((stats.xp - rank.xp) / (rank.next.xp - rank.xp)) * 100) : 100;
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Profil du joueur */}
      <div className="r-grad relative overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_30px_60px_-30px_var(--r-to)] sm:p-8">
        <div className="absolute inset-0 bg-pattern opacity-20 mix-blend-overlay" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-4xl ring-1 ring-white/40">{rank.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/80">Votre rang</p>
            <p className="font-serif text-3xl font-semibold">{rank.title}</p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-white/80">{rank.next ? `${stats.xp} / ${rank.next.xp} points avant « ${rank.next.title} »` : `${stats.xp} points : rang maximal, mâ shâ Allah !`}</p>
          </div>
        </div>
        <dl className="relative mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            ['Record marathon', stats.best.marathon],
            ['Record 60 s', stats.best.chrono],
            ['Réussite', `${accuracy}%`],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl bg-white/15 px-2 py-3">
              <dd className="font-display text-2xl font-bold">{v}</dd>
              <dt className="text-[11px] font-semibold text-white/80">{k}</dt>
            </div>
          ))}
        </dl>
      </div>

      {!picking ? (
        <div className="mt-6 grid gap-3">
          <ModeCard tag="Infini" icon={Heart} title="Marathon" text="Trois vies, des questions sans fin, de plus en plus difficiles. Jusqu’où irez-vous ?" onClick={() => onStart('marathon')} />
          <ModeCard tag="Rapidité" icon={Timer} title="Défi 60 secondes" text="Un maximum de bonnes réponses en une minute." onClick={() => onStart('chrono')} />
          <ModeCard tag="À votre rythme" icon={Target} title="Entraînement" text="Choisissez vos thèmes, prenez le temps de lire chaque explication." onClick={() => setPicking(true)} />
        </div>
      ) : (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_20px_44px_-30px_rgba(20,36,74,0.55)] ring-1 ring-ink-900/[0.06]">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">Choisissez vos thèmes</h2>
          <p className="mt-1 text-sm text-ink-500">Aucun thème choisi = tous les thèmes.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {THEMES.map((t) => {
              const on = chosen.includes(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => setChosen((c) => (on ? c.filter((x) => x !== t.key) : [...c, t.key]))}
                  aria-pressed={on}
                  className={`rounded-full px-4 py-2.5 text-[15px] font-semibold transition ${on ? 'r-grad text-white shadow-md' : 'bg-ivory-200 text-ink-800 hover:bg-ivory-300'}`}
                >
                  <span aria-hidden>{t.emoji}</span> {t.label}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button onClick={() => onStart('entrainement', chosen.length ? chosen : undefined)} className="r-grad inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-white shadow-lg">
              Commencer <ArrowRight className="h-5 w-5" />
            </button>
            <button onClick={() => setPicking(false)} className="rounded-full border border-ink-900/15 px-6 py-4 font-bold text-ink-800">Retour</button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-ink-500">
        Plus de {Math.floor(QUESTION_COUNT / 50) * 50} questions différentes, sur {THEMES.length} thèmes. Vos questions ratées reviennent pour que vous les reteniez.
      </p>
    </div>
  );
};

/* ---------------- Partie ---------------- */

type Answer = { q: Question; chosen: string; ok: boolean };
const LETTERS_ABCD = ['A', 'B', 'C', 'D'];

const Game = ({ mode, themes, onEnd, onQuit }: { mode: Mode; themes?: Theme[]; onEnd: (score: number, answers: Answer[]) => void; onQuit: () => void }) => {
  const deck = useMemo(() => createDeck({ themes, maxLevel: mode === 'entrainement' ? 3 : 1 }), [mode, themes]);
  const [q, setQ] = useState<Question>(() => deck.next());
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pop, setPop] = useState<string | null>(null);
  const ended = useRef(false);
  const nextBtn = useRef<HTMLButtonElement>(null);

  const finish = useCallback(
    (finalScore: number, list: Answer[]) => {
      if (ended.current) return;
      ended.current = true;
      onEnd(finalScore, list);
    },
    [onEnd],
  );

  // Chronomètre du défi 60 s
  useEffect(() => {
    if (mode !== 'chrono') return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [mode]);
  useEffect(() => {
    if (mode === 'chrono' && timeLeft === 0) finish(score, answers);
  }, [mode, timeLeft, score, answers, finish]);

  const goNext = useCallback(() => {
    if (mode === 'marathon' && lives <= 0) return finish(score, answers);
    const correctCount = answers.filter((a) => a.ok).length;
    if (mode === 'marathon') deck.setMaxLevel(correctCount >= 20 ? 3 : correctCount >= 8 ? 2 : 1);
    if (mode === 'chrono') deck.setMaxLevel(correctCount >= 10 ? 2 : 1);
    setQ(deck.next());
    setChosen(null);
  }, [mode, lives, score, answers, deck, finish]);

  const answer = (opt: string) => {
    if (chosen) return;
    const ok = opt === q.answer;
    setChosen(opt);
    deck.record(q, ok);
    const list = [...answers, { q, chosen: opt, ok }];
    setAnswers(list);
    if (ok) {
      const gain = Math.round(q.level * 10 * Math.min(2, 1 + streak * 0.1));
      setScore((s) => s + gain);
      setStreak((s) => s + 1);
      setPop(`+${gain}`);
      buzz(25);
    } else {
      setStreak(0);
      setPop(null);
      buzz([60, 40, 60]);
      if (mode === 'marathon') setLives((l) => l - 1);
    }
    // En défi 60 s, on enchaîne tout seul
    if (mode === 'chrono') {
      deck.setMaxLevel(list.filter((a) => a.ok).length >= 10 ? 2 : 1);
      setTimeout(() => {
        if (ended.current) return;
        setQ(deck.next());
        setChosen(null);
      }, ok ? 450 : 1100);
    }
  };

  useEffect(() => {
    if (chosen && mode !== 'chrono') nextBtn.current?.focus();
  }, [chosen, mode]);

  // Clavier : 1-4 pour répondre, Entrée pour continuer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!chosen && n >= 1 && n <= q.options.length) answer(q.options[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const theme = THEMES.find((t) => t.key === q.theme);
  const wasWrong = chosen && chosen !== q.answer;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Barre de jeu */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onQuit} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-ink-700 shadow-sm ring-1 ring-ink-900/[0.06]">
          <ArrowLeft className="h-4 w-4" /> Quitter
        </button>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <span key={streak} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-bold text-brand-800 animate-fade-up">
              <Flame className="h-4 w-4 text-brand-600" /> {streak}
            </span>
          )}
          {mode === 'marathon' && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-ink-900/[0.06]" aria-label={`${lives} vies restantes`}>
              {[0, 1, 2].map((i) => (
                <Heart key={i} className={`h-4 w-4 transition ${i < lives ? 'fill-red-500 text-red-500' : 'text-ink-400/40'}`} />
              ))}
            </span>
          )}
          <span className="r-grad relative rounded-full px-4 py-1.5 font-display text-lg font-bold text-white shadow-md">
            {score}
            {pop && <span key={answers.length} className="absolute -top-6 right-1 text-sm font-bold text-[var(--r-ink)] animate-fade-up">{pop}</span>}
          </span>
        </div>
      </div>
      {mode === 'chrono' && (
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-ivory-300" role="timer" aria-label={`${timeLeft} secondes restantes`}>
          <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'r-grad'}`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
        </div>
      )}

      {/* Question */}
      <div key={q.id + answers.length} className={`rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-36px_rgba(20,36,74,0.6)] ring-1 ring-ink-900/[0.06] animate-fade-up sm:p-8 ${wasWrong ? 'animate-[shake_0.4s]' : ''}`}>
        <div className="flex items-center justify-between gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em]">
          <span className="r-ink">{theme?.emoji} {theme?.label}</span>
          <span className="text-ink-400">{'★'.repeat(q.level)}{'☆'.repeat(3 - q.level)}</span>
        </div>
        <h2 className="mt-4 font-serif text-[1.6rem] font-semibold leading-snug text-ink-900 sm:text-3xl">{q.prompt}</h2>
        {q.arabic && (
          <p className="mt-5 rounded-2xl bg-ivory-100 py-5 text-center font-arabic text-6xl leading-none text-ink-900" lang="ar" dir="rtl">{q.arabic}</p>
        )}

        <div className={`mt-6 grid gap-2.5 ${q.options.length === 2 ? 'sm:grid-cols-2' : ''}`}>
          {q.options.map((opt, i) => {
            const isAnswer = opt === q.answer;
            const isChosen = opt === chosen;
            const state = !chosen ? 'idle' : isAnswer ? 'right' : isChosen ? 'wrong' : 'dim';
            const isArabic = /[؀-ۿ]/.test(opt) && opt.length <= 3;
            return (
              <button
                key={opt}
                onClick={() => answer(opt)}
                disabled={!!chosen}
                className={`group flex min-h-[3.6rem] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[16px] font-semibold transition duration-300 ${
                  state === 'idle'
                    ? 'border-ink-900/10 bg-ivory-50 text-ink-900 hover:-translate-y-0.5 hover:border-[var(--r-from)] hover:bg-[var(--r-soft)]'
                    : state === 'right'
                      ? 'scale-[1.02] border-emerald-500 bg-emerald-50 text-emerald-900'
                      : state === 'wrong'
                        ? 'border-red-400 bg-red-50 text-red-900'
                        : 'border-ink-900/5 bg-ivory-50 text-ink-400 opacity-60'
                }`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${state === 'right' ? 'bg-emerald-500 text-white' : state === 'wrong' ? 'bg-red-500 text-white' : 'r-soft r-ink'}`}>
                  {state === 'right' ? <Check className="h-4 w-4" /> : state === 'wrong' ? <X className="h-4 w-4" /> : LETTERS_ABCD[i]}
                </span>
                <span className={isArabic ? 'font-arabic text-3xl' : ''}>{opt}</span>
              </button>
            );
          })}
        </div>

        {chosen && mode !== 'chrono' && (
          <div className="mt-6 animate-fade-up">
            <div className={`rounded-2xl p-4 ${wasWrong ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <p className={`font-bold ${wasWrong ? 'text-red-800' : 'text-emerald-800'}`}>{wasWrong ? `La bonne réponse : ${q.answer}` : pick(['Bravo !', 'Excellent !', 'Mâ shâ Allah !', 'Bien joué !', 'Parfait !'])}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-700">{q.explain}</p>
            </div>
            <button ref={nextBtn} onClick={goNext} className="r-grad mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105">
              {mode === 'marathon' && lives <= 0 ? 'Voir mon résultat' : 'Question suivante'} <ArrowRight className="h-5 w-5" />
            </button>
            {mode === 'entrainement' && (
              <button onClick={() => finish(score, answers)} className="mt-2 w-full rounded-full py-2 text-sm font-bold text-ink-500 hover:text-ink-900">Terminer l’entraînement</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/* ---------------- Résultat ---------------- */

const Confetti = () => (
  <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
    {Array.from({ length: 40 }).map((_, i) => (
      <span
        key={i}
        className="absolute top-[-5%] h-3 w-2 rounded-sm"
        style={{
          left: `${(i * 37) % 100}%`,
          background: ['#F79A1E', '#E8B43A', '#1BA3A0', '#E0485E', '#5468D4', '#9A5BC4'][i % 6],
          animation: `confetti ${2.2 + (i % 5) * 0.4}s ${(i % 8) * 0.12}s ease-in forwards`,
        }}
      />
    ))}
  </div>
);

const Result = ({ mode, score, answers, record, onReplay, onMenu }: { mode: Mode; score: number; answers: Answer[]; record: boolean; onReplay: () => void; onMenu: () => void }) => {
  const good = answers.filter((a) => a.ok).length;
  const missed = answers.filter((a) => !a.ok);
  const share = `J’ai fait ${score} points (${good} bonnes réponses) au Grand Quiz de la DDR ! Saurez-vous faire mieux ? https://la-ddr.vercel.app/apprendre/quiz`;
  return (
    <div className="mx-auto max-w-2xl text-center">
      {record && score > 0 && <Confetti />}
      <div className="r-grad relative overflow-hidden rounded-[2rem] px-6 py-10 text-white shadow-[0_30px_60px_-30px_var(--r-to)]">
        <div className="absolute inset-0 bg-pattern opacity-20 mix-blend-overlay" aria-hidden />
        <Trophy className="relative mx-auto h-14 w-14 animate-float" />
        <p className="relative mt-4 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white/85">{record && score > 0 ? 'Nouveau record !' : mode === 'chrono' ? 'Temps écoulé' : 'Partie terminée'}</p>
        <p className="relative font-display text-7xl font-bold">{score}</p>
        <p className="relative mt-2 text-white/90">{good} bonne{good > 1 ? 's' : ''} réponse{good > 1 ? 's' : ''} sur {answers.length}</p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button onClick={onReplay} className="r-grad inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-white shadow-lg"><RotateCcw className="h-5 w-5" /> Rejouer</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 font-bold text-white shadow-lg"><Share2 className="h-5 w-5" /> Défier un ami</a>
        <button onClick={onMenu} className="rounded-full border border-ink-900/15 bg-white px-6 py-4 font-bold text-ink-900">Autre mode</button>
      </div>

      {missed.length > 0 && (
        <div className="mt-8 text-left">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink-900"><BookOpen className="r-ink h-6 w-6" /> À retenir</h2>
          <p className="mt-1 text-sm text-ink-500">Ces questions reviendront dans vos prochaines parties.</p>
          <ul className="mt-4 space-y-2.5">
            {missed.slice(0, 10).map((a, i) => (
              <li key={i} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-900/[0.06]">
                <p className="font-semibold text-ink-900">{a.q.prompt} {a.q.arabic && <span className="font-arabic text-2xl">{a.q.arabic}</span>}</p>
                <p className="mt-1 text-sm"><span className="font-bold text-emerald-700">✓ {a.q.answer}</span> <span className="text-ink-400">· votre réponse : {a.chosen}</span></p>
                <p className="mt-1 text-sm text-ink-500">{a.q.explain}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ---------------- Page ---------------- */

const QuizInfini = () => {
  const [stats, setStats] = useState<Stats>(loadStats);
  const [screen, setScreen] = useState<'menu' | 'play' | 'result'>('menu');
  const [mode, setMode] = useState<Mode>('marathon');
  const [themes, setThemes] = useState<Theme[] | undefined>();
  const [gameId, setGameId] = useState(0);
  const [result, setResult] = useState<{ score: number; answers: Answer[]; record: boolean } | null>(null);

  const start = (m: Mode, t?: Theme[]) => {
    trackEvent('quiz_partie');
    setMode(m);
    setThemes(t);
    setGameId((g) => g + 1);
    setScreen('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const end = useCallback(
    (score: number, answers: Answer[]) => {
      const prev = loadStats();
      const record = score > (prev.best[mode] || 0);
      const correct = answers.filter((a) => a.ok).length;
      const next: Stats = {
        best: { ...prev.best, [mode]: Math.max(prev.best[mode] || 0, score) },
        answered: prev.answered + answers.length,
        correct: prev.correct + correct,
        xp: prev.xp + correct * 5 + Math.round(score / 10),
      };
      saveStats(next);
      setStats(next);
      setResult({ score, answers, record });
      setScreen('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [mode],
  );

  return (
    <div style={rubriqueVars('apprendre')} className="relative min-h-[80vh] overflow-hidden pb-16">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#fbf0d2] to-transparent" aria-hidden />
      <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold-300/30 blur-3xl animate-drift" aria-hidden />
      <Container className="relative pt-6">
        {screen === 'menu' && (
          <>
            <nav className="mb-6 flex items-center gap-1 text-sm font-semibold text-ink-500">
              <Link to="/apprendre" className="hover:text-ink-900">Apprendre</Link> <span>›</span> <span className="r-ink">Le Grand Quiz</span>
            </nav>
            <div className="mb-8 text-center">
              <span className="r-grad mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg animate-float"><Sparkles className="h-8 w-8" /></span>
              <h1 className="mt-5 font-serif text-4xl font-semibold text-ink-900 md:text-6xl">Le Grand Quiz</h1>
              <p className="mx-auto mt-3 max-w-lg text-lg text-ink-500">Testez et enrichissez vos connaissances sur l’Islam. Des questions sans fin, pour petits et grands.</p>
            </div>
            <Menu stats={stats} onStart={start} />
          </>
        )}
        {screen === 'play' && <Game key={gameId} mode={mode} themes={themes} onEnd={end} onQuit={() => setScreen('menu')} />}
        {screen === 'result' && result && (
          <Result mode={mode} score={result.score} answers={result.answers} record={result.record} onReplay={() => start(mode, themes)} onMenu={() => setScreen('menu')} />
        )}
      </Container>
    </div>
  );
};

export default QuizInfini;
