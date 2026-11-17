import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayCircle, Search, X } from 'lucide-react';
import { ButtonLink, Container, PageHero } from '../components/ui';
import { fetchYoutubeDebates } from '../services/socialService';
import { SOCIAL_LINKS } from '../constants';
import type { Debate } from '../types';

const Debates = () => {
  const [videos, setVideos] = useState<Debate[] | null>(null);
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();
  const playing = params.get('v');

  useEffect(() => {
    fetchYoutubeDebates().then(setVideos);
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (videos || []).filter((v) => !q || v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
  }, [videos, query]);
  const current = videos?.find((v) => v.id === playing) || null;

  const play = (id: string | null) => {
    setParams(id ? { v: id } : {}, { replace: true });
    if (id) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHero
        eyebrow="Médiathèque"
        title={<>Débats & <span className="text-gradient-gold">prêches</span></>}
        subtitle="Les échanges de la DDR, en direct et en replay. Des discussions franches, toujours dans le respect."
      >
        <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-white/10 bg-night-900/80 p-1.5 pl-5">
          <Search className="h-5 w-5 text-brand-400" />
          <label htmlFor="v-search" className="sr-only">Rechercher une vidéo</label>
          <input id="v-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un thème : Jésus, Bible, prière…" className="min-w-0 flex-1 bg-transparent py-2.5 text-cream-50 placeholder:text-sand-500 focus:outline-none" />
          {query && (
            <button onClick={() => setQuery('')} className="rounded-full p-2 text-sand-400 hover:text-white" aria-label="Effacer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PageHero>

      <Container className="pb-10">
        {current && (
          <section className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-black" aria-label="Lecture en cours">
            <div className="aspect-video">
              <iframe
                src={`${current.videoUrl}?autoplay=1&rel=0`}
                title={current.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="flex items-start justify-between gap-4 p-5 md:p-6">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-cream-50">{current.title}</h2>
                <p className="mt-1 text-sm text-sand-400">{current.date}</p>
              </div>
              <button onClick={() => play(null)} className="rounded-full p-2 text-sand-400 hover:bg-white/5 hover:text-white" aria-label="Fermer la vidéo">
                <X className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {videos === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="card mx-auto max-w-xl p-10 text-center">
            <PlayCircle className="mx-auto h-14 w-14 text-red-500" />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-cream-50">Retrouvez toutes nos vidéos sur YouTube</h2>
            <p className="mt-2 text-sand-400">Débats, prêches du jeudi et directs : abonnez-vous pour ne rien manquer.</p>
            <ButtonLink href={SOCIAL_LINKS.youtube} className="mt-6 !bg-red-600 hover:!bg-red-500">Ouvrir la chaîne YouTube</ButtonLink>
          </div>
        ) : list.length === 0 ? (
          <p className="py-16 text-center text-sand-400">Aucune vidéo ne correspond à « {query} ».</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <button key={v.id} onClick={() => play(v.id)} className="card card-hover group overflow-hidden text-left">
                <div className="relative aspect-video overflow-hidden bg-night-800">
                  {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-brand-600">
                      <PlayCircle className="h-7 w-7" />
                    </span>
                  </span>
                  {v.isLive && <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white">● EN DIRECT</span>}
                  {v.isUpcoming && <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-extrabold text-night-950">BIENTÔT EN DIRECT</span>}
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 font-bold leading-snug text-cream-50 group-hover:text-brand-200">{v.title}</h3>
                  <p className="mt-2 text-xs text-sand-500">{v.date}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {videos && videos.length > 0 && (
          <div className="mt-12 text-center">
            <ButtonLink href={SOCIAL_LINKS.youtube} variant="ghost">Voir toutes les vidéos sur YouTube</ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
};

export default Debates;
