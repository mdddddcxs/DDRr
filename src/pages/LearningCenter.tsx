// Centre du savoir — identité émeraude.
// Sagesse du jour, piliers, histoire du jour, sunnas à vivre, Bible & Coran, alphabet, tasbih.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Clock, RefreshCw, RotateCcw, Share2, Sparkles, Trophy } from 'lucide-react';
import RubriqueHero from '../components/RubriqueHero';
import { Container } from '../components/ui';
import { PROPHET_STORIES } from '../constants';
import { LETTERS } from '../data/quiz/datasets';
import { rubriqueVars } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';

/* ---------------- Données ---------------- */

const SAGESSES = [
  { type: 'Verset', arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', text: '« Et dis : Ô mon Seigneur, accroît mes connaissances ! »', ref: 'Coran, sourate Tâ-Hâ, 20:114' },
  { type: 'Hadith', arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', text: '« Le meilleur d’entre vous est celui qui apprend le Coran et l’enseigne. »', ref: 'Rapporté par Al-Bukhârî' },
  { type: 'Verset', arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', text: '« À côté de la difficulté est, certes, une facilité. »', ref: 'Coran, sourate Ash-Sharh, 94:5' },
  { type: 'Hadith', arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', text: '« Les actes ne valent que par les intentions. »', ref: 'Rapporté par Al-Bukhârî et Muslim' },
  { type: 'Verset', arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', text: '« N’est-ce point par le rappel d’Allah que les cœurs s’apaisent ? »', ref: 'Coran, sourate Ar-Ra‘d, 13:28' },
];

const PILIERS = [
  { n: 1, ar: 'الشهادة', title: 'La shahada', sub: 'L’attestation de foi', text: 'Attester qu’il n’y a de divinité qu’Allah et que Muhammad est Son messager. C’est la porte d’entrée de l’Islam.', detail: 'Elle se prononce avec sincérité, en comprenant son sens. Celui qui la prononce devient musulman.' },
  { n: 2, ar: 'الصلاة', title: 'La salat', sub: 'La prière', text: 'Cinq prières par jour, tournées vers La Mecque : un rendez-vous régulier avec Dieu.', detail: 'Fajr, Dhouhr, ‘Asr, Maghrib et ‘Icha. Elle est précédée des ablutions (woudou).' },
  { n: 3, ar: 'الزكاة', title: 'La zakat', sub: 'L’aumône obligatoire', text: 'Donner chaque année une part de ses biens (2,5 % de l’épargne) aux plus démunis.', detail: 'Elle purifie les biens et le cœur. Notre calculateur Zakat Smart vous aide à l’estimer.' },
  { n: 4, ar: 'الصوم', title: 'Le sawm', sub: 'Le jeûne du Ramadan', text: 'Jeûner de l’aube au coucher du soleil pendant le mois de Ramadan.', detail: 'Les malades, les voyageurs et d’autres personnes en sont dispensés ou rattrapent plus tard.' },
  { n: 5, ar: 'الحج', title: 'Le hajj', sub: 'Le pèlerinage', text: 'Se rendre à La Mecque une fois dans sa vie, pour qui en a les moyens physiques et financiers.', detail: 'Il a lieu chaque année pendant le mois de Dhou al-hijja.' },
];

const SUNNAS = [
  { icon: '😊', title: 'Sourire', text: 'Sourire à son frère est une aumône.' },
  { icon: '🤝', title: 'Saluer', text: 'Dire « as-salâmou ‘alaykoum » à ceux qu’on connaît et à ceux qu’on ne connaît pas.' },
  { icon: '🍽️', title: 'Bismillah', text: 'Dire « Bismillah » avant de manger, et manger de la main droite.' },
  { icon: '🪥', title: 'Le siwak', text: 'Se purifier la bouche, notamment avant la prière.' },
  { icon: '💧', title: 'Ne pas gaspiller', text: 'Même pour les ablutions, utiliser l’eau avec mesure.' },
  { icon: '🏥', title: 'Visiter un malade', text: 'Prendre des nouvelles d’un malade, une source de grande récompense.' },
];

const COMPARAISONS = [
  {
    id: 'jesus', title: 'Jésus', emoji: '🕊️',
    coran: { ref: 'Coran 4:171', text: 'Le Messie Jésus, fils de Marie, n’est qu’un messager d’Allah, Sa parole qu’Il envoya à Marie, et un souffle venant de Lui.' },
    bible: { ref: 'Jean 3:16', text: 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point.' },
    note: 'L’Islam honore Jésus comme un très grand prophète, né miraculeusement de Marie, mais enseigne que Dieu est unique et n’a pas d’enfant.',
  },
  {
    id: 'unicite', title: 'Dieu unique', emoji: '☝️',
    coran: { ref: 'Coran 112:1-4', text: 'Dis : Il est Allah, Unique. Allah, l’Absolu. Il n’a jamais engendré, n’a pas été engendré, et nul n’est égal à Lui.' },
    bible: { ref: 'Deutéronome 6:4', text: 'Écoute, Israël ! L’Éternel, notre Dieu, est le seul Éternel.' },
    note: 'Les deux écritures affirment l’unicité de Dieu ; c’est un point de départ commun pour le dialogue.',
  },
  {
    id: 'vin', title: 'Le vin', emoji: '🍇',
    coran: { ref: 'Coran 5:90', text: 'Le vin, le jeu de hasard, les pierres dressées et les flèches divinatoires ne sont qu’une abomination, œuvre du Diable. Écartez-vous-en.' },
    bible: { ref: 'Proverbes 20:1', text: 'Le vin est moqueur, les boissons fortes sont tumultueuses ; quiconque en fait excès n’est pas sage.' },
    note: 'L’Islam interdit l’alcool pour préserver la raison. La Bible met aussi en garde contre ses excès.',
  },
  {
    id: 'porc', title: 'Le porc', emoji: '🥩',
    coran: { ref: 'Coran 2:173', text: 'Certes, Il vous interdit la chair d’une bête morte, le sang, la viande de porc…' },
    bible: { ref: 'Lévitique 11:7-8', text: 'Vous ne mangerez pas le porc… vous le regarderez comme impur.' },
    note: 'L’interdiction du porc se trouve aussi dans la Torah ; la plupart des Églises chrétiennes ne l’appliquent plus.',
  },
  {
    id: 'salut', title: 'Le salut', emoji: '🗝️',
    coran: { ref: 'Coran 103:2-3', text: 'L’homme est certes en perdition, sauf ceux qui croient et accomplissent les bonnes œuvres, s’enjoignent la vérité et s’enjoignent l’endurance.' },
    bible: { ref: 'Éphésiens 2:8-9', text: 'C’est par la grâce que vous êtes sauvés, par le moyen de la foi… ce n’est point par les œuvres.' },
    note: 'En Islam, le salut repose sur la foi et les œuvres, par la miséricorde de Dieu.',
  },
];

const TASBIH = ['Soubhânallah', 'Alhamdoulillah', 'Allâhou akbar'];
const TASBIH_AR = ['سُبْحَانَ اللهِ', 'الْحَمْدُ لِلَّهِ', 'اللهُ أَكْبَرُ'];

const todayKey = () => new Date().toISOString().slice(0, 10);
const dayOfYear = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);

/* ---------------- Briques ---------------- */

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="r-ink flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em]">
    <span className="r-grad h-1 w-8 rounded-full" />
    {children}
  </p>
);
const H2 = ({ kicker, children, center = false }: { kicker: string; children: React.ReactNode; center?: boolean }) => (
  <div className={`reveal mb-10 ${center ? 'mx-auto max-w-2xl text-center [&>p]:justify-center' : 'max-w-2xl'}`}>
    <Kicker>{kicker}</Kicker>
    <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink-900 md:text-[2.7rem]">{children}</h2>
  </div>
);

/* ---------------- Sections ---------------- */

const SagesseDuJour = () => {
  const [i, setI] = useState(dayOfYear() % SAGESSES.length);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SAGESSES.length), 8000);
    return () => clearInterval(t);
  }, []);
  const s = SAGESSES[i];
  return (
    <section className="relative z-10 -mt-10">
      <Container>
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-[#0f3d31] px-6 py-10 text-center text-white shadow-[0_40px_80px_-40px_rgba(18,93,71,0.9)] sm:px-12">
          <div className="absolute inset-0 bg-pattern opacity-[0.09]" aria-hidden />
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#3DBB8C]/30 blur-[80px] animate-drift" aria-hidden />
          <p className="relative text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#9de3c6]">{s.type} du jour</p>
          <div key={i} className="relative animate-fade-up">
            <p className="mt-5 font-arabic text-4xl leading-relaxed text-gold-200 md:text-5xl" lang="ar" dir="rtl">{s.arabic}</p>
            <p className="mx-auto mt-4 max-w-2xl font-serif text-xl italic leading-relaxed md:text-2xl">{s.text}</p>
            <p className="mt-3 text-sm font-semibold text-white/60">{s.ref}</p>
          </div>
          <div className="relative mt-7 flex items-center justify-center gap-3">
            <button onClick={() => setI((i - 1 + SAGESSES.length) % SAGESSES.length)} aria-label="Précédent" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex gap-1.5">
              {SAGESSES.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Sagesse ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? 'w-7 bg-[#9de3c6]' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
            <button onClick={() => setI((i + 1) % SAGESSES.length)} aria-label="Suivant" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </Container>
    </section>
  );
};

const Sommaire = () => (
  <nav aria-label="Sommaire" className="sticky top-[70px] z-30 mt-12 border-y border-ink-900/[0.06] bg-ivory-100/90 backdrop-blur-xl">
    <Container className="no-scrollbar flex gap-2 overflow-x-auto py-3">
      {[
        ['piliers', 'Les 5 piliers'], ['histoire', 'Histoire du jour'], ['sunnas', 'Sunnas à vivre'], ['ecritures', 'Bible & Coran'], ['alphabet', 'Alphabet'], ['tasbih', 'Tasbih'],
      ].map(([id, label]) => (
        <a key={id} href={`#${id}`} className="r-soft r-ink shrink-0 rounded-full px-4 py-2 text-sm font-bold transition hover:bg-[var(--r-to)] hover:text-white">{label}</a>
      ))}
    </Container>
  </nav>
);

const Piliers = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="piliers" className="scroll-mt-36 py-16 md:py-24">
      <Container>
        <H2 kicker="Les fondations">Les cinq piliers de l’Islam</H2>
        <div className="grid gap-4 md:grid-cols-5">
          {PILIERS.map((p, i) => (
            <button
              key={p.n}
              onClick={() => setOpen(open === p.n ? null : p.n)}
              aria-expanded={open === p.n}
              style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
              className={`reveal group relative overflow-hidden rounded-3xl p-6 text-left transition duration-500 ${open === p.n ? 'r-grad text-white shadow-[0_30px_60px_-30px_var(--r-to)]' : 'bg-white shadow-[0_18px_40px_-30px_rgba(20,36,74,0.5)] ring-1 ring-ink-900/[0.06] hover:-translate-y-1'}`}
            >
              <span className={`font-display text-5xl font-bold ${open === p.n ? 'text-white/30' : 'r-ink opacity-20'}`}>{p.n}</span>
              <p className={`mt-1 font-arabic text-2xl ${open === p.n ? 'text-white' : 'r-ink'}`} lang="ar">{p.ar}</p>
              <h3 className={`mt-1 font-serif text-xl font-semibold ${open === p.n ? 'text-white' : 'text-ink-900'}`}>{p.title}</h3>
              <p className={`text-sm font-semibold ${open === p.n ? 'text-white/80' : 'text-ink-500'}`}>{p.sub}</p>
              <p className={`mt-3 text-[15px] leading-relaxed ${open === p.n ? 'text-white/90' : 'text-ink-500'}`}>{p.text}</p>
              {open === p.n && <p className="mt-3 border-t border-white/25 pt-3 text-sm leading-relaxed text-white/90 animate-fade-up">{p.detail}</p>}
              {open !== p.n && <span className="r-ink mt-3 inline-flex items-center gap-1 text-sm font-bold">En savoir plus <ArrowRight className="h-4 w-4" /></span>}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
};

const HistoireDuJour = () => {
  const [idx, setIdx] = useState(dayOfYear() % PROPHET_STORIES.length);
  const [copied, setCopied] = useState(false);
  const story = PROPHET_STORIES[idx];
  const next = () => {
    let n = idx;
    while (n === idx && PROPHET_STORIES.length > 1) n = Math.floor(Math.random() * PROPHET_STORIES.length);
    setIdx(n);
    document.getElementById('histoire')?.scrollIntoView({ behavior: 'smooth' });
  };
  const share = async () => {
    const text = `${story.title}\n\n${story.content.replace(/[*>#]/g, '').slice(0, 220)}…\n\nÀ lire sur le site de la DDR : ${window.location.origin}/learning#histoire`;
    if (navigator.share) return navigator.share({ title: story.title, text }).catch(() => {});
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const lines = useMemo(() => story.content.split('\n').filter((l) => l.trim()), [story]);
  return (
    <section id="histoire" className="scroll-mt-36 bg-[#e0f5ec]/60 py-16 md:py-24">
      <Container>
        <H2 kicker="Histoire du jour">Les récits du Prophète ﷺ</H2>
        <article key={story.id} className="reveal is-visible mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-40px_rgba(18,93,71,0.6)] animate-fade-up">
          <div className="r-grad relative px-7 py-8 text-white sm:px-10">
            <div className="absolute inset-0 bg-pattern opacity-20 mix-blend-overlay" aria-hidden />
            <p className="relative flex flex-wrap items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/85">
              <span>{story.category}</span> <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {story.readTime}</span>
            </p>
            <h3 className="relative mt-2 font-serif text-3xl font-semibold leading-tight md:text-4xl">{story.title}</h3>
          </div>
          <div className="px-7 py-8 text-[17px] leading-relaxed text-ink-700 sm:px-10">
            {lines.map((line, i) =>
              line.trim().startsWith('**') ? (
                <h4 key={i} className="mb-2 mt-5 font-serif text-xl font-semibold text-ink-900">{line.replace(/\*\*/g, '')}</h4>
              ) : line.trim().startsWith('>') ? (
                <blockquote key={i} className="r-soft my-4 rounded-2xl border-l-4 border-[var(--r-to)] px-5 py-3 font-serif italic text-ink-800">{line.replace(/^>\s?/, '')}</blockquote>
              ) : (
                <p key={i} className="mb-3">{line}</p>
              ),
            )}
            <p className="mt-6 text-sm font-semibold text-ink-400">Source : {story.source}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={next} className="r-grad inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold text-white shadow-md"><RefreshCw className="h-4 w-4" /> Une autre histoire</button>
              <button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-5 py-3 font-bold text-ink-900"><Share2 className="h-4 w-4" /> {copied ? 'Ouverture de WhatsApp…' : 'Partager'}</button>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
};

const Sunnas = () => {
  const [done, setDone] = useState<string[]>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('ddr_sunnas') || '{}');
      return s.day === todayKey() ? s.done : [];
    } catch {
      return [];
    }
  });
  const toggle = (t: string) => {
    const next = done.includes(t) ? done.filter((x) => x !== t) : [...done, t];
    setDone(next);
    try {
      localStorage.setItem('ddr_sunnas', JSON.stringify({ day: todayKey(), done: next }));
    } catch {
      /* stockage indisponible */
    }
    if (!done.includes(t)) navigator.vibrate?.(20);
  };
  return (
    <section id="sunnas" className="scroll-mt-36 py-16 md:py-24">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <H2 kicker="À vivre aujourd’hui">Six sunnas pour embellir la journée</H2>
          <div className="reveal mb-10 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-ink-900/[0.06]">
            <span className="r-ink font-display text-3xl font-bold">{done.length}/6</span>
            <span className="text-sm font-semibold text-ink-500">{done.length === 6 ? 'Mâ shâ Allah, toutes réalisées !' : 'réalisées aujourd’hui'}</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUNNAS.map((s, i) => {
            const on = done.includes(s.title);
            return (
              <button key={s.title} onClick={() => toggle(s.title)} aria-pressed={on} style={{ '--d': `${(i % 3) * 80}ms` } as React.CSSProperties} className={`reveal flex items-start gap-4 rounded-3xl p-5 text-left transition duration-300 ${on ? 'r-soft ring-2 ring-[var(--r-from)]' : 'bg-white shadow-[0_14px_30px_-24px_rgba(20,36,74,0.5)] ring-1 ring-ink-900/[0.06] hover:-translate-y-0.5'}`}>
                <span className="text-3xl" aria-hidden>{s.icon}</span>
                <span className="flex-1">
                  <span className="block font-serif text-xl font-semibold text-ink-900">{s.title}</span>
                  <span className="mt-0.5 block text-[15px] text-ink-500">{s.text}</span>
                </span>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition ${on ? 'r-grad border-transparent text-white' : 'border-ink-900/15 text-transparent'}`}><Check className="h-4 w-4" /></span>
              </button>
            );
          })}
        </div>
        <p className="reveal mt-4 text-sm text-ink-500">Cochez ce que vous avez fait : votre liste repart à zéro chaque jour.</p>
      </Container>
    </section>
  );
};

const Ecritures = () => {
  const [sel, setSel] = useState(0);
  const c = COMPARAISONS[sel];
  return (
    <section id="ecritures" className="scroll-mt-36 relative overflow-hidden bg-[#0f3d31] py-16 text-white md:py-24">
      <div className="absolute inset-0 bg-pattern opacity-[0.07]" aria-hidden />
      <Container className="relative">
        <div className="reveal mb-10 max-w-2xl">
          <p className="flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#9de3c6]"><span className="h-1 w-8 rounded-full bg-[#9de3c6]" /> La méthode de la DDR</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-[2.7rem]">La Bible et le Coran, côte à côte</h2>
          <p className="mt-3 text-white/70">Comparer les écritures avec respect : lisez, vérifiez les références, faites-vous votre propre idée.</p>
        </div>
        <div className="reveal no-scrollbar mb-6 flex gap-2 overflow-x-auto">
          {COMPARAISONS.map((x, i) => (
            <button key={x.id} onClick={() => setSel(i)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${i === sel ? 'bg-white text-[#125D47]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <span aria-hidden>{x.emoji}</span> {x.title}
            </button>
          ))}
        </div>
        <div key={c.id} className="grid gap-4 animate-fade-up md:grid-cols-2">
          <div className="rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/10 md:p-8">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#9de3c6]">Le Coran · {c.coran.ref}</p>
            <p className="mt-4 font-serif text-xl italic leading-relaxed md:text-2xl">« {c.coran.text} »</p>
          </div>
          <div className="rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/10 md:p-8">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-gold-300">La Bible · {c.bible.ref}</p>
            <p className="mt-4 font-serif text-xl italic leading-relaxed md:text-2xl">« {c.bible.text} »</p>
          </div>
        </div>
        <p key={c.id + 'n'} className="mt-4 rounded-2xl bg-[#9de3c6]/15 p-5 text-[15px] leading-relaxed text-white/90 animate-fade-up">{c.note}</p>
        <Link to="/debates" className="mt-6 inline-flex items-center gap-2 font-bold text-[#9de3c6] hover:text-white">Voir les débats de la DDR <ArrowRight className="h-4 w-4" /></Link>
      </Container>
    </section>
  );
};

const Alphabet = () => {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <section id="alphabet" className="scroll-mt-36 py-16 md:py-24">
      <Container>
        <H2 kicker="Premiers pas en arabe">L’alphabet arabe</H2>
        <div className="reveal grid grid-cols-4 gap-2 sm:grid-cols-7" dir="rtl">
          {LETTERS.map((l, i) => (
            <button key={l.name} onClick={() => setSel(i)} className={`group flex aspect-square flex-col items-center justify-center rounded-2xl transition duration-300 ${sel === i ? 'r-grad scale-105 text-white shadow-lg' : 'bg-white ring-1 ring-ink-900/[0.06] hover:-translate-y-1 hover:shadow-md'}`}>
              <span className={`font-arabic text-4xl leading-none ${sel === i ? 'text-white' : 'text-ink-900'}`}>{l.ar}</span>
              <span className={`mt-1 text-xs font-bold ${sel === i ? 'text-white/90' : 'text-ink-500'}`} dir="ltr">{l.name}</span>
            </button>
          ))}
        </div>
        <p className="reveal mt-4 text-sm text-ink-500">L’arabe se lit de droite à gauche. Touchez une lettre, puis entraînez-vous dans le <Link to="/apprendre/quiz" className="r-ink font-bold underline">Grand Quiz</Link>.</p>
      </Container>
    </section>
  );
};

const Tasbih = () => {
  const [count, setCount] = useState(0);
  const round = Math.floor(count / 33) % 3;
  const inRound = count % 33;
  const total = count;
  const tap = () => {
    setCount((c) => c + 1);
    navigator.vibrate?.((count + 1) % 33 === 0 ? [40, 60, 40] : 12);
  };
  const pct = (inRound / 33) * 100;
  return (
    <section id="tasbih" className="scroll-mt-36 bg-[#e0f5ec]/60 py-16 md:py-24">
      <Container>
        <H2 kicker="Le rappel d’Allah" center>Votre tasbih</H2>
        <div className="reveal mx-auto flex max-w-sm flex-col items-center">
          <button
            onClick={tap}
            aria-label={`Compter : ${TASBIH[round]}, ${inRound} sur 33`}
            className="relative grid h-64 w-64 place-items-center rounded-full bg-white shadow-[0_40px_80px_-40px_rgba(18,93,71,0.8)] transition active:scale-95"
            style={{ background: `conic-gradient(var(--r-from) ${pct}%, #e0f5ec ${pct}% 100%)` }}
          >
            <span className="grid h-[14.5rem] w-[14.5rem] place-items-center rounded-full bg-white">
              <span>
                <span className="block font-arabic text-3xl text-ink-900" lang="ar">{TASBIH_AR[round]}</span>
                <span className="r-ink mt-1 block text-sm font-bold">{TASBIH[round]}</span>
                <span className="mt-2 block font-display text-6xl font-bold tabular-nums text-ink-900">{inRound}</span>
                <span className="block text-xs font-semibold text-ink-400">sur 33 · total {total}</span>
              </span>
            </span>
          </button>
          <p className="mt-6 text-center text-sm text-ink-500">Touchez le cercle à chaque invocation : 33 fois chacune, après la prière.</p>
          <button onClick={() => setCount(0)} className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-ink-500 hover:text-ink-900"><RotateCcw className="h-4 w-4" /> Remettre à zéro</button>
        </div>
      </Container>
    </section>
  );
};

const LearningCenter = () => {
  useReveal();
  return (
    <div style={rubriqueVars('savoir')}>
      <RubriqueHero k="savoir" icon={BookOpen} title="Centre du savoir" arabic="اقْرَأْ" subtitle="Les fondations de l’Islam, les récits du Prophète ﷺ, la Bible et le Coran côte à côte, et de petits gestes à vivre chaque jour." />
      <SagesseDuJour />
      <Sommaire />
      <Piliers />
      <HistoireDuJour />
      <Sunnas />
      <Ecritures />
      <Alphabet />
      <Tasbih />
      <section className="py-16">
        <Container>
          <Link to="/apprendre/quiz" className="reveal group flex flex-col items-center gap-4 rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(18,93,71,0.6)] ring-1 ring-ink-900/[0.06] sm:flex-row sm:text-left">
            <span className="r-grad grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white"><Trophy className="h-8 w-8" /></span>
            <span className="flex-1">
              <span className="block font-serif text-2xl font-semibold text-ink-900">Testez ce que vous avez appris</span>
              <span className="block text-ink-500">Le Grand Quiz infini : des centaines de questions, pour tous les niveaux.</span>
            </span>
            <span className="r-ink inline-flex items-center gap-2 font-bold">Jouer <Sparkles className="h-5 w-5 transition group-hover:rotate-12" /></span>
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default LearningCenter;
