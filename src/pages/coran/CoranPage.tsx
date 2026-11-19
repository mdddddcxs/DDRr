// Rubrique « Le Coran » : la plus soignée du site.
// Quatre activités : lire et écouter, apprendre une sourate, alphabet et lecture, ma khatma.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Flame, GraduationCap, Headphones, Lightbulb, Pause, Play, RefreshCw, RotateCcw, Sparkles, Trophy, Type } from 'lucide-react';
import { Container } from '../../components/ui';
import { SURAHS } from '../../data/quiz/datasets';
import { rubriqueVars } from '../../lib/rubriques';
import Lecteur, { type Source } from './Lecteur';
import Memoriser from './Memoriser';
import Alphabet from './Alphabet';
import { JUZ_START, VERSES_OF_DAY, store, surahInfo } from './quranApi';

type Tab = 'lire' | 'apprendre' | 'alphabet' | 'khatma';
const TABS: { k: Tab; label: string; short: string; icon: React.ComponentType<{ className?: string }>; text: string }[] = [
  { k: 'lire', label: 'Lire & écouter', short: 'Lire', icon: Headphones, text: 'Les 114 sourates, récitées verset par verset' },
  { k: 'apprendre', label: 'Apprendre une sourate', short: 'Apprendre', icon: GraduationCap, text: 'Une voix vous guide pour mémoriser' },
  { k: 'alphabet', label: 'Alphabet & lecture', short: 'Alphabet', icon: Type, text: 'Lettres, voyelles, premiers mots' },
  { k: 'khatma', label: 'Ma khatma', short: 'Khatma', icon: Trophy, text: 'Lire tout le Coran, juz après juz' },
];

const FACTS = [
  'Le Coran compte 114 sourates et 6 236 versets.',
  'Il a été révélé au Prophète ﷺ sur une période d’environ 23 ans.',
  'Le premier mot révélé est « Iqra’ » : « Lis ! » (sourate Al-‘Alaq).',
  'La plus longue sourate est Al-Baqara (286 versets), la plus courte Al-Kawthar (3 versets).',
  'Il est divisé en 30 parties (juz’), ce qui permet de le lire en entier en un mois.',
  'Celui qui l’apprend en entier par cœur est appelé hâfidh.',
  'Al-Fâtiha, « l’Ouverture », est récitée dans chaque unité de la prière.',
  'La sourate At-Tawba est la seule qui ne commence pas par « Bismillah ».',
];

const globalNumber = (s: number, a: number) => SURAHS.slice(0, s - 1).reduce((t, x) => t + x.ayat, 0) + a;

/* ---------------- En-tête : ciel étoilé ---------------- */

const Etoiles = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {Array.from({ length: 46 }).map((_, i) => (
      <span
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          left: `${(i * 61) % 100}%`,
          top: `${(i * 37) % 85}%`,
          width: i % 7 === 0 ? 3 : 2,
          height: i % 7 === 0 ? 3 : 2,
          animation: `scintille ${2.5 + (i % 5)}s ease-in-out ${(i % 9) * 0.4}s infinite`,
        }}
      />
    ))}
  </div>
);

const VersetDuJour = () => {
  const v = VERSES_OF_DAY[Math.floor(Date.now() / 864e5) % VERSES_OF_DAY.length];
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!audio.current) {
      audio.current = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNumber(v.s, v.a)}.mp3`);
      audio.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else audio.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  useEffect(() => () => audio.current?.pause(), []);
  return (
    <div className="relative mx-auto mt-10 max-w-2xl rounded-3xl border border-gold-300/30 bg-white/[0.06] p-6 backdrop-blur-md animate-fade-up [animation-delay:400ms]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-300">Verset du jour</p>
      <p className="mt-3 font-quran text-3xl leading-loose text-white md:text-4xl" dir="rtl" lang="ar">{v.ar}</p>
      <p className="mt-2 font-serif text-lg italic text-white/85">« {v.fr} »</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="text-sm text-white/60">{surahInfo(v.s).name}, {v.s}:{v.a}</span>
        <button onClick={toggle} className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-bold text-[#071a2b]">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} Écouter
        </button>
      </div>
    </div>
  );
};

const Hero = () => (
  <header className="relative -mt-[84px] overflow-hidden pt-[84px] text-center text-white">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#1f5f7d_0%,#0F3B52_38%,#071a2b_80%)]" aria-hidden />
    <Etoiles />
    <svg viewBox="0 0 400 400" className="absolute left-1/2 top-[44%] w-[min(130vw,58rem)] -translate-x-1/2 -translate-y-1/2 text-gold-300/15 animate-spin-slow" aria-hidden>
      <g fill="none" stroke="currentColor">
        {Array.from({ length: 16 }).map((_, i) => <rect key={i} x="80" y="80" width="240" height="240" transform={`rotate(${i * 5.625} 200 200)`} />)}
        <circle cx="200" cy="200" r="196" />
      </g>
    </svg>
    <Container className="relative pb-24 pt-10 md:pb-28 md:pt-16">
      <nav aria-label="Fil d’Ariane" className="mb-6 text-sm font-semibold text-white/60 animate-fade-up">
        <Link to="/" className="hover:text-white">Accueil</Link> › <Link to="/apprendre" className="hover:text-white">Apprendre</Link> › <span className="text-white">Le Coran</span>
      </nav>
      <p className="font-quran text-6xl leading-tight text-gradient-gold md:text-8xl" lang="ar">القرآن الكريم</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold animate-word md:text-6xl">Le Noble Coran</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-white/75 animate-fade-up [animation-delay:200ms]">Lire, écouter, apprendre par cœur et découvrir l’écriture arabe, à votre rythme, guidé par les plus belles voix.</p>
      <dl className="mx-auto mt-7 flex max-w-md justify-center gap-3 animate-fade-up [animation-delay:300ms]">
        {[['114', 'sourates'], ['6 236', 'versets'], ['30', 'juz']].map(([v, k]) => (
          <div key={k} className="flex-1 rounded-2xl bg-white/[0.07] px-3 py-3 ring-1 ring-white/10">
            <dd className="font-display text-2xl font-bold text-gold-200">{v}</dd>
            <dt className="text-xs font-semibold text-white/60">{k}</dt>
          </div>
        ))}
      </dl>
      <VersetDuJour />
    </Container>
    <div className="absolute -bottom-px left-0 right-0 h-14 bg-ivory-100 [clip-path:ellipse(70%_100%_at_50%_100%)]" aria-hidden />
  </header>
);

/* ---------------- Ma khatma (compacte) ---------------- */

const Khatma = ({ done, setDone, open }: { done: number[]; setDone: (d: number[]) => void; open: (juz: number) => void }) => {
  const stats = store.get('ddr_khatma_stats', { khatmas: 0 });
  const next = Array.from({ length: 30 }, (_, i) => i + 1).find((n) => !done.includes(n)) || 1;
  const pct = Math.round((done.length / 30) * 100);
  const toggle = (n: number) => setDone(done.includes(n) ? done.filter((x) => x !== n) : [...done, n].sort((a, b) => a - b));
  const restart = () => {
    if (!confirm('Recommencer une nouvelle khatma ? Votre progression actuelle sera remise à zéro.')) return;
    if (done.length === 30) store.set('ddr_khatma_stats', { khatmas: stats.khatmas + 1 });
    setDone([]);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="rounded-[2rem] bg-gradient-to-br from-[#0F3B52] to-[#071a2b] p-7 text-center text-white">
        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="url(#kg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 326.7} 326.7`} className="transition-all duration-700" />
            <defs><linearGradient id="kg"><stop offset="0" stopColor="#E9CC7A" /><stop offset="1" stopColor="#2A8FA8" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div><p className="font-display text-4xl font-bold">{done.length}<span className="text-xl text-white/50">/30</span></p><p className="text-xs text-white/60">juz lus</p></div>
          </div>
        </div>
        <p className="mt-4 font-serif text-2xl font-semibold">{done.length === 30 ? 'Khatma terminée, mâ shâ Allah !' : `Prochain : juz ${next}`}</p>
        <p className="text-sm text-white/60">{stats.khatmas > 0 ? `${stats.khatmas} khatma${stats.khatmas > 1 ? 's' : ''} complète${stats.khatmas > 1 ? 's' : ''}` : 'Un juz par jour : le Coran en un mois'}</p>
        <div className="mt-5 flex flex-col gap-2">
          {done.length < 30 && <button onClick={() => open(next)} className="rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-6 py-3.5 font-bold text-[#071a2b]">Lire le juz {next}</button>}
          {done.length > 0 && <button onClick={restart} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white/70 hover:text-white"><RotateCcw className="h-4 w-4" /> Nouvelle khatma</button>}
        </div>
      </div>
      <div>
        <p className="text-sm text-ink-500">Touchez un juz pour le lire ; cochez-le quand il est terminé.</p>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {JUZ_START.map(([s, a], i) => {
            const n = i + 1;
            const ok = done.includes(n);
            return (
              <div key={n} className={`group relative rounded-2xl p-2 text-center transition ${ok ? 'bg-gradient-to-br from-[#2A8FA8] to-[#0F3B52] text-white' : n === next ? 'bg-white ring-2 ring-gold-400' : 'bg-white ring-1 ring-ink-900/[0.07]'}`}>
                <button onClick={() => open(n)} className="block w-full" aria-label={`Lire le juz ${n}`}>
                  <span className="block font-display text-lg font-bold">{n}</span>
                  <span className={`block truncate text-[10px] ${ok ? 'text-white/70' : 'text-ink-400'}`}>{SURAHS[s - 1].name.replace(/^(Al|An|Ar|As|At|Ash|Adh|Az)-/, '')}</span>
                </button>
                <button onClick={() => toggle(n)} aria-label={ok ? `Décocher le juz ${n}` : `Marquer le juz ${n} comme lu`} className={`absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${ok ? 'bg-gold-400 text-[#071a2b]' : 'bg-ivory-200 text-ink-400 opacity-70 group-hover:opacity-100'}`}>✓</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

const CoranPage = () => {
  const initial = (): Tab => {
    const m = new URLSearchParams(window.location.search).get('mode');
    return (['lire', 'apprendre', 'alphabet', 'khatma'] as Tab[]).includes(m as Tab) ? (m as Tab) : 'lire';
  };
  const [tab, setTab] = useState<Tab>(initial);
  const last = store.get<{ kind: 'surah' | 'juz'; n: number; surah: number; ayah: number } | null>('ddr_coran_last', null);
  const [source, setSource] = useState<Source>(() => (last ? { kind: last.kind, n: last.n } : { kind: 'surah', n: 1 }));
  const [done, setDoneState] = useState<number[]>(() => store.get('ddr_khatma_done', []));
  const [fact, setFact] = useState(() => Math.floor(Math.random() * FACTS.length));
  const panel = useRef<HTMLDivElement>(null);
  const setDone = (d: number[]) => {
    setDoneState(d);
    store.set('ddr_khatma_done', d);
  };
  const choose = (t: Tab) => {
    setTab(t);
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={rubriqueVars('coran')}>
      <Hero />

      {/* Les quatre activités */}
      <section className="relative z-10 -mt-12">
        <Container>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TABS.map(({ k, label, icon: Icon, text }) => (
              <button key={k} onClick={() => choose(k)} aria-pressed={tab === k} className={`group flex flex-col items-start rounded-3xl p-4 text-left transition duration-500 sm:p-5 ${tab === k ? 'bg-gradient-to-br from-[#2A8FA8] to-[#0F3B52] text-white shadow-[0_30px_60px_-30px_rgba(15,59,82,0.9)]' : 'bg-white shadow-[0_20px_44px_-34px_rgba(15,59,82,0.7)] ring-1 ring-ink-900/[0.06] hover:-translate-y-1'}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-2xl transition group-hover:rotate-[-6deg] ${tab === k ? 'bg-white/15 text-gold-200' : 'bg-[#E2F0F4] text-[#0F3B52]'}`}><Icon className="h-5 w-5" /></span>
                <span className={`mt-3 font-serif text-lg font-semibold leading-tight sm:text-xl ${tab === k ? 'text-white' : 'text-ink-900'}`}>{label}</span>
                <span className={`mt-1 hidden text-sm sm:block ${tab === k ? 'text-white/75' : 'text-ink-500'}`}>{text}</span>
              </button>
            ))}
          </div>

          {last && tab === 'lire' && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-500">
              <BookOpen className="h-4 w-4 text-[#2A8FA8]" /> Dernière lecture : <strong className="text-ink-800">{surahInfo(last.surah).name}, verset {last.ayah}</strong>
            </p>
          )}
        </Container>
      </section>

      <section ref={panel} className="scroll-mt-20 py-8 md:py-10">
        <Container>
          <div key={tab} className="animate-fade-up">
            {tab === 'lire' && <Lecteur source={source} setSource={setSource} onJuzDone={(n) => { if (!done.includes(n)) setDone([...done, n].sort((a, b) => a - b)); setTab('khatma'); }} />}
            {tab === 'apprendre' && <Memoriser />}
            {tab === 'alphabet' && <Alphabet />}
            {tab === 'khatma' && <Khatma done={done} setDone={setDone} open={(n) => { setSource({ kind: 'juz', n }); setTab('lire'); }} />}
          </div>
        </Container>
      </section>

      {/* Le saviez-vous */}
      <section className="pb-16">
        <Container>
          <div className="flex flex-col gap-4 rounded-[2rem] bg-[#E2F0F4] p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#2A8FA8] to-[#0F3B52] text-gold-200"><Lightbulb className="h-7 w-7" /></span>
            <div className="flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#2A8FA8]">Le saviez-vous ?</p>
              <p key={fact} className="mt-1 font-serif text-xl font-semibold text-[#0F3B52] animate-fade-up">{FACTS[fact]}</p>
            </div>
            <button onClick={() => setFact((fact + 1) % FACTS.length)} className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0F3B52] sm:self-auto"><RefreshCw className="h-4 w-4" /> Un autre</button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link to="/apprendre/quiz" className="flex items-center gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink-900/[0.07] transition hover:-translate-y-0.5 hover:shadow-md"><Sparkles className="h-6 w-6 text-gold-500" /><span><b className="block text-ink-900">Quiz des sourates</b><span className="text-sm text-ink-500">Testez vos connaissances</span></span></Link>
            <Link to="/learning" className="flex items-center gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink-900/[0.07] transition hover:-translate-y-0.5 hover:shadow-md"><BookOpen className="h-6 w-6 text-[#2A8FA8]" /><span><b className="block text-ink-900">Centre du savoir</b><span className="text-sm text-ink-500">Piliers, récits, Bible & Coran</span></span></Link>
            <Link to="/outils/studio" className="flex items-center gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink-900/[0.07] transition hover:-translate-y-0.5 hover:shadow-md"><Flame className="h-6 w-6 text-brand-500" /><span><b className="block text-ink-900">Partager un verset</b><span className="text-sm text-ink-500">Créer une belle carte</span></span></Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default CoranPage;
