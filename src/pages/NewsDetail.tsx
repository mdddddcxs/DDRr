import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowRight, Clock, Copy, Link2 } from 'lucide-react';
import { Container, Spinner } from '../components/ui';
import { LogoMark } from '../components/Logo';
import { getNews } from '../services/db';
import { fetchNews } from '../services/socialService';
import { rubriqueVars } from '../lib/rubriques';
import type { NewsItem } from '../types';

const LABEL: Record<NewsItem['category'], string> = { Event: 'Événement', News: 'Actualité', Announcement: 'Annonce' };
const minutes = (t: string) => Math.max(1, Math.round(t.split(/\s+/).filter(Boolean).length / 200));

/** Barre de progression de lecture en haut de l'écran. */
const ReadingBar = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setP(Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <div className="r-grad fixed left-0 top-0 z-[70] h-1 transition-[width] duration-150" style={{ width: `${p}%` }} aria-hidden />;
};

const NewsDetail = () => {
  const { id = '' } = useParams();
  const [article, setArticle] = useState<NewsItem | null | undefined>(undefined);
  const [others, setOthers] = useState<NewsItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setArticle(undefined);
    getNews(id).then(setArticle).catch(() => setArticle(null));
    fetchNews().then((n) => setOthers(n.filter((x) => x.id !== id).slice(0, 3)));
    window.scrollTo(0, 0);
  }, [id]);

  if (article === undefined) return <div className="grid min-h-[50vh] place-items-center text-[#3B6A80]"><Spinner className="h-8 w-8" /></div>;
  if (article === null) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Article introuvable</h1>
        <Link to="/news" className="mt-6 inline-block font-bold text-[#2F5668]">← Le Journal de la DDR</Link>
      </Container>
    );
  }

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const share = encodeURIComponent(`${article.title} — La DDR\n${url}`);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <article style={rubriqueVars('actualites')} className="pb-10">
      <ReadingBar />
      <div className="relative h-[46vh] min-h-[300px] overflow-hidden">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="r-grad relative grid h-full place-items-center">
            <div className="absolute inset-0 bg-pattern opacity-25 mix-blend-overlay" />
            <LogoMark tone="light" className="relative h-24 w-auto opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ivory-100 via-ivory-100/30 to-transparent" />
      </div>
      <Container className="relative -mt-40 max-w-3xl">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgba(47,86,104,0.9)] ring-1 ring-ink-900/[0.06] sm:p-10">
          <Link to="/news" className="r-ink inline-flex items-center gap-1 text-sm font-bold"><ArrowLeft className="h-4 w-4" /> Le Journal de la DDR</Link>
          <p className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="r-grad rounded-full px-3 py-1 text-xs font-bold text-white">{LABEL[article.category]}</span>
            <span className="text-ink-500">{new Date(article.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1 text-ink-500"><Clock className="h-4 w-4" /> {minutes(`${article.content} ${article.body || ''}`)} min de lecture</span>
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] text-ink-900 md:text-5xl">{article.title}</h1>
          <p className="mt-6 border-l-4 border-[var(--r-from)] pl-5 text-xl leading-relaxed text-ink-800">{article.content}</p>
          <div className="prose-ddr mt-8 text-lg leading-relaxed text-ink-700">
            <ReactMarkdown>{article.body || ''}</ReactMarkdown>
          </div>
          <p className="mt-8 text-sm font-semibold text-ink-400">Par {article.author}</p>

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-ink-900/[0.06] pt-6">
            <span className="mr-1 text-sm font-bold text-ink-700">Partager :</span>
            <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">WhatsApp</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#1877F2] px-4 py-2 text-sm font-bold text-white">Facebook</a>
            <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-4 py-2 text-sm font-bold text-ink-700">{copied ? <><Copy className="h-4 w-4" /> Lien copié</> : <><Link2 className="h-4 w-4" /> Copier le lien</>}</button>
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-2xl font-semibold text-ink-900">À lire aussi</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {others.map((n) => (
                <Link key={n.id} to={`/news/${n.id}`} className="group rounded-2xl bg-white p-5 ring-1 ring-ink-900/[0.06] transition hover:-translate-y-1 hover:shadow-lg">
                  <p className="r-ink text-xs font-bold uppercase tracking-wide">{LABEL[n.category]}</p>
                  <p className="mt-2 line-clamp-3 font-serif text-lg font-semibold leading-snug text-ink-900">{n.title}</p>
                  <span className="r-ink mt-3 inline-flex items-center gap-1 text-sm font-bold">Lire <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </article>
  );
};

export default NewsDetail;
