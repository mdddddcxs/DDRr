import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, CalendarDays, Compass, GraduationCap, HandHeart, Heart, MessageCircleHeart,
  PlayCircle, Scale, Search, Sparkles, UserPlus, Users, Info,
} from 'lucide-react';
import PrayerTimes from '../components/PrayerTimes';
import NextRappel from '../components/NextRappel';
import { LogoMark } from '../components/Logo';
import { Avatar, ButtonLink, Container, formatFCFA } from '../components/ui';
import { SCHOOL_CAMPAIGN } from '../constants';
import { useSite, waHref } from '../lib/site';
import { useReveal } from '../lib/useReveal';
import { RUBRIQUE_THEME, rubriqueVars, type RubriqueKey } from '../lib/rubriques';
import { fetchNews, fetchYoutubeDebates } from '../services/socialService';
import { getCampaign } from '../services/db';
import type { Debate, DonationCampaign, NewsItem } from '../types';

/* ------------------------------------------------------------------ */
/* Petites briques                                                     */
/* ------------------------------------------------------------------ */

const Kicker = ({ children, light = false, center = false }: { children: React.ReactNode; light?: boolean; center?: boolean }) => (
  <p className={`flex items-center gap-3 ${center ? 'justify-center' : ''} text-[12px] font-extrabold uppercase tracking-[0.24em] ${light ? 'text-gold-300' : 'text-gold-600'}`}>
    <span className={`h-px w-8 ${light ? 'bg-gold-300/60' : 'bg-gold-500/60'}`} />
    {children}
  </p>
);

const Title = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`font-serif text-[2.1rem] font-semibold leading-[1.08] text-ink-900 md:text-5xl ${className}`}>{children}</h2>
);

/** Ornement : étoile à 8 branches entre deux filets dorés. */
const Ornament = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 text-gold-500 ${className}`} aria-hidden>
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 1l2.6 6.4L21 10l-6.4 2.6L12 19l-2.6-6.4L3 10l6.4-2.6z" opacity=".9" />
      <path d="M12 5l1.4 3.6L17 10l-3.6 1.4L12 15l-1.4-3.6L7 10l3.6-1.4z" fill="#fff" opacity=".6" />
    </svg>
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
  </div>
);

/* ------------------------------------------------------------------ */
/* 1. Ouverture                                                        */
/* ------------------------------------------------------------------ */

const TRIO = [
  { name: 'Ismaël Aka', src: '/images/ismael-aka-affiche.jpg' },
  { name: 'Oustaz Diané', src: '/images/oustaz-diane-affiche.jpg', main: true },
  { name: 'Ibrahim Ouattara', src: '/images/ibrahim-ouattara.jpg' },
];

/** Rosace géométrique islamique (étoiles entrelacées), tourne très lentement. */
const Rosette = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} aria-hidden>
    <g fill="none" stroke="currentColor" strokeWidth="1">
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="90" y="90" width="220" height="220" transform={`rotate(${i * 7.5} 200 200)`} opacity={0.55} />
      ))}
      <circle cx="200" cy="200" r="190" />
      <circle cx="200" cy="200" r="156" strokeDasharray="2 6" />
      <circle cx="200" cy="200" r="78" />
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={`c${i}`} cx={200 + 172 * Math.cos((i * Math.PI) / 8)} cy={200 + 172 * Math.sin((i * Math.PI) / 8)} r="5" />
      ))}
    </g>
  </svg>
);

const INTENTS = [
  { to: '/decouvrir', k: 'decouvrir' as const, icon: Compass, title: 'Je découvre l’Islam', text: 'Les bases, avec douceur' },
  { to: '/learning', k: 'apprendre' as const, icon: GraduationCap, title: 'Je veux apprendre', text: 'Coran, savoir, enfants' },
  { to: '/rejoindre', k: 'rejoindre' as const, icon: HandHeart, title: 'Je veux aider', text: 'Bénévolat et soutien' },
];

const TITLE_WORDS = ['Découvrir', 'l’Islam,', 'avec', '*sagesse*', 'et', 'respect.'];

const Hero = () => (
  <section className="relative -mt-[84px] overflow-hidden pt-[84px]">
    {/* Aube : dégradé chaud et lumières qui dérivent lentement */}
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff7ea_0%,#fdebd3_38%,#fbf7f0_100%)]" aria-hidden />
    <div className="absolute -right-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-brand-400/35 blur-[110px] animate-drift" aria-hidden />
    <div className="absolute -left-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-[#e0485e]/15 blur-[100px] animate-drift [animation-delay:-6s]" aria-hidden />
    <div className="absolute bottom-0 right-1/3 h-[22rem] w-[22rem] rounded-full bg-[#1ba3a0]/12 blur-[100px] animate-drift [animation-delay:-12s]" aria-hidden />
    <div className="absolute inset-0 bg-pattern opacity-[0.08] [mask-image:radial-gradient(ellipse_at_70%_35%,black_10%,transparent_65%)]" aria-hidden />

    <Container className="relative grid items-center gap-12 pb-32 pt-8 md:pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:pb-40">
      <div className="text-center lg:text-left">
        <p className="inline-flex items-center gap-3 rounded-full border border-gold-400/50 bg-white/75 px-4 py-1.5 shadow-sm backdrop-blur animate-fade-up">
          <span className="font-arabic text-lg leading-none text-gold-700" lang="ar">السَّلَامُ عَلَيْكُمْ</span>
          <span className="h-3.5 w-px bg-gold-400/50" />
          <span className="text-[13px] font-semibold text-ink-700">Que la paix soit sur vous</span>
        </p>

        <h1 className="mt-6 font-serif text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.01em] text-ink-900 sm:text-6xl xl:text-[4.2rem]" aria-label="Découvrir l’Islam, avec sagesse et respect.">
          {TITLE_WORDS.map((w, i) => (
            <span key={i} aria-hidden className="inline-block animate-word" style={{ animationDelay: `${150 + i * 110}ms` }}>
              {w.startsWith('*') ? <span className="text-gradient-gold italic pr-1">{w.slice(1, -1)}</span> : w}
              {i < TITLE_WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-500 animate-fade-up [animation-delay:800ms] lg:mx-0">
          Depuis les rues d’Abidjan, <strong className="font-semibold text-ink-800">La Da’awah Dans la Rue</strong> invite chacun, musulman, chrétien ou simplement curieux, à poser ses questions et échanger dans la fraternité.
        </p>

        {/* Par où commencer : trois chemins simples */}
        <div className="mt-8 animate-fade-up [animation-delay:950ms]">
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.22em] text-ink-400">Par où commencer ?</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {INTENTS.map(({ to, k, icon: Icon, title, text }) => (
              <Link key={to} to={to} style={rubriqueVars(k)} className="group flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3 text-left shadow-[0_14px_30px_-20px_rgba(20,36,74,0.5)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-22px_var(--r-to)] sm:flex-col sm:items-start sm:p-4">
                <span className="r-grad grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md transition duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold leading-tight text-ink-900">{title}</span>
                  <span className="block text-[13px] text-ink-500">{text}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 r-ink transition group-hover:translate-x-1 sm:hidden" />
              </Link>
            ))}
          </div>
          <a href="#rappel" className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-ink-900 underline decoration-brand-400 decoration-2 underline-offset-[6px] transition hover:text-brand-700">
            <CalendarDays className="h-5 w-5 text-brand-600" /> Voir le prochain rappel du jeudi
          </a>
        </div>
      </div>

      {/* Les trois voix, dans des arches comme les portes du logo */}
      <div className="relative mx-auto w-full max-w-[34rem] animate-fade-up [animation-delay:300ms]">
        <Rosette className="absolute left-1/2 top-1/2 w-[118%] max-w-none -translate-x-1/2 -translate-y-[46%] text-gold-500/45 animate-spin-slow" />
        <div className="absolute left-1/2 top-[52%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" aria-hidden />
        <LogoMark className="absolute left-1/2 top-2 z-10 h-16 w-auto -translate-x-1/2 animate-float drop-shadow-[0_12px_24px_rgba(226,112,10,0.45)] sm:h-20" />
        <div className="relative flex items-end justify-center gap-3 pt-28 sm:gap-4 sm:pt-32">
          {TRIO.map((p, i) => (
            <figure key={p.name} className={`group flex flex-col items-center animate-word ${p.main ? 'w-[38%]' : 'w-[29%] pb-6'}`} style={{ animationDelay: `${500 + i * 160}ms` }}>
              <div className={`arch w-full overflow-hidden p-[3px] shadow-[0_30px_60px_-28px_rgba(20,36,74,0.75)] transition duration-500 group-hover:-translate-y-2 ${p.main ? 'border-flow' : 'bg-white'}`}>
                <div className="arch overflow-hidden bg-ink-900">
                  <img src={p.src} alt={p.name} className={`w-full object-cover object-top transition duration-700 group-hover:scale-105 ${p.main ? 'aspect-[3/4.1]' : 'aspect-[3/4.2]'}`} loading="eager" />
                </div>
              </div>
              <figcaption className={`-mt-4 whitespace-nowrap rounded-full px-3 py-1.5 text-center font-bold shadow-lg ${p.main ? 'bg-gradient-to-b from-brand-500 to-brand-600 text-[12.5px] text-white sm:text-sm' : 'bg-ink-900 text-[11px] text-white sm:text-[12.5px]'}`}>
                {p.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Container>
  </section>
);

/** Bandeau défilant : les mots qui nous portent. */
const VALEURS = [
  ['Dialogue', 'الحوار'], ['Respect', 'الاحترام'], ['Savoir', 'العلم'], ['Fraternité', 'الأخوة'], ['Sagesse', 'الحكمة'], ['Paix', 'السلام'],
];
const Marquee = () => (
  <div className="relative z-10 -mt-10 overflow-hidden py-3">
  <div className="-mx-4 -rotate-1 overflow-hidden bg-ink-900 py-4 shadow-[0_20px_40px_-20px_rgba(20,36,74,0.7)]" aria-hidden>
    <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
      {[0, 1].map((dup) => (
        <div key={dup} className="flex gap-10">
          {VALEURS.map(([fr, ar]) => (
            <span key={fr + dup} className="flex items-center gap-4">
              <span className="font-serif text-xl italic text-white">{fr}</span>
              <span className="font-arabic text-xl text-gold-300">{ar}</span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-400" fill="currentColor"><path d="M12 1l2.6 6.4L21 10l-6.4 2.6L12 19l-2.6-6.4L3 10l6.4-2.6z" /></svg>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* 2. Prochain rappel                                                  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* 3. Rubriques                                                        */
/* ------------------------------------------------------------------ */

const RUBRIQUES: { to: string; k: RubriqueKey; title: string; text: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { to: '/la-ddr', k: 'ddr', title: 'La DDR', text: 'Notre histoire, notre mission et les voix qui portent la da’wah.', icon: Info },
  { to: '/decouvrir', k: 'decouvrir', title: 'Découvrir l’Islam', text: 'Les bases expliquées simplement, Jésus dans l’Islam, vos questions.', icon: Compass },
  { to: '/learning', k: 'apprendre', title: 'Apprendre', text: 'Le Coran, le Centre du savoir et un espace de jeux pour les enfants.', icon: GraduationCap },
  { to: '/debates', k: 'mediatheque', title: 'Médiathèque', text: 'Les directs, les débats et les témoignages en vidéo.', icon: PlayCircle },
  { to: '/agenda', k: 'agenda', title: 'Agenda', text: 'Le rappel du jeudi, les conférences et les tournées.', icon: CalendarDays },
  { to: '/rejoindre', k: 'rejoindre', title: 'Rejoindre la DDR', text: 'Devenir bénévole ou membre et servir la da’wah avec nous.', icon: UserPlus },
];

const Rubriques = () => (
  <section className="relative py-24 md:py-32">
    <Container>
      <div className="reveal mx-auto max-w-2xl text-center">
        <Ornament className="mb-6" />
        <Title>Six portes, un même accueil</Title>
        <p className="mt-5 text-lg leading-relaxed text-ink-500">Chaque rubrique a sa couleur : vous savez toujours où vous êtes, et vous trouvez vite ce que vous cherchez.</p>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {RUBRIQUES.map(({ to, k, title, text, icon: Icon }, i) => (
          <Link
            key={to}
            to={to}
            style={{ ...rubriqueVars(k), '--d': `${(i % 3) * 90}ms` } as React.CSSProperties}
            className="reveal group relative flex flex-col overflow-hidden rounded-[1.6rem] bg-white text-center shadow-[0_1px_2px_rgba(20,36,74,0.05),0_20px_44px_-30px_rgba(20,36,74,0.45)] ring-1 ring-ink-900/[0.06] transition duration-500 hover:-translate-y-2 hover:shadow-[0_34px_60px_-30px_var(--r-to)]"
          >
            {/* Arche colorée */}
            <div className="r-grad relative mx-3 mt-3 overflow-hidden rounded-t-[999px] rounded-b-[1.1rem] pb-5 pt-8 sm:mx-4 sm:mt-4 sm:pb-7 sm:pt-12">
              <div className="absolute inset-0 bg-pattern opacity-25 mix-blend-overlay transition duration-700 group-hover:scale-110" aria-hidden />
              <div className="absolute -bottom-10 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-white/25 blur-2xl" aria-hidden />
              <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur transition duration-500 group-hover:scale-110 sm:h-16 sm:w-16">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <p className="relative mt-3 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/85 sm:text-[11px]">{RUBRIQUE_THEME[k].mot}</p>
            </div>
            <div className="flex flex-1 flex-col px-3 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
              <h3 className="font-serif text-lg font-semibold leading-tight text-ink-900 sm:text-2xl">{title}</h3>
              <p className="mt-2 hidden flex-1 text-[15px] leading-relaxed text-ink-500 sm:block">{text}</p>
              <span className="r-ink mt-3 inline-flex items-center justify-center gap-2 text-sm font-bold sm:mt-5">
                Entrer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  </section>
);

/* ------------------------------------------------------------------ */
/* 4. Notre démarche                                                   */
/* ------------------------------------------------------------------ */

const PILLARS: { icon: React.ComponentType<{ className?: string }>; k: RubriqueKey; title: string; text: string }[] = [
  { icon: BookOpen, k: 'apprendre', title: 'Le savoir', text: 'Les écritures en main : la Bible et le Coran sont lus, cités et comparés devant tous, pour que chacun puisse vérifier par lui-même.' },
  { icon: Scale, k: 'decouvrir', title: 'Le respect', text: 'On débat des idées, jamais des personnes. Chaque contradicteur est écouté et reçoit une réponse posée.' },
  { icon: Heart, k: 'mediatheque', title: 'La fraternité', text: 'Ceux qui embrassent l’Islam ne restent pas seuls : la DDR les accueille et les accompagne dans leurs premiers pas.' },
];

const Demarche = () => (
  <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f5ede0,#fbefe0)] py-24 md:py-32">
    <div className="absolute inset-0 bg-pattern opacity-[0.05]" aria-hidden />
    <Container className="relative grid items-center gap-14 lg:grid-cols-[1fr_1.15fr]">
      <div className="reveal">
        <Kicker>Notre démarche</Kicker>
        <Title className="mt-5">Comparer les écritures, échanger, débattre dans le respect.</Title>
        <p className="mt-6 text-lg leading-relaxed text-ink-500">
          La DDR va à la rencontre des gens là où ils sont : dans la rue, sur les places, et aujourd’hui sur les réseaux. Une da’wah de terrain, accessible, qui répond aux vraies questions.
        </p>
        <figure className="mt-10 rounded-3xl border border-gold-400/30 bg-white/70 p-6 backdrop-blur">
          <p className="font-arabic text-2xl leading-loose text-gold-700" lang="ar" dir="rtl">لَا إِكْرَاهَ فِي الدِّينِ</p>
          <blockquote className="mt-1 font-serif text-xl italic text-ink-800">« Nulle contrainte en religion. »</blockquote>
          <figcaption className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Coran, sourate Al-Baqara, 2:256</figcaption>
        </figure>
      </div>
      <div className="grid gap-5">
        {PILLARS.map(({ icon: Icon, k, title, text }, i) => (
          <article key={title} style={{ ...rubriqueVars(k), '--d': `${i * 110}ms` } as React.CSSProperties} className="reveal card group flex gap-5 p-6 transition duration-500 hover:-translate-x-1 hover:shadow-[0_24px_50px_-30px_var(--r-to)] md:p-7">
            <span className="r-grad grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-[0_14px_30px_-14px_var(--r-to)] transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-2xl font-semibold text-ink-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-ink-500">{text}</p>
            </div>
          </article>
        ))}
      </div>
    </Container>
  </section>
);

/* ------------------------------------------------------------------ */
/* 5. Une question ?                                                   */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = ['Qui est Jésus dans l’Islam ?', 'Pourquoi cinq prières par jour ?', 'Comment devenir musulman ?', 'Quel est le but de la vie ?'];

const AskCompanion = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const ask = (question: string) => question.trim() && navigate(`/chat?q=${encodeURIComponent(question.trim())}`);
  return (
    <section className="py-24 md:py-28">
      <Container>
        <div className="reveal relative mx-auto max-w-4xl overflow-hidden rounded-[2.25rem] border border-brand-200 bg-gradient-to-br from-white via-ivory-50 to-brand-50 p-8 text-center shadow-[0_30px_70px_-45px_rgba(187,84,11,0.6)] md:p-14">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-200/50 blur-3xl" aria-hidden />
          <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_14px_30px_-12px_rgba(226,112,10,0.9)]">
            <MessageCircleHeart className="h-8 w-8" />
          </span>
          <h2 className="relative mt-6 font-serif text-3xl font-semibold text-ink-900 md:text-[2.6rem]">Une question sur l’Islam ?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-ink-500">Le Compagnon DDR vous répond avec bienveillance, à toute heure, en toute discrétion.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
            className="relative mx-auto mt-8 max-w-2xl"
          >
            <label htmlFor="ask-q" className="sr-only">Votre question</label>
            <div className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white p-2 pl-5 shadow-[0_20px_40px_-28px_rgba(20,36,74,0.6)] focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-200/60">
              <Search className="h-5 w-5 shrink-0 text-brand-600" />
              <input
                id="ask-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Écrivez votre question…"
                maxLength={300}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              <button disabled={!q.trim()} className="shrink-0 rounded-full bg-ink-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-ink-800 disabled:opacity-40">Demander</button>
            </div>
          </form>
          <div className="relative mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-ink-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-400 hover:text-brand-700">
                {s}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Médiathèque                                                      */
/* ------------------------------------------------------------------ */

const VideoCard = ({ video, big = false }: { video: Debate; big?: boolean }) => (
  <Link to={`/debates?v=${video.id}`} className="group relative block overflow-hidden rounded-3xl bg-ink-900 shadow-[0_24px_50px_-30px_rgba(20,36,74,0.8)]">
    <div className={big ? 'aspect-video lg:aspect-auto lg:h-full lg:min-h-[26rem]' : 'aspect-video'}>
      {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />}
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/25 to-transparent" />
    {video.isLive && <span className="absolute left-4 top-4 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white">● EN DIRECT</span>}
    <span className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-600 shadow-xl transition duration-500 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white ${big ? 'h-14 w-14 md:h-20 md:w-20' : 'h-12 w-12'}`}>
      <PlayCircle className={big ? 'h-7 w-7 md:h-10 md:w-10' : 'h-6 w-6'} />
    </span>
    <div className={`absolute bottom-0 left-0 right-0 ${big ? 'p-4 sm:p-6 md:p-8' : 'p-4'}`}>
      <p className={`${big ? 'text-[15px] sm:font-serif sm:text-2xl md:text-3xl' : 'text-[15px]'} line-clamp-2 font-semibold leading-snug text-white`}>{video.title}</p>
      {video.date && <p className="mt-1.5 text-xs font-medium text-white/60">{video.date}</p>}
    </div>
  </Link>
);

const Mediatheque = ({ videos }: { videos: Debate[] }) => {
  if (videos.length === 0) return null;
  const [first, ...rest] = videos;
  return (
    <section className="py-8 md:py-12">
      <Container>
        <div className="reveal mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Kicker>Médiathèque</Kicker>
            <Title className="mt-5">Les derniers directs & débats</Title>
          </div>
          <ButtonLink to="/debates" variant="ghost">
            Toute la médiathèque <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="reveal"><VideoCard video={first} big /></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((v, i) => (
              <div key={v.id} className="reveal" style={{ '--d': `${(i + 1) * 100}ms` } as React.CSSProperties}>
                <VideoCard video={v} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Les voix de la DDR                                               */
/* ------------------------------------------------------------------ */

const Voices = () => {
  const site = useSite();
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="reveal mx-auto max-w-2xl text-center">
          <Ornament className="mb-6" />
          <Title>Les voix de la DDR</Title>
          <p className="mt-5 text-lg leading-relaxed text-ink-500">Des frères au service du dialogue et du savoir, qui répondent à chacun avec patience.</p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {site.speakers.map((s, i) => (
            <article key={s.id} style={{ '--d': `${(i % 3) * 110}ms` } as React.CSSProperties} className="reveal group text-center">
              <div className="relative mx-auto w-[78%]">
                <div className="arch absolute -inset-2.5 border border-gold-400/50 transition duration-500 group-hover:-inset-3.5 group-hover:border-brand-400" aria-hidden />
                <div className="arch relative overflow-hidden bg-ink-900 shadow-[0_30px_60px_-30px_rgba(20,36,74,0.7)]">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} loading="lazy" className="aspect-[4/5] w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="grid aspect-[4/5] place-items-center"><Avatar name={s.name} className="h-28 w-28 text-4xl" /></div>
                  )}
                </div>
              </div>
              <h3 className="mt-7 font-serif text-2xl font-semibold text-ink-900">{s.name}</h3>
              <p className="mt-1 text-sm font-bold text-brand-700">{s.role}</p>
              <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-ink-500 line-clamp-4">{s.bio}</p>
              <div className="mt-4 flex justify-center gap-4 text-sm font-semibold">
                {s.youtube && <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-brand-700">YouTube</a>}
                {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-brand-700">Facebook</a>}
                {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-brand-700">TikTok</a>}
              </div>
              {s.photoUrl && s.photoCredit && <p className="mt-2 text-[10px] text-ink-400">{s.photoCredit}</p>}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Prière                                                           */
/* ------------------------------------------------------------------ */

const Prayers = () => (
  <section className="pb-8">
    <Container>
      <div className="reveal mb-8 text-center">
        <Kicker center>Horaires de prière · Abidjan</Kicker>
      </div>
      <div className="reveal">
        <PrayerTimes />
      </div>
    </Container>
  </section>
);

/* ------------------------------------------------------------------ */
/* 9. Projet à soutenir                                                */
/* ------------------------------------------------------------------ */

const Campaign = ({ c }: { c: DonationCampaign }) => {
  const pct = c.targetAmount > 0 ? Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100)) : 0;
  return (
    <section className="py-24 md:py-28">
      <Container>
        <div className="reveal relative overflow-hidden rounded-[2.25rem] border border-gold-400/30 bg-gradient-to-br from-ivory-50 via-ivory-100 to-gold-200/40 p-8 md:p-14">
          <div className="absolute inset-0 bg-pattern opacity-[0.06]" aria-hidden />
          <LogoMark className="absolute -bottom-10 -right-6 h-72 w-auto opacity-[0.07]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Kicker>Sadaqa jariya · Projet de la DDR</Kicker>
              <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-ink-900 md:text-[2.8rem]">{c.title}</h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">{c.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {c.trustIndicators.map((t) => (
                  <li key={t.title} className="rounded-full border border-ink-900/10 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-ink-700">
                    {t.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-36px_rgba(20,36,74,0.55)] md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-400">Déjà collecté</p>
                  <p className="mt-1 font-display text-3xl font-bold text-ink-900">{formatFCFA(c.currentAmount)}</p>
                </div>
                <p className="font-display text-2xl font-bold text-brand-600">{pct}%</p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-ivory-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-400" style={{ width: `${Math.max(pct, 2)}%` }} />
              </div>
              <p className="mt-2 text-sm text-ink-500">Objectif : {formatFCFA(c.targetAmount)}</p>
              <ButtonLink to="/donations" size="lg" className="mt-7 w-full">
                <HandHeart className="h-5 w-5" /> Soutenir le projet
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* 10. Invitations                                                     */
/* ------------------------------------------------------------------ */

const Invitations = () => {
  const site = useSite();
  return (
    <section className="pb-8">
      <Container>
        <div className="grid gap-5 lg:grid-cols-3">
          <Link to="/shahada" className="reveal group relative overflow-hidden rounded-[2rem] bg-ink-900 p-8 text-white md:p-10">
            <div className="absolute inset-0 bg-pattern opacity-[0.08]" aria-hidden />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
            <Sparkles className="relative h-8 w-8 text-gold-300" />
            <h3 className="relative mt-5 font-serif text-[1.9rem] font-semibold leading-tight">Vous souhaitez devenir musulman ?</h3>
            <p className="relative mt-3 text-white/70">Un frère ou une sœur de la DDR vous accompagne, en toute discrétion, à votre rythme.</p>
            <span className="relative mt-7 inline-flex items-center gap-2 font-bold text-gold-300">Être accompagné <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/conversions" style={{ '--d': '100ms' } as React.CSSProperties} className="reveal group relative overflow-hidden rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 md:p-10">
            <Users className="h-8 w-8 text-brand-600" />
            <h3 className="mt-5 font-serif text-[1.9rem] font-semibold leading-tight text-ink-900">Partagez votre témoignage</h3>
            <p className="mt-3 text-ink-500">Votre chemin peut toucher d’autres cœurs. Laissez-nous un message écrit ou vocal.</p>
            <span className="mt-7 inline-flex items-center gap-2 font-bold text-brand-700">Témoigner <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/rejoindre" style={{ '--d': '200ms' } as React.CSSProperties} className="reveal group relative overflow-hidden rounded-[2rem] border border-ink-900/[0.08] bg-ivory-50 p-8 md:p-10">
            <UserPlus className="h-8 w-8 text-ink-900" />
            <h3 className="mt-5 font-serif text-[1.9rem] font-semibold leading-tight text-ink-900">Servir la da’wah avec nous</h3>
            <p className="mt-3 text-ink-500">Logistique, communication, accueil, technique : chaque talent a sa place à la DDR.</p>
            <span className="mt-7 inline-flex items-center gap-2 font-bold text-ink-900">Devenir bénévole <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
        <p className="reveal mt-8 text-center text-sm text-ink-500">
          Une question pratique ? Écrivez-nous sur{' '}
          <a href={waHref(site.contact.whatsapp, 'Salam, je vous contacte depuis le site de la DDR.')} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 underline-offset-4 hover:underline">WhatsApp</a>{' '}
          ou <Link to="/appointments" className="font-bold text-brand-700 underline-offset-4 hover:underline">prenez rendez-vous</Link>.
        </p>
      </Container>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* 11. Actualités                                                      */
/* ------------------------------------------------------------------ */

const LatestNews = ({ news }: { news: NewsItem[] }) => (
  <section className="py-24 md:py-28">
    <Container>
      <div className="reveal mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Kicker>Actualités</Kicker>
          <Title className="mt-5">La vie de la DDR</Title>
        </div>
        <ButtonLink to="/news" variant="ghost">Toutes les actualités <ArrowRight className="h-4 w-4" /></ButtonLink>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {news.slice(0, 3).map((n, i) => (
          <Link key={n.id} to={`/news/${n.id}`} style={{ '--d': `${i * 100}ms` } as React.CSSProperties} className="reveal card card-hover group overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden bg-ivory-200">
              {n.imageUrl ? <img src={n.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><LogoMark className="h-20 w-auto opacity-40" /></div>}
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-600">{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink-900 line-clamp-2">{n.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 line-clamp-3">{n.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  </section>
);

/* ------------------------------------------------------------------ */

const Home = () => {
  const [videos, setVideos] = useState<Debate[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [campaign, setCampaign] = useState<DonationCampaign>(SCHOOL_CAMPAIGN);

  useEffect(() => {
    fetchYoutubeDebates().then(setVideos);
    fetchNews().then(setNews);
    getCampaign().then(setCampaign);
  }, []);

  useReveal([videos.length, news.length]);

  return (
    <>
      <Hero />
      <Marquee />
      <NextRappel />
      <Rubriques />
      <Demarche />
      <AskCompanion />
      <Mediatheque videos={videos} />
      <Voices />
      <Prayers />
      <Campaign c={campaign} />
      <Invitations />
      {news.length > 0 && <LatestNews news={news} />}
    </>
  );
};

export default Home;
