// Le Journal de la DDR — identité bleu ardoise.
// Mélange les articles publiés par l'admin et les dernières vidéos, avec filtres et « à la une ».
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, Megaphone, Newspaper, PlayCircle, Sparkles, Bell } from 'lucide-react';
import RubriqueHero from '../components/RubriqueHero';
import NextRappel from '../components/NextRappel';
import { LogoMark } from '../components/Logo';
import { Container } from '../components/ui';
import { fetchNews, fetchYoutubeDebates } from '../services/socialService';
import { useSite, waHref } from '../lib/site';
import { rubriqueVars } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';
import type { NewsItem } from '../types';

type Kind = 'Announcement' | 'Event' | 'News' | 'Video';
type Entry = { id: string; kind: Kind; title: string; summary: string; image?: string; date?: string; when: number; to: string; minutes?: number };

const KIND: Record<Kind, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Announcement: { label: 'Annonce', icon: Megaphone, color: '#C27A2A' },
  Event: { label: 'Événement', icon: CalendarDays, color: '#5A5DB8' },
  News: { label: 'Actualité', icon: Newspaper, color: '#3B6A80' },
  Video: { label: 'Vidéo', icon: PlayCircle, color: '#2F57A8' },
};
const FILTERS: (Kind | 'all')[] = ['all', 'Announcement', 'Event', 'News', 'Video'];

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const Chip = ({ kind }: { kind: Kind }) => {
  const k = KIND[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: k.color }}>
      <k.icon className="h-3.5 w-3.5" /> {k.label}
    </span>
  );
};

const Cover = ({ e, className = '' }: { e: Entry; className?: string }) =>
  e.image ? (
    <img src={e.image} alt="" loading="lazy" className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${className}`} />
  ) : (
    <div className="r-grad relative grid h-full w-full place-items-center">
      <div className="absolute inset-0 bg-pattern opacity-25 mix-blend-overlay" />
      <LogoMark tone="light" className="relative h-16 w-auto opacity-90" />
    </div>
  );

const News = () => {
  const site = useSite();
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [videos, setVideos] = useState<Entry[]>([]);
  const [filter, setFilter] = useState<Kind | 'all'>('all');

  useEffect(() => {
    fetchNews().then(setNews);
    fetchYoutubeDebates().then((v) =>
      setVideos(
        v.slice(0, 9).map((d, i) => ({
          id: `v-${d.id}`, kind: 'Video' as Kind, title: d.title, summary: d.description || 'Revivez ce moment de la DDR en vidéo.',
          image: d.thumbnailUrl, date: d.date, when: Date.parse(d.date) || Date.now() - (i + 1) * 864e5 * 3, to: `/debates?v=${d.id}`,
        })),
      ),
    );
  }, []);

  const entries = useMemo<Entry[]>(() => {
    const articles: Entry[] = (news || []).map((n) => ({
      id: n.id, kind: n.category, title: n.title, summary: n.content, image: n.imageUrl || undefined,
      date: fmtDate(n.createdAt), when: Date.parse(n.createdAt), to: `/news/${n.id}`, minutes: readingMinutes(`${n.content} ${n.body || ''}`),
    }));
    // Les articles passent devant, puis les vidéos (par date)
    return [...articles.sort((a, b) => b.when - a.when), ...videos.sort((a, b) => b.when - a.when)];
  }, [news, videos]);

  const shown = filter === 'all' ? entries : entries.filter((e) => e.kind === filter);
  const [une, ...rest] = shown;
  useReveal([shown.length, filter]);

  return (
    <div style={rubriqueVars('actualites')}>
      <RubriqueHero k="actualites" icon={Newspaper} title="Le Journal de la DDR" subtitle="Annonces, événements, tournées et vidéos : toute la vie de l’association, au même endroit." />

      <section className="relative z-10 -mt-8">
        <Container>
          <div className="reveal no-scrollbar flex gap-2 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_20px_40px_-28px_rgba(47,86,104,0.7)] ring-1 ring-ink-900/[0.06] sm:w-fit">
            {FILTERS.map((f) => {
              const n = f === 'all' ? entries.length : entries.filter((e) => e.kind === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${filter === f ? 'r-grad text-white shadow' : 'text-ink-700 hover:bg-ivory-200'}`}>
                  {f === 'all' ? 'Tout' : KIND[f].label} <span className="opacity-60">{n}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          {news === null && videos.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-ink-900/5" />)}</div>
          ) : !une ? (
            <div className="reveal rounded-[2rem] bg-white p-10 text-center ring-1 ring-ink-900/[0.06]">
              <Sparkles className="r-ink mx-auto h-10 w-10" />
              <p className="mt-3 font-serif text-2xl font-semibold text-ink-900">Rien dans cette catégorie pour l’instant</p>
              <button onClick={() => setFilter('all')} className="r-ink mt-3 font-bold">Tout afficher</button>
            </div>
          ) : (
            <>
              {/* À la une */}
              <Link to={une.to} className="reveal group grid overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-50px_rgba(47,86,104,0.9)] ring-1 ring-ink-900/[0.06] md:grid-cols-[1.25fr_1fr]">
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[24rem]">
                  <Cover e={une} />
                  {une.kind === 'Video' && <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2F57A8] shadow-xl transition group-hover:scale-110"><PlayCircle className="h-10 w-10" /></span>}
                </div>
                <div className="flex flex-col justify-center p-7 md:p-10">
                  <p className="r-ink text-[12px] font-extrabold uppercase tracking-[0.24em]">À la une</p>
                  <div className="mt-3"><Chip kind={une.kind} /></div>
                  <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">{une.title}</h2>
                  <p className="mt-4 line-clamp-4 text-ink-500">{une.summary}</p>
                  <p className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-400">
                    {une.date && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {une.date}</span>}
                    {une.minutes && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {une.minutes} min de lecture</span>}
                  </p>
                  <span className="r-ink mt-6 inline-flex items-center gap-2 font-bold">{une.kind === 'Video' ? 'Regarder' : 'Lire l’article'} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>

              {/* Le reste */}
              {rest.length > 0 && (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((e, i) => (
                    <Link key={e.id} to={e.to} style={{ '--d': `${(i % 3) * 90}ms` } as React.CSSProperties} className="reveal group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_44px_-34px_rgba(47,86,104,0.8)] ring-1 ring-ink-900/[0.06] transition duration-500 hover:-translate-y-1.5">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Cover e={e} />
                        <span className="absolute left-3 top-3"><Chip kind={e.kind} /></span>
                        {e.kind === 'Video' && <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#2F57A8] shadow transition group-hover:scale-110"><PlayCircle className="h-6 w-6" /></span>}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-snug text-ink-900">{e.title}</h3>
                        <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-500">{e.summary}</p>
                        <p className="mt-4 flex items-center gap-3 text-xs font-semibold text-ink-400">
                          {e.date && <span>{e.date}</span>}
                          {e.minutes && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.minutes} min</span>}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* Toujours d'actualité : le rappel du jeudi */}
      <NextRappel flush />

      <section className="py-16">
        <Container>
          <div className="reveal r-soft flex flex-col items-center gap-5 rounded-[2rem] p-8 text-center md:flex-row md:p-10 md:text-left">
            <span className="r-grad grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white shadow-lg"><Bell className="h-8 w-8" /></span>
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-semibold text-ink-900">Ne manquez aucune nouvelle</h2>
              <p className="mt-1 text-ink-500">Recevez les annonces de la DDR directement sur WhatsApp, ou inscrivez-vous par e-mail en bas de page.</p>
            </div>
            <a href={waHref(site.contact.whatsapp, 'Salam, je souhaite recevoir les annonces de la DDR.')} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg">Recevoir sur WhatsApp</a>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default News;
