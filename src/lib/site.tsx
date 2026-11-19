// Contenu modifiable du site (coordonnées, réseaux, prêche, intervenants).
// Valeurs par défaut = informations publiques vérifiées (novembre 2026) ;
// l'administrateur peut tout modifier depuis Admin → Contenu du site (enregistré dans settings.site_content).
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export type SpeakerInfo = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  photoCredit?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
};

export type RealisationKind = 'mosquee' | 'forage' | 'ecole' | 'autre';
export type Realisation = { id: string; kind: RealisationKind; title: string; place: string; text: string; photoUrl: string };

export type SiteEvent = { id: string; title: string; date: string; time: string; place: string; text: string; link: string };
export type HomeSections = { rappel: boolean; realisations: boolean; videos: boolean; intervenants: boolean; priere: boolean; campagne: boolean; actualites: boolean };

export type SiteContent = {
  contact: { phones: string[]; whatsapp: string; email: string; address: string };
  social: { youtube: string; tiktok: string; facebook: string; instagram: string };
  /** Rappel hebdomadaire. start/end au format HH:MM servent au compte à rebours et à l'ajout à l'agenda. */
  preche: { day: string; time: string; start: string; end: string; place: string; mapsQuery: string; title: string; theme: string };
  speakers: SpeakerInfo[];
  /** Réalisations sur le terrain (mosquées, forages, écoles…), modifiables dans l'admin. */
  realisations: Realisation[];
  /** Bandeau d'annonce en haut de toutes les pages. */
  banner: { on: boolean; text: string; link: string; tone: 'or' | 'vert' | 'bleu' | 'rouge' };
  /** Direct annoncé à la main (en plus de la détection YouTube). */
  live: { on: boolean; title: string; url: string };
  /** Événements ponctuels (conférences, tournées…), affichés dans l'Agenda. */
  events: SiteEvent[];
  /** Sections de l'accueil à afficher ou masquer. */
  sections: HomeSections;
};

export const DEFAULT_SITE: SiteContent = {
  contact: {
    phones: ['+225 07 47 32 04 55', '+225 05 05 40 86 85', '+225 07 58 77 77 47'],
    whatsapp: '2250747320455',
    email: 'ladawahdanslarue.ddr@gmail.com',
    address: 'Yopougon Andokoi, 23ᵉ arrondissement, Abidjan',
  },
  social: {
    youtube: 'https://www.youtube.com/@LA_DAWAH_DANS_LA_RUE',
    tiktok: 'https://www.tiktok.com/@ddrofficiel',
    facebook: 'https://www.facebook.com/ismaelAKAofficiel',
    instagram: '',
  },
  preche: {
    day: 'jeudi',
    time: '16 h – 18 h',
    start: '16:00',
    end: '18:00',
    place: 'Yopougon, quartier Millionnaire',
    mapsQuery: 'Quartier Millionnaire Yopougon Abidjan',
    title: 'Rappel hebdomadaire de la DDR',
    theme: 'Confrontation des écritures, échanges, débat dans le respect.',
  },
  speakers: [
    {
      id: 'diane',
      name: 'Oustaz Diané',
      role: 'Prédicateur, cofondateur de la DDR',
      bio: 'Surnommé « Ordinateur », Oustaz Diané compare la Bible et le Coran devant tous ceux qui veulent comprendre. Il anime chaque semaine le rappel de la DDR à Yopougon et intervient régulièrement dans les médias ivoiriens.',
      photoUrl: '/images/oustaz-diane.jpg',
      photoCredit: 'Photo : The Code',
      youtube: 'https://www.youtube.com/@LA_DAWAH_DANS_LA_RUE',
      whatsapp: '2250747320455',
    },
    {
      id: 'aka',
      name: 'Ismaël Aka',
      role: 'Prédicateur et débatteur de la DDR',
      bio: 'Ismaël Aka répond aux questions du public et débat avec des contradicteurs de toutes convictions, avec une approche pensée pour parler aux jeunes. Ses débats sont suivis par des centaines de milliers de personnes sur les réseaux.',
      photoUrl: '/images/ismael-aka.jpg',
      photoCredit: 'Photo : Ivoire 5G',
      facebook: 'https://www.facebook.com/ismaelAKAofficiel',
      tiktok: 'https://www.tiktok.com/@ismael.aka.ddr',
      whatsapp: '2250768973405',
    },
    {
      id: 'ouattara',
      name: 'Ibrahim Ouattara',
      role: 'Intervenant de la DDR',
      bio: 'Ibrahim Ouattara intervient aux côtés d’Oustaz Diané et d’Ismaël Aka lors du rappel hebdomadaire de la DDR à Yopougon.',
      photoUrl: '/images/ibrahim-ouattara.jpg',
      photoCredit: 'Photo : La DDR',
    },
  ],
  realisations: [
    { id: 'r1', kind: 'mosquee', title: 'Des mosquées', place: '', text: 'La DDR construit des mosquées pour que chaque communauté ait un lieu de prière digne et accueillant.', photoUrl: '' },
    { id: 'r2', kind: 'forage', title: 'Des forages et châteaux d’eau', place: '', text: 'Des forages et des châteaux d’eau pour apporter l’eau potable là où elle manque.', photoUrl: '' },
    { id: 'r3', kind: 'ecole', title: 'Des écoles', place: '', text: 'Des écoles pour que les enfants apprennent, la religion comme les savoirs.', photoUrl: '' },
    { id: 'r4', kind: 'autre', title: 'Et bien d’autres actions', place: '', text: 'D’autres œuvres de solidarité menées sur le terrain, au service de tous.', photoUrl: '' },
  ],
  banner: { on: false, text: '', link: '', tone: 'or' },
  live: { on: false, title: '', url: '' },
  events: [],
  sections: { rappel: true, realisations: true, videos: true, intervenants: true, priere: true, campagne: true, actualites: true },
};

export function mergeSite(raw: any): SiteContent {
  if (!raw || typeof raw !== 'object') return DEFAULT_SITE;
  const str = (v: any, d: string) => (typeof v === 'string' ? v : d);
  const contact = raw.contact || {};
  const social = raw.social || {};
  const preche = raw.preche || {};
  return {
    contact: {
      phones: Array.isArray(contact.phones) ? contact.phones.filter((p: any) => typeof p === 'string' && p.trim()).slice(0, 5) : DEFAULT_SITE.contact.phones,
      whatsapp: str(contact.whatsapp, DEFAULT_SITE.contact.whatsapp).replace(/\D/g, ''),
      email: str(contact.email, DEFAULT_SITE.contact.email),
      address: str(contact.address, DEFAULT_SITE.contact.address),
    },
    social: {
      youtube: safeUrl(social.youtube, DEFAULT_SITE.social.youtube),
      tiktok: safeUrl(social.tiktok, DEFAULT_SITE.social.tiktok),
      facebook: safeUrl(social.facebook, DEFAULT_SITE.social.facebook),
      instagram: safeUrl(social.instagram, DEFAULT_SITE.social.instagram),
    },
    preche: {
      day: str(preche.day, DEFAULT_SITE.preche.day),
      time: str(preche.time, DEFAULT_SITE.preche.time),
      place: str(preche.place, DEFAULT_SITE.preche.place),
      mapsQuery: str(preche.mapsQuery, DEFAULT_SITE.preche.mapsQuery),
      start: /^\d{1,2}:\d{2}$/.test(preche.start) ? preche.start : DEFAULT_SITE.preche.start,
      end: /^\d{1,2}:\d{2}$/.test(preche.end) ? preche.end : DEFAULT_SITE.preche.end,
      title: str(preche.title, DEFAULT_SITE.preche.title),
      theme: str(preche.theme, DEFAULT_SITE.preche.theme),
    },
    speakers: Array.isArray(raw.speakers)
      ? raw.speakers.slice(0, 12).map((s: any, i: number) => ({
          id: str(s?.id, `s${i}`),
          name: str(s?.name, ''),
          role: str(s?.role, ''),
          bio: str(s?.bio, ''),
          photoUrl: safeUrl(s?.photoUrl, ''),
          photoCredit: str(s?.photoCredit, '').slice(0, 80),
          facebook: safeUrl(s?.facebook, ''),
          youtube: safeUrl(s?.youtube, ''),
          tiktok: safeUrl(s?.tiktok, ''),
          whatsapp: str(s?.whatsapp, '').replace(/\D/g, ''),
        })).filter((s: SpeakerInfo) => s.name)
      : DEFAULT_SITE.speakers,
    realisations: Array.isArray(raw.realisations)
      ? raw.realisations.slice(0, 24).map((r: any, i: number) => ({
          id: str(r?.id, `r${i}`),
          kind: (['mosquee', 'forage', 'ecole', 'autre'].includes(r?.kind) ? r.kind : 'autre') as RealisationKind,
          title: str(r?.title, '').slice(0, 120),
          place: str(r?.place, '').slice(0, 120),
          text: str(r?.text, '').slice(0, 600),
          photoUrl: safeUrl(r?.photoUrl, ''),
        })).filter((r: Realisation) => r.title)
      : DEFAULT_SITE.realisations,
    banner: {
      on: !!raw.banner?.on,
      text: str(raw.banner?.text, '').slice(0, 200),
      link: safeLink(raw.banner?.link),
      tone: (['or', 'vert', 'bleu', 'rouge'].includes(raw.banner?.tone) ? raw.banner.tone : 'or') as SiteContent['banner']['tone'],
    },
    live: { on: !!raw.live?.on, title: str(raw.live?.title, '').slice(0, 140), url: safeUrl(raw.live?.url, '') },
    events: Array.isArray(raw.events)
      ? raw.events.slice(0, 40).map((e: any, i: number) => ({
          id: str(e?.id, `e${i}`),
          title: str(e?.title, '').slice(0, 140),
          date: /^\d{4}-\d{2}-\d{2}$/.test(e?.date) ? e.date : '',
          time: str(e?.time, '').slice(0, 40),
          place: str(e?.place, '').slice(0, 140),
          text: str(e?.text, '').slice(0, 600),
          link: safeLink(e?.link),
        })).filter((e: SiteEvent) => e.title && e.date)
      : [],
    sections: { ...DEFAULT_SITE.sections, ...Object.fromEntries(Object.entries(raw.sections || {}).filter(([k, v]) => k in DEFAULT_SITE.sections && typeof v === 'boolean')) },
  };
}

/** Lien https, ou chemin interne du site (/agenda, /coran…). */
export function safeLink(v: any): string {
  if (typeof v !== 'string') return '';
  const t = v.trim();
  return /^\/[\w\-/#?=&.]*$/.test(t) && !t.startsWith('//') ? t : safeUrl(t, '');
}

/** N'accepte que des liens https (ou vide) pour éviter tout lien piégé. */
export function safeUrl(v: any, d: string): string {
  if (typeof v !== 'string') return d;
  const t = v.trim();
  if (!t) return '';
  return /^https:\/\/[^\s"'<>]+$/i.test(t) || /^\/images\/[\w.-]+$/.test(t) ? t : d;
}

export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`;
export const waHref = (num: string, text?: string) => `https://wa.me/${num.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

const SiteCtx = createContext<{ site: SiteContent; reload: () => void }>({ site: DEFAULT_SITE, reload: () => {} });

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'site_content')
      .maybeSingle()
      .then(({ data }) => {
        const v = (data as any)?.value;
        if (v && typeof v === 'object' && !Array.isArray(v)) setSite(mergeSite(v));
      });
  }, [tick]);
  return <SiteCtx.Provider value={{ site, reload: () => setTick((t) => t + 1) }}>{children}</SiteCtx.Provider>;
};

export const useSite = () => useContext(SiteCtx).site;
export const useSiteReload = () => useContext(SiteCtx).reload;

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Prochaine occurrence du rappel (heure d'Abidjan = UTC+0). Renvoie début et fin. */
export function nextPreche(p: SiteContent['preche'], now = new Date()): { start: Date; end: Date; live: boolean } {
  const wd = Math.max(0, WEEKDAYS.indexOf(p.day.trim().toLowerCase()));
  const [sh, sm] = p.start.split(':').map(Number);
  const [eh, em] = p.end.split(':').map(Number);
  const make = (offsetDays: number) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, sh, sm));
    const e = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, eh, em));
    return { start: d, end: e };
  };
  let delta = (wd - now.getUTCDay() + 7) % 7;
  let r = make(delta);
  if (r.end <= now) r = make(delta + 7);
  return { ...r, live: r.start <= now && now < r.end };
}
