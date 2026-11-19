import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Container, Spinner } from '../components/ui';
import { getNews } from '../services/db';
import type { NewsItem } from '../types';

const NewsDetail = () => {
  const { id = '' } = useParams();
  const [article, setArticle] = useState<NewsItem | null | undefined>(undefined);

  useEffect(() => {
    getNews(id).then(setArticle).catch(() => setArticle(null));
    window.scrollTo(0, 0);
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: article?.title, url }).catch(() => {});
    else await navigator.clipboard?.writeText(url);
  };

  if (article === undefined) return <div className="grid min-h-[50vh] place-items-center text-brand-600"><Spinner className="h-8 w-8" /></div>;
  if (article === null) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Article introuvable</h1>
        <Link to="/news" className="mt-6 inline-block font-bold text-brand-700">← Toutes les actualités</Link>
      </Container>
    );
  }

  return (
    <article className="pb-10">
      {article.imageUrl && (
        <div className="relative h-[42vh] min-h-[280px] overflow-hidden">
          <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory-100 via-ivory-100/40 to-transparent" />
        </div>
      )}
      <Container className={`max-w-3xl ${article.imageUrl ? '-mt-32 relative' : 'pt-14'}`}>
        <Link to="/news" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"><ArrowLeft className="h-4 w-4" /> Actualités</Link>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink-900 md:text-5xl">{article.title}</h1>
        <div className="mt-4 flex items-center justify-between border-b border-ink-900/5 pb-6 text-sm text-ink-500">
          <span>{article.author} · {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <button onClick={share} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-ink-900/5 hover:text-ink-900"><Share2 className="h-4 w-4" /> Partager</button>
        </div>
        <p className="mt-8 text-xl leading-relaxed text-ink-800">{article.content}</p>
        <div className="prose-ddr mt-6 text-lg text-ink-700">
          <ReactMarkdown>{article.body || ''}</ReactMarkdown>
        </div>
      </Container>
    </article>
  );
};

export default NewsDetail;
