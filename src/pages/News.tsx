import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Newspaper } from 'lucide-react';
import { ButtonLink, Container, PageHero } from '../components/ui';
import { fetchNews } from '../services/socialService';
import { useSite } from '../lib/site';
import type { NewsItem } from '../types';

const CATEGORY: Record<NewsItem['category'], string> = { Event: 'Événement', News: 'Actualité', Announcement: 'Annonce' };
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const News = () => {
  const site = useSite();
  const [news, setNews] = useState<NewsItem[] | null>(null);
  useEffect(() => {
    fetchNews().then(setNews);
  }, []);
  const [first, ...rest] = news || [];

  return (
    <>
      <PageHero eyebrow="Actualités" title={<>La vie de <span className="text-gradient-gold">la DDR</span></>} subtitle="Conférences, tournées, annonces et projets de l’association." />
      <Container className="pb-10">
        {news === null ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-ink-900/5" />)}
          </div>
        ) : news.length === 0 ? (
          <div className="card mx-auto max-w-xl p-10 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-brand-600" />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-ink-900">Les premières actualités arrivent bientôt</h2>
            <p className="mt-2 text-ink-500">En attendant, suivez la DDR sur ses réseaux.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={site.social.facebook} variant="ghost" size="sm">Facebook</ButtonLink>
              <ButtonLink href={site.social.youtube} variant="ghost" size="sm">YouTube</ButtonLink>
              <ButtonLink href={site.social.tiktok} variant="ghost" size="sm">TikTok</ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <Link to={`/news/${first.id}`} className="card card-hover group grid overflow-hidden md:grid-cols-2">
              <div className="aspect-[16/10] bg-ivory-200 md:aspect-auto">
                {first.imageUrl && <img src={first.imageUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
              </div>
              <div className="flex flex-col justify-center p-7 md:p-10">
                <span className="w-fit rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">{CATEGORY[first.category]}</span>
                <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink-900 group-hover:text-brand-800 md:text-4xl">{first.title}</h2>
                <p className="mt-4 text-ink-500">{first.content}</p>
                <p className="mt-6 flex items-center gap-2 text-sm text-ink-400"><CalendarDays className="h-4 w-4" /> {fmtDate(first.createdAt)}</p>
              </div>
            </Link>
            {rest.length > 0 && (
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {rest.map((n) => (
                  <Link key={n.id} to={`/news/${n.id}`} className="card card-hover group overflow-hidden">
                    <div className="aspect-[16/10] overflow-hidden bg-ivory-200">
                      {n.imageUrl && <img src={n.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{CATEGORY[n.category]} · {fmtDate(n.createdAt)}</p>
                      <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink-900 group-hover:text-brand-800">{n.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-ink-500">{n.content}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default News;
