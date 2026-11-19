import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Baby, BookOpen, CalendarDays, Trophy, ChevronDown, Compass, GraduationCap, HandHeart, Heart, Info, Menu, MessageCircleHeart, Newspaper, PlayCircle, Sparkles, Users, Wrench, X, Phone, Mail, MapPin, UserPlus, Mic,
} from 'lucide-react';
import RadioPlayer from './RadioPlayer';
import Logo from './Logo';
import ScrollToTop from './ScrollToTop';
import { fetchYoutubeDebates } from '../services/socialService';
import { subscribeNewsletter } from '../services/db';
import { friendlyError } from '../lib/supabase';
import { Honeypot, Spinner } from './ui';
import type { Debate } from '../types';
import { telHref, useSite } from '../lib/site';
import { rubriqueVars, type RubriqueKey } from '../lib/rubriques';

type NavItem = { name: string; path: string; desc?: string; icon?: React.ComponentType<{ className?: string }> };
type NavGroup = { name: string; k: RubriqueKey; items: NavItem[] };

/** Architecture du site : une rubrique = un besoin du visiteur. */
export const NAV: (NavItem | NavGroup)[] = [
  {
    name: 'La DDR',
    k: 'ddr',
    items: [
      { name: 'Qui sommes-nous', path: '/la-ddr', desc: 'Notre histoire, notre mission', icon: Info },
      { name: 'Nos intervenants', path: '/la-ddr/intervenants', desc: 'Les voix de la DDR', icon: Mic },
      { name: 'Actualités', path: '/news', desc: 'La vie de l’association', icon: Newspaper },
    ],
  },
  {
    name: 'Découvrir l’Islam',
    k: 'decouvrir',
    items: [
      { name: 'L’Islam en douceur', path: '/decouvrir', desc: 'Les bases, sans jargon', icon: Compass },
      { name: 'Devenir musulman', path: '/shahada', desc: 'Être accompagné pas à pas', icon: Heart },
      { name: 'Compagnon DDR', path: '/chat', desc: 'Posez vos questions, 24h/24', icon: MessageCircleHeart },
    ],
  },
  {
    name: 'Apprendre',
    k: 'apprendre',
    items: [
      { name: 'Apprendre l’Islam', path: '/apprendre', desc: 'La leçon du jour, tous les espaces', icon: GraduationCap },
      { name: 'Le Grand Quiz', path: '/apprendre/quiz', desc: 'Des questions sans fin, pour tous', icon: Trophy },
      { name: 'Le Coran', path: '/khatma', desc: 'Lire et écouter, juz par juz', icon: BookOpen },
      { name: 'Centre du savoir', path: '/learning', desc: 'Piliers, sunnah, histoires', icon: GraduationCap },
      { name: 'Espace enfants', path: '/enfants', desc: 'Quiz et jeux pour les petits', icon: Baby },
      { name: 'Outils du croyant', path: '/tools', desc: 'Zakat, cartes de rappel', icon: Wrench },
    ],
  },
  {
    name: 'Médiathèque',
    k: 'mediatheque',
    items: [
      { name: 'Débats & directs', path: '/debates', desc: 'Les directs et replays', icon: PlayCircle },
      { name: 'Témoignages', path: '/conversions', desc: 'Ils ont trouvé la paix', icon: Users },
    ],
  },
  { name: 'Agenda', path: '/agenda', icon: CalendarDays },
  { name: 'Contact', path: '/appointments', icon: Phone },
];

const isGroup = (n: NavItem | NavGroup): n is NavGroup => 'items' in n;

/** Bandeau "EN DIRECT" quand la chaîne YouTube diffuse un live. */
const LiveBanner = () => {
  const [live, setLive] = useState<Debate | null>(null);
  useEffect(() => {
    let alive = true;
    fetchYoutubeDebates().then((list) => alive && setLive(list.find((d) => d.isLive) || null));
    return () => {
      alive = false;
    };
  }, []);
  if (!live) return null;
  return (
    <Link to="/debates" className="block bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 py-2 text-center text-sm font-bold text-white">
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white animate-pulse-ring align-middle" />
      EN DIRECT maintenant : <span className="font-semibold opacity-90">{live.title}</span> — Regarder →
    </Link>
  );
};

/** Bandeau discret quand la connexion internet est coupée. */
const OfflineBanner = () => {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="bg-ink-900 px-4 py-2 text-center text-sm font-semibold text-white">
      Vous êtes hors ligne. Les pages déjà ouvertes restent consultables ; le reste reviendra avec la connexion.
    </div>
  );
};

const Dropdown = ({ group, active }: { group: NavGroup; active: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex items-center gap-1 rounded-full px-3 py-2 text-[14.5px] font-semibold transition ${active ? 'text-brand-700' : 'text-ink-800 hover:text-brand-700'}`}
      >
        {group.name}
        <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
      </button>
      <div className={`absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3 transition-all duration-300 ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
        <div style={rubriqueVars(group.k)} onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)} className="overflow-hidden rounded-3xl border border-ink-900/8 bg-ivory-50/95 p-2 shadow-[0_30px_60px_-24px_rgba(20,36,74,0.35)] backdrop-blur-xl">
          <div className="r-grad mx-2 mb-1 mt-1 h-1 rounded-full" />
          {group.items.map((it) => {
            const Icon = it.icon || Sparkles;
            return (
              <Link key={it.path} to={it.path} className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-[var(--r-soft)]">
                <span className="r-soft r-ink grid h-10 w-10 shrink-0 place-items-center rounded-xl transition group-hover:bg-[var(--r-to)] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-ink-900">{it.name}</span>
                  <span className="block text-[13px] text-ink-500">{it.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return setState('done');
    setState('loading');
    try {
      await subscribeNewsletter(email);
      setState('done');
    } catch (err) {
      setMsg(friendlyError(err));
      setState('error');
    }
  };
  if (state === 'done') return <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">Merci ! Vous recevrez les dates des prochains débats in shâ Allah.</p>;
  return (
    <form onSubmit={submit} className="relative flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
      <Honeypot value={trap} onChange={setTrap} />
      <label htmlFor="nl-email" className="sr-only">Votre email</label>
      <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="input !rounded-full !py-2.5 !border-white/15" />
      <button disabled={state === 'loading'} className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500">
        {state === 'loading' ? <Spinner className="h-4 w-4" /> : "S'inscrire"}
      </button>
      {state === 'error' && <p className="text-xs text-red-300">{msg}</p>}
    </form>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const site = useSite();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  // Rubriques à en-tête coloré : tant qu'on n'a pas défilé, la barre passe en blanc pour rester lisible.
  const onColor = !scrolled && (['/la-ddr', '/decouvrir', '/agenda', '/rejoindre'].some((p) => location.pathname.startsWith(p)) || location.pathname === '/apprendre');

  return (
    <div className="flex min-h-screen flex-col bg-ivory-100 text-ink-800">
      <ScrollToTop />
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
        Aller au contenu
      </a>
      <OfflineBanner />
      <LiveBanner />

      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-ink-900/[0.07] bg-ivory-100/85 shadow-[0_10px_30px_-24px_rgba(20,36,74,0.5)] backdrop-blur-xl' : 'border-b border-transparent bg-transparent'}`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6 ${scrolled ? 'h-[70px]' : 'h-[84px]'}`}>
          <Link to="/" aria-label="La DDR — accueil" className="shrink-0">
            <Logo showArabic={false} size={scrolled ? 'sm' : 'md'} tone={onColor ? 'light' : 'dark'} />
          </Link>

          <div className={`hidden items-center gap-0.5 xl:flex ${onColor ? 'on-color' : ''}`}>
            {NAV.map((n) =>
              isGroup(n) ? (
                <Dropdown key={n.name} group={n} active={n.items.some((i) => isActive(i.path))} />
              ) : (
                <Link
                  key={n.path}
                  to={n.path}
                  className={`relative rounded-full px-3 py-2 text-[14.5px] font-semibold transition ${isActive(n.path) ? 'text-brand-700' : 'text-ink-800 hover:text-brand-700'}`}
                >
                  {n.name}
                  {isActive(n.path) && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
                </Link>
              ),
            )}
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <Link to="/rejoindre" className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-bold transition ${onColor ? 'border-white/50 text-white hover:bg-white hover:text-ink-900' : 'border-ink-900/15 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-white'}`}>
              <UserPlus className="h-4 w-4" /> Rejoindre
            </Link>
            <Link to="/donations" className="flex items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-[13.5px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(226,112,10,0.9)] transition hover:brightness-105">
              <HandHeart className="h-4 w-4" /> Soutenir
            </Link>
          </div>

          <button onClick={() => setMobileOpen(true)} className={`grid h-11 w-11 place-items-center rounded-full border shadow-sm xl:hidden ${onColor ? 'border-white/40 bg-white/15 text-white backdrop-blur' : 'border-ink-900/10 bg-white/70 text-ink-900'}`} aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            onClick={(e) => (e.target as HTMLElement).closest('a') && setMobileOpen(false)}
            className="absolute inset-y-0 right-0 flex w-[90%] max-w-sm flex-col overflow-y-auto bg-ivory-100 shadow-2xl animate-fade-up"
          >
            <div className="flex items-center justify-between border-b border-ink-900/[0.07] p-4">
              <Logo showArabic={false} size="sm" />
              <button onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-full text-ink-500 hover:bg-ink-900/5" aria-label="Fermer le menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 space-y-5 p-4">
              <Link to="/" className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[16px] font-semibold ${isActive('/') ? 'bg-brand-100 text-brand-800' : 'text-ink-900'}`}>
                <Sparkles className="h-5 w-5 text-brand-600" /> Accueil
              </Link>
              {NAV.map((n) =>
                isGroup(n) ? (
                  <div key={n.name} style={rubriqueVars(n.k)}>
                    <p className="r-ink mb-1.5 flex items-center gap-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.2em]"><span className="r-grad h-2 w-2 rounded-full" />{n.name}</p>
                    {n.items.map((it) => {
                      const Icon = it.icon || Sparkles;
                      return (
                        <Link key={it.path} to={it.path} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[16px] font-semibold ${isActive(it.path) ? 'bg-brand-100 text-brand-800' : 'text-ink-900'}`}>
                          <span className="r-soft r-ink grid h-9 w-9 place-items-center rounded-xl"><Icon className="h-[18px] w-[18px]" /></span> {it.name}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <Link key={n.path} to={n.path} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[16px] font-semibold ${isActive(n.path) ? 'bg-brand-100 text-brand-800' : 'text-ink-900'}`}>
                    {n.icon ? <n.icon className="h-5 w-5 text-brand-600" /> : null}
                    {n.name}
                  </Link>
                ),
              )}
            </div>
            <div className="space-y-2 border-t border-ink-900/[0.07] p-4">
              <Link to="/donations" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 py-3.5 font-bold text-white">
                <HandHeart className="h-5 w-5" /> Soutenir la DDR
              </Link>
              <Link to="/rejoindre" className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-900/15 py-3.5 font-bold text-ink-900">
                <UserPlus className="h-5 w-5" /> Rejoindre la DDR
              </Link>
            </div>
          </div>
        </div>
      )}

      <main id="contenu" className="relative flex-1">
        <div key={location.pathname} className="animate-fade-up">
          {children}
        </div>
      </main>

      {/* Pied de page : bleu nuit du logo */}
      <footer className="relative mt-20 overflow-hidden bg-ink-900 text-white/80">
        <div className="absolute inset-0 bg-pattern opacity-[0.06]" aria-hidden />
        <div className="absolute -top-40 left-1/2 h-80 w-[50rem] max-w-full -translate-x-1/2 rounded-full bg-brand-500/20 blur-[110px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <p className="font-arabic text-2xl text-gold-300" lang="ar" dir="rtl">ادْعُ إِلَى سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ</p>
            <p className="max-w-xl font-serif text-lg italic text-white/80">« Appelle au sentier de ton Seigneur par la sagesse et la bonne exhortation. »</p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Coran, sourate An-Nahl, 16:125</p>
          </div>
          <div className="hairline-gold mb-14 opacity-40" />
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.25fr]">
            <div className="space-y-5">
              <Logo tone="light" />
              <p className="max-w-sm text-sm leading-relaxed text-white/65">
                Association ivoirienne de prédication et de dialogue interreligieux. Nous invitons à la paix par le savoir, et à la fraternité par le respect.
              </p>
              <div className="flex gap-2">
                <Social href={site.social.youtube} label="YouTube">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
                </Social>
                <Social href={site.social.tiktok} label="TikTok">
                  <path d="M12.5 0h3.9c.1 1.5.6 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8V10a10 10 0 0 1-5.8-1.9v8.8c-.1 1.4-.5 2.8-1.4 3.9a7.3 7.3 0 0 1-5.9 3.2 7.2 7.2 0 0 1-7.9-6.6c-.5-2.2-.1-4.6 1-6.6a7.2 7.2 0 0 1 10.4-3.6V11a3.6 3.6 0 0 0-4.1-.4 3.4 3.4 0 0 0-1.6 4.6 3.5 3.5 0 0 0 3 2.5 3.4 3.4 0 0 0 4-2.4c.1-.5.1-1 .1-1.5z" />
                </Social>
                {site.social.instagram && (
                  <Social href={site.social.instagram} label="Instagram">
                    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />
                  </Social>
                )}
                <Social href={site.social.facebook} label="Facebook">
                  <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z" />
                </Social>
              </div>
            </div>

            <FooterCol title="La DDR">
              <FooterLink to="/la-ddr">Qui sommes-nous</FooterLink>
              <FooterLink to="/la-ddr/intervenants">Nos intervenants</FooterLink>
              <FooterLink to="/agenda">Agenda</FooterLink>
              <FooterLink to="/news">Actualités</FooterLink>
              <FooterLink to="/rejoindre">Rejoindre la DDR</FooterLink>
              <FooterLink to="/donations">Soutenir</FooterLink>
            </FooterCol>

            <FooterCol title="Découvrir & apprendre">
              <FooterLink to="/decouvrir">L’Islam en douceur</FooterLink>
              <FooterLink to="/shahada">Devenir musulman</FooterLink>
              <FooterLink to="/apprendre/quiz">Le Grand Quiz</FooterLink>
              <FooterLink to="/khatma">Le Coran</FooterLink>
              <FooterLink to="/learning">Centre du savoir</FooterLink>
              <FooterLink to="/enfants">Espace enfants</FooterLink>
              <FooterLink to="/debates">Débats & directs</FooterLink>
            </FooterCol>

            <div>
              <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-300">Nous trouver</h3>
              <ul className="mb-7 space-y-3">
                <li className="flex gap-3 text-sm text-white/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span>{site.contact.address}</span>
                </li>
                <li className="flex gap-3 text-sm text-white/70">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span className="flex flex-col">
                    {site.contact.phones.map((p) => (
                      <a key={p} href={telHref(p)} className="hover:text-white">{p}</a>
                    ))}
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-white/70">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <a href={`mailto:${site.contact.email}`} className="break-all hover:text-white">{site.contact.email}</a>
                </li>
              </ul>
              <p className="mb-3 text-sm font-semibold text-white">Recevoir les dates des prochains rappels</p>
              <Newsletter />
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 md:flex-row">
            <p>© {new Date().getFullYear()} La Da’awah Dans la Rue (DDR). Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <Link to="/legal/mentions" className="hover:text-white">Mentions légales</Link>
              <Link to="/legal/privacy" className="hover:text-white">Confidentialité</Link>
              <Link to="/admin" className="hover:text-white">Espace administrateur</Link>
            </div>
          </div>
        </div>
      </footer>

      <RadioPlayer />
    </div>
  );
};

const FooterCol = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-300">{title}</h3>
    <ul className="space-y-3">{children}</ul>
  </div>
);
const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-sm text-white/70 transition hover:text-brand-300">
      {children}
    </Link>
  </li>
);
const Social = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-brand-400 hover:bg-brand-500 hover:text-white">
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">{children}</svg>
  </a>
);

export default Layout;
