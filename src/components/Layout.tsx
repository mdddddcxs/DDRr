import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, ChevronDown, GraduationCap, HandHeart, Menu, MessageCircleHeart, Newspaper, PlayCircle, Sparkles, Users, Wrench, X, Phone, Mail, MapPin, Baby,
} from 'lucide-react';
import RadioPlayer from './RadioPlayer';
import Logo from './Logo';
import ScrollToTop from './ScrollToTop';
import { fetchYoutubeDebates } from '../services/socialService';
import { subscribeNewsletter } from '../services/db';
import { friendlyError } from '../lib/supabase';
import { Honeypot, Spinner } from './ui';
import type { Debate } from '../types';
import { SOCIAL_LINKS } from '../constants';

type NavItem = { name: string; path: string; desc?: string; icon?: React.ComponentType<{ className?: string }> };
type NavGroup = { name: string; items: NavItem[] };

export const NAV: (NavItem | NavGroup)[] = [
  { name: 'Accueil', path: '/' },
  {
    name: 'Apprendre',
    items: [
      { name: 'Le Coran', path: '/khatma', desc: 'Lire et écouter, juz par juz', icon: BookOpen },
      { name: 'Centre du savoir', path: '/learning', desc: 'Piliers, sunnah, histoires', icon: GraduationCap },
      { name: 'Espace enfants', path: '/enfants', desc: 'Quiz et jeux pour les petits', icon: Baby },
      { name: 'Outils du croyant', path: '/tools', desc: 'Zakat, cartes de rappel', icon: Wrench },
    ],
  },
  {
    name: 'Médiathèque',
    items: [
      { name: 'Débats & vidéos', path: '/debates', desc: 'Les directs et replays', icon: PlayCircle },
      { name: 'Actualités', path: '/news', desc: 'La vie de la DDR', icon: Newspaper },
      { name: 'Témoignages', path: '/conversions', desc: 'Ils ont trouvé la paix', icon: Users },
    ],
  },
  { name: 'Compagnon DDR', path: '/chat' },
  { name: 'Contact', path: '/appointments' },
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

const Dropdown = ({ group, active }: { group: NavGroup; active: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-semibold transition ${active ? 'text-brand-300' : 'text-cream-200 hover:text-white'}`}
      >
        {group.name}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3">
          <div className="rounded-3xl border border-white/10 bg-night-900/95 p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-fade-up">
            {group.items.map((it) => {
              const Icon = it.icon || Sparkles;
              return (
                <Link key={it.path} to={it.path} className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-white/5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold text-cream-50">{it.name}</span>
                    <span className="block text-[13px] text-sand-400">{it.desc}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
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
  if (state === 'done') return <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Merci ! Vous recevrez les dates des prochains débats in shâ Allah.</p>;
  return (
    <form onSubmit={submit} className="relative flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
      <Honeypot value={trap} onChange={setTrap} />
      <label htmlFor="nl-email" className="sr-only">Votre email</label>
      <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="input !rounded-full !py-2.5" />
      <button disabled={state === 'loading'} className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500">
        {state === 'loading' ? <Spinner className="h-4 w-4" /> : "S'inscrire"}
      </button>
      {state === 'error' && <p className="text-xs text-red-300">{msg}</p>}
    </form>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);
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

  return (
    <div className="flex min-h-screen flex-col bg-night-950 text-cream-100">
      <ScrollToTop />
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
        Aller au contenu
      </a>
      <LiveBanner />

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/5 bg-night-950/85 backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="La DDR — accueil" className="shrink-0">
            <Logo showArabic={false} />
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) =>
              isGroup(n) ? (
                <Dropdown key={n.name} group={n} active={n.items.some((i) => isActive(i.path))} />
              ) : (
                <Link
                  key={n.path}
                  to={n.path}
                  className={`rounded-full px-3.5 py-2 text-[14px] font-semibold transition ${isActive(n.path) ? 'text-brand-300' : 'text-cream-200 hover:text-white'}`}
                >
                  {n.name}
                </Link>
              ),
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/shahada" className="rounded-full border border-gold-400/40 px-4 py-2 text-[13px] font-bold text-gold-200 transition hover:border-gold-300 hover:bg-gold-400/10">
              Devenir musulman
            </Link>
            <Link to="/donations" className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-bold text-white shadow-[0_8px_24px_-10px_rgba(234,88,12,0.9)] transition hover:bg-brand-500">
              <HandHeart className="h-4 w-4" /> Faire un don
            </Link>
          </div>

          <button onClick={() => setMobileOpen(true)} className="rounded-full p-2.5 text-cream-100 hover:bg-white/5 lg:hidden" aria-label="Ouvrir le menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-night-900 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <Logo showArabic={false} />
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-sand-400 hover:bg-white/5" aria-label="Fermer le menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 space-y-6 p-4">
              {NAV.map((n) =>
                isGroup(n) ? (
                  <div key={n.name}>
                    <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-sand-500">{n.name}</p>
                    {n.items.map((it) => {
                      const Icon = it.icon || Sparkles;
                      return (
                        <Link key={it.path} to={it.path} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[16px] font-semibold ${isActive(it.path) ? 'bg-brand-500/10 text-brand-300' : 'text-cream-100'}`}>
                          <Icon className="h-5 w-5 text-brand-400" /> {it.name}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <Link key={n.path} to={n.path} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[16px] font-semibold ${isActive(n.path) ? 'bg-brand-500/10 text-brand-300' : 'text-cream-100'}`}>
                    {n.path === '/chat' ? <MessageCircleHeart className="h-5 w-5 text-brand-400" /> : n.path === '/' ? <Sparkles className="h-5 w-5 text-brand-400" /> : <Phone className="h-5 w-5 text-brand-400" />}
                    {n.name}
                  </Link>
                ),
              )}
            </div>
            <div className="space-y-2 border-t border-white/5 p-4">
              <Link to="/donations" className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 font-bold text-white">
                <HandHeart className="h-5 w-5" /> Faire un don
              </Link>
              <Link to="/shahada" className="flex w-full items-center justify-center rounded-full border border-gold-400/40 py-3.5 font-bold text-gold-200">
                Je veux devenir musulman
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

      {/* Pied de page */}
      <footer className="relative mt-16 overflow-hidden border-t border-white/5 bg-night-900">
        <div className="absolute inset-0 bg-pattern opacity-[0.035]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
            <div className="space-y-5">
              <Logo />
              <p className="max-w-sm text-sm leading-relaxed text-sand-400">
                Association ivoirienne de dialogue interreligieux. Nous invitons à la paix par le savoir, et à la fraternité par la vérité.
              </p>
              <p className="font-serif text-sm italic text-brand-300">« Pour ma foi et pour ma religion »</p>
              <div className="flex gap-2">
                <Social href={SOCIAL_LINKS.youtube} label="YouTube">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
                </Social>
                <Social href={SOCIAL_LINKS.tiktok} label="TikTok">
                  <path d="M12.5 0h3.9c.1 1.5.6 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8V10a10 10 0 0 1-5.8-1.9v8.8c-.1 1.4-.5 2.8-1.4 3.9a7.3 7.3 0 0 1-5.9 3.2 7.2 7.2 0 0 1-7.9-6.6c-.5-2.2-.1-4.6 1-6.6a7.2 7.2 0 0 1 10.4-3.6V11a3.6 3.6 0 0 0-4.1-.4 3.4 3.4 0 0 0-1.6 4.6 3.5 3.5 0 0 0 3 2.5 3.4 3.4 0 0 0 4-2.4c.1-.5.1-1 .1-1.5z" />
                </Social>
                <Social href={SOCIAL_LINKS.facebook} label="Facebook">
                  <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z" />
                </Social>
              </div>
            </div>

            <FooterCol title="Découvrir">
              <FooterLink to="/khatma">Le Coran</FooterLink>
              <FooterLink to="/learning">Centre du savoir</FooterLink>
              <FooterLink to="/enfants">Espace enfants</FooterLink>
              <FooterLink to="/debates">Débats & vidéos</FooterLink>
              <FooterLink to="/news">Actualités</FooterLink>
              <FooterLink to="/donations">Faire un don</FooterLink>
            </FooterCol>

            <FooterCol title="Nous trouver">
              <li className="flex gap-3 text-sm text-sand-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>
                  <strong className="block text-cream-100">Yopougon Andokoi</strong>
                  En face du commissariat du 23ᵉ arrondissement, Abidjan
                </span>
              </li>
              <li className="flex gap-3 text-sm text-sand-400">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span className="flex flex-col">
                  <a href="tel:+2250747320455" className="hover:text-white">+225 07 47 32 04 55</a>
                  <a href="tel:+2250505408685" className="hover:text-white">+225 05 05 40 86 85</a>
                </span>
              </li>
              <li className="flex gap-3 text-sm text-sand-400">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a href="mailto:ladawahdanslarue.ddr@gmail.com" className="break-all hover:text-white">ladawahdanslarue.ddr@gmail.com</a>
              </li>
            </FooterCol>

            <div>
              <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-sand-500">Restez informé</h3>
              <p className="mb-4 text-sm text-sand-400">Recevez les dates des prochains débats et conférences.</p>
              <Newsletter />
              <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-sand-400">
                <p className="font-bold text-cream-100">Prêche chaque jeudi · 16h</p>
                Place Ficgayo, Yopougon
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-sand-500 md:flex-row">
            <p>© {new Date().getFullYear()} Association La DDR. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <Link to="/legal/mentions" className="hover:text-cream-100">Mentions légales</Link>
              <Link to="/legal/privacy" className="hover:text-cream-100">Confidentialité</Link>
              <Link to="/admin" className="hover:text-cream-100">Espace administrateur</Link>
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
    <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-sand-500">{title}</h3>
    <ul className="space-y-3">{children}</ul>
  </div>
);
const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-sm text-sand-400 transition hover:text-brand-300">
      {children}
    </Link>
  </li>
);
const Social = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-sand-400 transition hover:border-brand-500/50 hover:text-white">
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">{children}</svg>
  </a>
);

export default Layout;
