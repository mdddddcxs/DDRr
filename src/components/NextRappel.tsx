// Bloc « Prochain rappel » : date calculée, compte à rebours, agenda, itinéraire, partage.
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CalendarPlus, Clock, MapPin, Navigation, PlayCircle, Share2 } from 'lucide-react';
import { ButtonLink, Container } from './ui';
import { nextPreche, useSite } from '../lib/site';

const TZ = 'Africa/Abidjan';

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em] text-gold-300">
    <span className="h-px w-8 bg-gold-300/60" />
    {children}
  </p>
);

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function downloadIcs(start: Date, end: Date, title: string, place: string, desc: string) {
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La DDR//Site//FR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:rappel-${icsStamp(start)}@la-ddr`, `DTSTAMP:${icsStamp(new Date())}`, `DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(end)}`,
    `SUMMARY:${esc(title)}`, `LOCATION:${esc(place)}`, `DESCRIPTION:${esc(desc)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rappel-ddr.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const useNow = (ms = 30000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
};

const Countdown = ({ to }: { to: Date }) => {
  const now = useNow(1000);
  const s = Math.max(0, Math.floor((to.getTime() - now.getTime()) / 1000));
  const parts = [
    { v: Math.floor(s / 86400), l: 'jours' },
    { v: Math.floor((s % 86400) / 3600), l: 'heures' },
    { v: Math.floor((s % 3600) / 60), l: 'min' },
    { v: s % 60, l: 'sec' },
  ];
  return (
    <div className="flex gap-2 sm:gap-3" aria-label="Compte à rebours avant le prochain rappel">
      {parts.map((p) => (
        <div key={p.l} className="min-w-[3.6rem] rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2.5 text-center sm:min-w-[4.2rem]">
          <span className="block font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">{String(p.v).padStart(2, '0')}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">{p.l}</span>
        </div>
      ))}
    </div>
  );
};

const NextRappel = ({ flush = false }: { flush?: boolean }) => {
  const site = useSite();
  const p = site.preche;
  const now = useNow();
  const { start, end, live } = useMemo(() => nextPreche(p, now), [p, now]);
  const date = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapsQuery)}`;
  const share = `${p.title} : ${date}, ${p.time}, ${p.place}. ${p.theme} Ouvert à tous ! https://la-ddr.vercel.app`;

  return (
    <section id="rappel" className={`relative z-10 scroll-mt-28 ${flush ? '' : 'pt-20 md:pt-24'}`}>
      <Container>
        <div className="reveal border-flow rounded-[2.1rem] p-[2px] shadow-[0_40px_80px_-40px_rgba(20,36,74,0.9)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 text-white">
          <div className="absolute inset-0 bg-pattern opacity-[0.07]" aria-hidden />
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/30 blur-[90px]" aria-hidden />
          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Kicker>{live ? 'En ce moment' : 'Prochain rendez-vous'}</Kicker>
                {live && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse-ring" /> Le rappel a lieu maintenant
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-[2.7rem]">{p.title}</h2>
              <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-white/75">{p.theme} Venez avec vos questions : chacun est le bienvenu, quelle que soit sa religion.</p>

              <dl className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: CalendarDays, k: 'Date', v: date },
                  { icon: Clock, k: 'Horaire', v: p.time },
                  { icon: MapPin, k: 'Lieu', v: p.place },
                ].map(({ icon: Icon, k, v }) => (
                  <div key={k} className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-3.5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">{k}</dt>
                      <dd className="font-semibold capitalize-first leading-snug">{v}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {live ? (
                  <ButtonLink to="/debates" size="md"><PlayCircle className="h-5 w-5" /> Suivre le direct</ButtonLink>
                ) : (
                  <button onClick={() => downloadIcs(start, end, p.title, p.place, p.theme)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-3 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(226,112,10,0.9)] transition hover:brightness-105">
                    <CalendarPlus className="h-5 w-5" /> Ajouter à mon agenda
                  </button>
                )}
                <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[15px] font-bold transition hover:bg-white hover:text-ink-900">
                  <Navigation className="h-4 w-4" /> Itinéraire
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[15px] font-bold transition hover:bg-white hover:text-ink-900">
                  <Share2 className="h-4 w-4" /> Inviter un proche
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:border-l lg:border-white/10 lg:pl-12">
              {!live && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-white/60">Il reste</p>
                  <Countdown to={start} />
                </div>
              )}
              <a href="/images/affiche-rappel-hebdo.jpg" target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-2xl ring-1 ring-white/15">
                <img src="/images/affiche-rappel-hebdo.jpg" alt={`Affiche : ${p.title}`} loading="lazy" className="h-52 w-full object-cover object-[50%_22%] transition duration-700 group-hover:scale-105 lg:h-72" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
                <span className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-sm font-bold">
                  Voir l’affiche <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </div>
        </div>
        </div>
      </Container>
    </section>
  );
};


export default NextRappel;
