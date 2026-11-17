import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Baby, BookOpen, Calculator, CalendarDays, Clock, GraduationCap, HandHeart, MapPin, MessageCircleHeart, PlayCircle, Search, Users,
} from 'lucide-react';
import PrayerTimes from '../components/PrayerTimes';
import { LogoMark } from '../components/Logo';
import { Avatar, ButtonLink, Container, Eyebrow, SectionHeading, formatFCFA } from '../components/ui';
import { SCHOOL_CAMPAIGN } from '../constants';
import { useSite } from '../lib/site';
import { fetchNews, fetchYoutubeDebates } from '../services/socialService';
import { getCampaign } from '../services/db';
import type { Debate, DonationCampaign, NewsItem } from '../types';

const DUAS = [
  { ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', fr: 'Seigneur, accorde-nous une belle part ici-bas et une belle part dans l’au-delà, et protège-nous du châtiment du Feu.', ref: 'Al-Baqara, 201' },
  { ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', fr: 'Seigneur, ouvre-moi ma poitrine et facilite-moi ma mission.', ref: 'Tâ-Hâ, 25-26' },
  { ar: 'رَبِّ زِدْنِي عِلْمًا', fr: 'Seigneur, accroît mes connaissances.', ref: 'Tâ-Hâ, 114' },
];

const SUGGESTIONS = ['Qui est Allah ?', 'Jésus (Issa) dans le Coran', 'Comment devenir musulman ?', 'Le but de la vie'];

const QUICK = [
  { to: '/khatma', title: 'Lire le Coran', text: 'Arabe, traduction et récitation, juz par juz.', icon: BookOpen, tone: 'from-gold-300/20' },
  { to: '/enfants', title: 'Espace enfants', text: 'Quiz et jeux pour apprendre en s’amusant.', icon: Baby, tone: 'from-sky-400/20' },
  { to: '/chat', title: 'Compagnon DDR', text: 'Posez vos questions sur l’Islam, 24h/24.', icon: MessageCircleHeart, tone: 'from-brand-400/25' },
  { to: '/learning', title: 'Centre du savoir', text: 'Piliers, sunnah et histoires du Prophète ﷺ.', icon: GraduationCap, tone: 'from-emerald-400/20' },
  { to: '/debates', title: 'Débats & directs', text: 'Les prêches et débats de la DDR en vidéo.', icon: PlayCircle, tone: 'from-red-400/20' },
  { to: '/tools', title: 'Outils du croyant', text: 'Calcul de la zakat, cartes de rappel.', icon: Calculator, tone: 'from-violet-400/20' },
];

const Hero = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [dua, setDua] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDua((i) => (i + 1) % DUAS.length), 9000);
    return () => clearInterval(t);
  }, []);
  const ask = (question: string) => question.trim() && navigate(`/chat?q=${encodeURIComponent(question.trim())}`);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
      <div className="absolute left-1/2 top-[-10%] h-[34rem] w-[60rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-night-950" aria-hidden />

      <Container className="relative pb-20 pt-10 text-center md:pb-28 md:pt-16">
        <div className="mx-auto mb-7 w-fit animate-float">
          <LogoMark className="h-16 w-16 drop-shadow-[0_15px_35px_rgba(249,115,22,0.45)] md:h-20 md:w-20" />
        </div>
        <p className="font-arabic text-2xl text-gold-300 md:text-3xl" lang="ar">السَّلَامُ عَلَيْكُمْ</p>
        <h1 className="mx-auto mt-4 max-w-4xl font-serif text-[2.6rem] font-semibold leading-[1.02] text-cream-50 sm:text-6xl md:text-7xl">
          Bienvenue à <span className="text-gradient-gold">La DDR</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sand-400 md:text-xl">
          La Dawah dans la rue : découvrir l’Islam avec douceur, par le dialogue, le savoir et la fraternité. Que vous soyez musulman, chrétien ou simplement curieux, vous êtes chez vous.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink to="/debates" size="lg">
            <PlayCircle className="h-5 w-5" /> Regarder les débats
          </ButtonLink>
          <ButtonLink to="/shahada" size="lg" variant="ghost">
            Je veux découvrir l’Islam
          </ButtonLink>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
          }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <label htmlFor="hero-q" className="mb-3 block text-sm font-semibold text-sand-400">
            Une question ? Le Compagnon DDR vous répond
          </label>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-night-900/80 p-2 pl-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur focus-within:border-brand-500/60">
            <Search className="h-5 w-5 shrink-0 text-brand-400" />
            <input
              id="hero-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex. : Qui est Jésus dans l’Islam ?"
              maxLength={300}
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-cream-50 placeholder:text-sand-500 focus:outline-none"
            />
            <button disabled={!q.trim()} className="shrink-0 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-50">Demander</button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-cream-200 transition hover:border-brand-500/40 hover:text-white">
                {s}
              </button>
            ))}
          </div>
        </form>

        <figure className="mx-auto mt-14 max-w-xl" aria-live="polite">
          <blockquote key={dua} className="animate-fade-up">
            <p className="font-arabic text-2xl leading-loose text-gold-200 md:text-[1.7rem]" lang="ar" dir="rtl">{DUAS[dua].ar}</p>
            <p className="mt-2 text-sm italic text-sand-400">« {DUAS[dua].fr} »</p>
          </blockquote>
          <figcaption className="mt-1 text-xs text-sand-500">{DUAS[dua].ref}</figcaption>
        </figure>
      </Container>
    </section>
  );
};

const QuickAccess = () => (
  <Container className="relative -mt-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {QUICK.map(({ to, title, text, icon: Icon, tone }) => (
        <Link key={to} to={to} className={`card card-hover group relative overflow-hidden p-6`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${tone} to-transparent opacity-60`} aria-hidden />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-brand-300 ring-1 ring-white/10">
              <Icon className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="flex items-center justify-between font-serif text-xl font-semibold text-cream-50">
                {title}
                <ArrowRight className="h-5 w-5 text-sand-500 transition group-hover:translate-x-1 group-hover:text-brand-300" />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-sand-400">{text}</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  </Container>
);

const Preche = ({ videos }: { videos: Debate[] }) => {
  const site = useSite();
  return (
  <section className="py-20 md:py-28">
    <Container>
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Eyebrow>Rendez-vous chaque semaine</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] text-cream-50 md:text-6xl">
            Le prêche du <span className="text-gradient-gold">jeudi</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-sand-400">
            Chaque {site.preche.day} à {site.preche.time}, la DDR vous donne rendez-vous : {site.preche.place}. Un moment de partage, de questions-réponses et de fraternité, ouvert à tous, quelle que soit votre religion.
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="card flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5 text-brand-400" />
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-sand-500">Lieu</dt>
                <dd className="font-semibold text-cream-100">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.preche.mapsQuery || site.preche.place)}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-300">{site.preche.place}</a>
                </dd>
              </div>
            </div>
            <div className="card flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-brand-400" />
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-sand-500">Heure</dt>
                <dd className="font-semibold text-cream-100">Chaque {site.preche.day} · {site.preche.time}</dd>
              </div>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={site.social.youtube} className="!bg-red-600 hover:!bg-red-500 !shadow-none">
              <PlayCircle className="h-5 w-5" /> Suivre en direct sur YouTube
            </ButtonLink>
            <ButtonLink to="/appointments" variant="ghost">
              Poser une question
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-4">
          {videos.length ? (
            <>
              <VideoCard video={videos[0]} big />
              <div className="grid grid-cols-2 gap-4">
                {videos.slice(1, 3).map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </>
          ) : (
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="card card-hover grid aspect-video place-items-center p-8 text-center">
              <span>
                <PlayCircle className="mx-auto h-14 w-14 text-red-500" />
                <span className="mt-4 block font-serif text-2xl text-cream-50">Toutes nos vidéos sur YouTube</span>
                <span className="mt-1 block text-sand-400">Débats, prêches et directs de la DDR</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </Container>
  </section>
);
};

const VideoCard = ({ video, big = false }: { video: Debate; big?: boolean }) => (
  <Link to={`/debates?v=${video.id}`} className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-night-800">
    <div className="aspect-video">
      {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
    {video.isLive && <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white">● EN DIRECT</span>}
    <div className={`absolute bottom-0 left-0 right-0 ${big ? 'p-5' : 'p-3'}`}>
      <p className={`${big ? 'text-lg md:text-xl' : 'text-sm'} line-clamp-2 font-bold text-white`}>{video.title}</p>
      {big && <p className="mt-1 text-xs text-sand-400">{video.date}</p>}
    </div>
    <span className={`absolute right-3 top-3 grid ${big ? 'h-12 w-12' : 'h-9 w-9'} place-items-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-brand-600`}>
      <PlayCircle className={big ? 'h-6 w-6' : 'h-5 w-5'} />
    </span>
  </Link>
);

const Speakers = () => {
  const site = useSite();
  return (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent" aria-hidden />
    <Container className="relative">
      <SectionHeading eyebrow="Nos prédicateurs" title="Les voix de la DDR" subtitle="Deux frères au service du dialogue, de la science et de la vérité, avec respect pour chacun." />
      <div className="grid gap-6 md:grid-cols-2">
        {site.speakers.map((s) => (
          <article key={s.id} className="card card-hover flex flex-col gap-6 p-7 sm:flex-row sm:items-start">
            <Avatar name={s.name} src={s.photoUrl || undefined} className="h-24 w-24 shrink-0 text-3xl" />
            <div>
              <h3 className="font-serif text-2xl font-semibold text-cream-50">{s.name}</h3>
              <p className="text-sm font-bold text-brand-300">{s.role}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-sand-400">{s.bio}</p>
              <div className="mt-4 flex gap-3 text-sm font-semibold">
                {s.whatsapp && <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200">WhatsApp</a>}
                {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="text-cream-200 hover:text-brand-300">Facebook</a>}
                {s.youtube && <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="text-cream-200 hover:text-brand-300">YouTube</a>}
                {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer" className="text-cream-200 hover:text-brand-300">TikTok</a>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Container>
  </section>
);
};

const Campaign = ({ c }: { c: DonationCampaign }) => {
  const pct = Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100));
  return (
    <section className="py-10 md:py-14">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-gold-400/20 bg-gradient-to-br from-night-800 via-night-900 to-brand-950/60 p-8 md:p-14">
          <div className="absolute inset-0 bg-pattern opacity-[0.05]" aria-hidden />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Eyebrow>Sadaqa jariya</Eyebrow>
              <h2 className="mt-5 font-serif text-3xl font-semibold text-cream-50 md:text-5xl">{c.title}</h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-sand-400">{c.description}</p>
              <ul className="mt-6 grid gap-2 text-sm text-cream-200 sm:grid-cols-3">
                {c.trustIndicators.map((t) => (
                  <li key={t.title} className="flex items-center gap-2">
                    <span aria-hidden>{t.icon}</span> {t.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card bg-night-950/50 p-6 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-sand-500">Déjà collecté</p>
                  <p className="font-serif text-3xl font-semibold text-white">{formatFCFA(c.currentAmount)}</p>
                </div>
                <p className="text-2xl font-bold text-gold-300">{pct}%</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-gold-300" style={{ width: `${Math.max(pct, 2)}%` }} />
              </div>
              <p className="mt-2 text-sm text-sand-500">Objectif : {formatFCFA(c.targetAmount)}</p>
              <ButtonLink to="/donations" size="lg" className="mt-6 w-full">
                <HandHeart className="h-5 w-5" /> Participer au projet
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

const LatestNews = ({ news }: { news: NewsItem[] }) => (
  <section className="py-20 md:py-24">
    <Container>
      <SectionHeading
        align="left"
        eyebrow="Actualités"
        title="La vie de la DDR"
        action={
          <ButtonLink to="/news" variant="ghost" size="sm">
            Toutes les actualités <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        }
      />
      <div className="grid gap-6 md:grid-cols-3">
        {news.slice(0, 3).map((n) => (
          <Link key={n.id} to={`/news/${n.id}`} className="card card-hover group overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden bg-night-800">
              {n.imageUrl && <img src={n.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
            </div>
            <div className="p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-300">
                <CalendarDays className="h-3.5 w-3.5" /> {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-cream-50 group-hover:text-brand-200">{n.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-sand-400">{n.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  </section>
);

const Invitation = () => (
  <section className="pb-8 pt-4">
    <Container>
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/shahada" className="group relative overflow-hidden rounded-[2rem] border border-gold-400/25 bg-gradient-to-br from-gold-400/15 to-transparent p-8 md:p-10">
          <p className="font-arabic text-3xl text-gold-200" lang="ar">لا إله إلا الله</p>
          <h3 className="mt-3 font-serif text-3xl font-semibold text-cream-50">Vous souhaitez devenir musulman ?</h3>
          <p className="mt-3 max-w-md text-sand-400">Un frère de la DDR vous accompagne, en toute discrétion, pour prononcer l’attestation de foi et faire vos premiers pas.</p>
          <span className="mt-6 inline-flex items-center gap-2 font-bold text-gold-200">
            Être accompagné <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
        <Link to="/conversions" className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-500/15 to-transparent p-8 md:p-10">
          <Users className="h-9 w-9 text-brand-300" />
          <h3 className="mt-3 font-serif text-3xl font-semibold text-cream-50">Partagez votre témoignage</h3>
          <p className="mt-3 max-w-md text-sand-400">Votre chemin peut toucher d’autres cœurs. Laissez-nous un message écrit ou vocal.</p>
          <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-300">
            Témoigner <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </Container>
  </section>
);

const Home = () => {
  const [videos, setVideos] = useState<Debate[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [campaign, setCampaign] = useState<DonationCampaign>(SCHOOL_CAMPAIGN);

  useEffect(() => {
    fetchYoutubeDebates().then(setVideos);
    fetchNews().then(setNews);
    getCampaign().then(setCampaign);
  }, []);

  return (
    <>
      <Hero />
      <QuickAccess />
      <section className="pt-20 md:pt-28">
        <Container>
          <SectionHeading eyebrow="Horaires de prière" title="Ne manquez aucune prière" />
          <PrayerTimes />
        </Container>
      </section>
      <Preche videos={videos} />
      <Speakers />
      <Campaign c={campaign} />
      {news.length > 0 && <LatestNews news={news} />}
      <Invitation />
    </>
  );
};

export default Home;
