// « Sur le terrain » : les réalisations de la DDR (mosquées, forages et châteaux d'eau, écoles…).
// Contenu modifiable dans l'admin (Contenu du site › Réalisations), photos comprises.
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, HandHeart, HeartHandshake, Landmark, MapPin, School } from 'lucide-react';
import { Container } from './ui';
import { useSite, type RealisationKind } from '../lib/site';

export const KIND_STYLE: Record<RealisationKind, { label: string; icon: React.ComponentType<{ className?: string }>; from: string; to: string }> = {
  mosquee: { label: 'Mosquée', icon: Landmark, from: '#E6B648', to: '#B08118' },
  forage: { label: 'Eau potable', icon: Droplets, from: '#56BDE6', to: '#2382B5' },
  ecole: { label: 'École', icon: School, from: '#B094DD', to: '#7957B5' },
  autre: { label: 'Solidarité', icon: HeartHandshake, from: '#93C26B', to: '#5A8A3A' },
};

const Realisations = ({ compact = false, showCta = true }: { compact?: boolean; showCta?: boolean }) => {
  const site = useSite();
  const items = site.realisations;
  if (!items.length) return null;
  return (
    <section className={compact ? 'py-12' : 'relative overflow-hidden py-24 md:py-32'}>
      <Container>
        <div className="reveal mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em] text-gold-600"><span className="h-px w-8 bg-gold-500/60" /> Sur le terrain</p>
            <h2 className="mt-5 font-serif text-[2.1rem] font-semibold leading-[1.08] text-ink-900 md:text-5xl">La da’wah, c’est aussi bâtir</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">Au-delà de la parole, la DDR construit : des mosquées, des forages et des châteaux d’eau, des écoles, et bien d’autres œuvres au service des populations.</p>
          </div>
          {showCta && (
            <Link to="/donations" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-6 py-3.5 font-bold text-white shadow-lg">
              <HandHeart className="h-5 w-5" /> Soutenir ces projets
            </Link>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((r, i) => {
            const k = KIND_STYLE[r.kind];
            return (
              <article key={r.id} style={{ '--d': `${(i % 4) * 90}ms` } as React.CSSProperties} className="reveal group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_50px_-34px_rgba(20,36,74,0.6)] ring-1 ring-ink-900/[0.06] transition duration-500 hover:-translate-y-1.5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {r.photoUrl ? (
                    <img src={r.photoUrl} alt={r.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="relative grid h-full place-items-center" style={{ background: `linear-gradient(140deg, ${k.from}, ${k.to})` }}>
                      <div className="absolute inset-0 bg-pattern opacity-25 mix-blend-overlay" />
                      <k.icon className="relative h-16 w-16 text-white drop-shadow-lg transition duration-700 group-hover:scale-110" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink-900 backdrop-blur">
                    <k.icon className="h-3.5 w-3.5" style={{ color: k.to }} /> {k.label}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl font-semibold leading-snug text-ink-900">{r.title}</h3>
                  {r.place && <p className="mt-1 flex items-center gap-1 text-sm font-semibold" style={{ color: k.to }}><MapPin className="h-3.5 w-3.5" /> {r.place}</p>}
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{r.text}</p>
                </div>
              </article>
            );
          })}
        </div>
        {showCta && (
          <p className="reveal mt-8 text-center text-sm text-ink-500">
            Vous souhaitez financer un forage, une mosquée ou une école ? <Link to="/appointments" className="font-bold text-brand-700 underline-offset-4 hover:underline">Contactez la DDR <ArrowRight className="inline h-4 w-4" /></Link>
          </p>
        )}
      </Container>
    </section>
  );
};

export default Realisations;
