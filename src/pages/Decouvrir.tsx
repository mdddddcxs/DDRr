// Découvrir l'Islam — identité turquoise. Un voyage en images, sans jargon.
// Photos : Wikimedia Commons (licences libres, auteurs crédités sous chaque image).
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Compass, GraduationCap, Heart, MapPin, MessageCircleHeart, PlayCircle, Users, X } from 'lucide-react';
import { Container } from '../components/ui';
import { rubriqueVars } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';

const commons = (file: string, w = 1280) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;

type Photo = { file: string; title: string; place: string; story: string; credit: string };

const PHOTOS: Record<string, Photo> = {
  kaaba: { file: 'Mosquée Masjid el Haram à la Mecque.jpg', title: 'La Kaaba', place: 'La Mecque, Arabie saoudite', story: 'Au cœur de la Grande Mosquée de La Mecque, la Kaaba. Où qu’ils soient dans le monde, les musulmans se tournent vers elle pour prier : c’est la qibla.', credit: 'Photo : Tab59 · domaine public · Wikimedia Commons' },
  pelerin: { file: 'Supplicating Pilgrim at Masjid Al Haram. Mecca, Saudi Arabia.jpg', title: 'Un pèlerin en prière', place: 'La Mecque', story: 'Le pèlerinage (hajj) réunit chaque année des fidèles venus de tous les pays, vêtus de la même simplicité, égaux devant Dieu.', credit: 'Photo : Ali Mansuri · CC BY-SA 2.5 · Wikimedia Commons' },
  medine: { file: 'Mescidi nebevi.JPG', title: 'La Mosquée du Prophète', place: 'Médine, Arabie saoudite', story: 'Bâtie par le Prophète Muhammad ﷺ vers l’an 622, après l’hégire, puis agrandie au fil des siècles. Son dôme vert est l’un des symboles les plus connus de l’Islam.', credit: 'Photo : Noumenon · CC BY-SA 3.0 · Wikimedia Commons' },
  djenne: { file: 'Great Mosque of Djenné 1.jpg', title: 'La Grande Mosquée de Djenné', place: 'Djenné, Mali', story: 'Le plus grand édifice en terre crue du monde, reconstruit en 1907. Chaque année, tout le village se rassemble pour lui redonner son enduit : une fête de la communauté.', credit: 'Photo : Andy Gilham · CC BY-SA 3.0 · Wikimedia Commons' },
  kong: { file: 'Pg313 Une Mosquée de Kong.jpg', title: 'La mosquée de Kong', place: 'Kong, Côte d’Ivoire', story: 'Ici gravée en 1892 par l’explorateur Binger, la Grande Mosquée de Kong, de style soudanais, fait partie des mosquées du nord ivoirien inscrites au patrimoine mondial de l’UNESCO en 2021.', credit: 'Gravure : L.-G. Binger, 1892 · British Library · domaine public' },
  bobo: { file: 'BoboDioulasso-GrandMosqueE.JPG', title: 'La Grande Mosquée de Bobo-Dioulasso', place: 'Burkina Faso', story: 'Ses piliers de terre hérissés de bois sont typiques de l’architecture soudano-sahélienne, que l’on retrouve jusqu’au nord de la Côte d’Ivoire.', credit: 'Photo : contributeur de Wikimedia Commons · CC BY-SA 3.0' },
  istiqlal: { file: 'Baitul Mukarram Mosque Eid al-Fitr Prayer Congregation 2023-04-22 (PID-0016455).jpg', title: 'La prière de l’Aïd', place: 'Mosquée nationale Baitul Mukarram, Dacca, Bangladesh', story: 'Des milliers de fidèles réunis pour la prière de la fin du Ramadan, épaule contre épaule, sans distinction de rang ni de richesse.', credit: 'Photo : Press Information Department (Bangladesh) · domaine public · Wikimedia Commons' },
};

const HERO_SLIDES = ['kaaba', 'djenne', 'istiqlal', 'medine'];
const VOYAGE = ['kaaba', 'medine', 'djenne', 'kong', 'bobo'];

const REPERES = [
  { icon: '☝️', title: 'Un seul Dieu', text: 'Allah est simplement le mot arabe pour « Dieu » : le Créateur unique, sans associé, le même Dieu qu’adoraient Abraham, Moïse et Jésus.' },
  { icon: '🌿', title: 'Des prophètes', text: 'Adam, Noé, Abraham, Moïse, Jésus et Muhammad ﷺ, et bien d’autres : tous ont porté le même message d’adoration du Dieu unique.' },
  { icon: '📖', title: 'Un livre', text: 'Le Coran, la parole de Dieu révélée au Prophète Muhammad ﷺ en arabe, il y a plus de quatorze siècles, et récitée par cœur jusqu’à nos jours.' },
  { icon: '🕋', title: 'Cinq piliers', text: 'L’attestation de foi, la prière, l’aumône, le jeûne du Ramadan et le pèlerinage à La Mecque pour qui le peut.' },
];

const JOURNEE = [
  { name: 'Fajr', fr: 'L’aube', sky: 'linear-gradient(180deg,#2b2f6b,#c06c8c 70%,#f2b48b)', text: 'Avant le lever du soleil, la journée commence par un rendez-vous avec Dieu.' },
  { name: 'Dhouhr', fr: 'Midi', sky: 'linear-gradient(180deg,#4aa3e0,#a8dcf5)', text: 'Au milieu des occupations, une pause pour se recentrer.' },
  { name: '‘Asr', fr: 'L’après-midi', sky: 'linear-gradient(180deg,#7fb3d6,#f3d9a0)', text: 'Quand les ombres s’allongent, on se souvient de l’essentiel.' },
  { name: 'Maghrib', fr: 'Le coucher du soleil', sky: 'linear-gradient(180deg,#5b3a7a,#e2733f 60%,#f6c26b)', text: 'Le soleil disparaît ; c’est aussi l’heure où l’on rompt le jeûne pendant le Ramadan.' },
  { name: '‘Icha', fr: 'La nuit', sky: 'linear-gradient(180deg,#071a2b,#173c5a)', text: 'La dernière prière, avant de confier sa nuit à Dieu.' },
];

const IDEES = [
  { q: '« Allah » est-il un autre Dieu ?', a: 'Non. « Allah » signifie simplement « Dieu » en arabe. Les chrétiens arabophones disent eux aussi « Allah » dans leurs prières et dans leurs Bibles.' },
  { q: 'Faut-il être arabe pour être musulman ?', a: 'Non. L’Islam s’adresse à toute l’humanité, et la grande majorité des musulmans ne sont pas arabes : le pays qui compte le plus de musulmans est l’Indonésie, et l’Afrique en compte des centaines de millions.' },
  { q: 'Les musulmans croient-ils en Jésus ?', a: 'Oui. Jésus (‘Îsâ) est l’un des plus grands prophètes de l’Islam, né miraculeusement de la Vierge Marie. Le Coran lui consacre de nombreux versets, et une sourate entière porte le nom de sa mère.' },
  { q: 'Que veut dire le mot « jihad » ?', a: 'Il signifie « effort ». Il désigne d’abord l’effort que chacun fait sur lui-même pour faire le bien, résister au mal et progresser dans sa foi.' },
  { q: 'Devenir musulman, c’est compliqué ?', a: 'Non. On devient musulman en prononçant sincèrement l’attestation de foi (la shahada). La DDR accompagne ensuite chacun, à son rythme, pour apprendre la prière et les bases.' },
];

const QUESTIONS = ['Qui est Jésus dans l’Islam ?', 'Pourquoi prier cinq fois par jour ?', 'Quelle différence entre Islam et christianisme ?', 'Que dit le Coran sur Marie ?', 'Comment devenir musulman ?'];

/* ---------------- Briques ---------------- */

// Image robuste : si la photo ne charge pas (réseau lent, fichier renommé), un dégradé turquoise prend le relais.
const Photo = ({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <span role="img" aria-label={alt} className={`block bg-[linear-gradient(135deg,#22AFA9,#0D7279_60%,#05262a)] ${className}`} />;
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} className={className} />;
};

const Kicker = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em] ${light ? 'text-[#9fe3dd]' : 'r-ink'}`}>
    <span className={`h-1 w-8 rounded-full ${light ? 'bg-[#9fe3dd]' : 'r-grad'}`} />
    {children}
  </p>
);
const H2 = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <h2 className={`mt-4 font-serif text-3xl font-semibold leading-tight md:text-5xl ${light ? 'text-white' : 'text-ink-900'}`}>{children}</h2>
);

const Lightbox = ({ photo, onClose }: { photo: Photo; onClose: () => void }) => {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#05262a]/90 p-4 backdrop-blur animate-fade-up" role="dialog" aria-modal="true" aria-label={photo.title} onClick={onClose}>
      <button onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Fermer"><X className="h-6 w-6" /></button>
      <figure className="max-w-5xl overflow-hidden rounded-3xl bg-[#0b3a3e] text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <img src={commons(photo.file, 1920)} alt={photo.title} className="max-h-[68vh] w-full object-contain" />
        <figcaption className="p-5 sm:p-7">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#9fe3dd]"><MapPin className="h-4 w-4" /> {photo.place}</p>
          <p className="mt-1 font-serif text-2xl font-semibold">{photo.title}</p>
          <p className="mt-2 max-w-3xl text-white/80">{photo.story}</p>
          <p className="mt-3 text-xs text-white/50">{photo.credit}</p>
        </figcaption>
      </figure>
    </div>
  );
};

/* ---------------- Ouverture : diaporama plein écran ---------------- */

const Hero = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HERO_SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const current = PHOTOS[HERO_SLIDES[i]];
  return (
    <header className="relative -mt-[84px] min-h-[88vh] overflow-hidden pt-[84px] text-white">
      {HERO_SLIDES.map((k, n) => (
        <img
          key={k}
          src={commons(PHOTOS[k].file, 1920)}
          alt=""
          aria-hidden={n !== i}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ${n === i ? 'opacity-100 animate-[kenburns_9s_ease-out_both]' : 'opacity-0'}`}
          loading={n === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,38,42,.55)_0%,rgba(11,94,102,.55)_45%,rgba(5,38,42,.92)_100%)]" aria-hidden />
      <div className="absolute inset-0 bg-pattern opacity-[0.08]" aria-hidden />
      <Container className="relative flex min-h-[calc(88vh-84px)] flex-col items-center justify-center pb-24 pt-10 text-center">
        <nav aria-label="Fil d’Ariane" className="mb-6 text-sm font-semibold text-white/70 animate-fade-up">
          <Link to="/" className="hover:text-white">Accueil</Link> › <span className="text-white">Découvrir l’Islam</span>
        </nav>
        <p className="font-arabic text-4xl text-[#9fe3dd] animate-fade-up md:text-5xl" lang="ar">السَّلَام</p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] animate-word md:text-7xl">Découvrir l’Islam, <span className="italic text-[#9fe3dd]">en images</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85 animate-fade-up [animation-delay:250ms] md:text-xl">
          Des mosquées millénaires d’Afrique aux foules de l’Aïd, partez à la rencontre d’une foi vécue par des femmes et des hommes du monde entier. Sans jargon, à votre rythme.
        </p>
        <div className="mt-9 flex flex-col gap-3 animate-fade-up [animation-delay:400ms] sm:flex-row">
          <a href="#voyage" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-[#0B5E66] shadow-xl transition hover:-translate-y-0.5"><Compass className="h-5 w-5" /> Commencer le voyage</a>
          <Link to="/chat" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 font-bold backdrop-blur transition hover:bg-white/10"><MessageCircleHeart className="h-5 w-5" /> Poser une question</Link>
        </div>
      </Container>
      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-2" aria-hidden>
        {HERO_SLIDES.map((k, n) => <span key={k} className={`h-1.5 rounded-full transition-all ${n === i ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} />)}
      </div>
      <p className="absolute bottom-16 right-4 hidden max-w-xs text-right text-[11px] text-white/60 md:block">{current.title} · {current.place}<br />{current.credit}</p>
      <div className="absolute -bottom-px left-0 right-0 h-14 bg-ivory-100 [clip-path:ellipse(70%_100%_at_50%_100%)]" aria-hidden />
    </header>
  );
};

/* ---------------- Page ---------------- */

const Decouvrir = () => {
  useReveal();
  const [open, setOpen] = useState<Photo | null>(null);
  const [faq, setFaq] = useState<number | null>(0);
  const [slide, setSlide] = useState(0);
  const scroller = React.useRef<HTMLDivElement>(null);
  const scrollBy = (d: number) => scroller.current?.scrollBy({ left: d * Math.min(560, window.innerWidth * 0.85), behavior: 'smooth' });

  return (
    <div style={rubriqueVars('decouvrir')}>
      <Hero />

      {/* Côte d'Ivoire : terre de rencontre */}
      <section className="relative z-10 -mt-6 pb-8">
        <Container>
          <div className="reveal grid gap-4 rounded-[2rem] bg-white p-6 shadow-[0_30px_70px_-45px_rgba(11,94,102,0.8)] ring-1 ring-ink-900/[0.06] sm:p-8 md:grid-cols-[1.3fr_1fr_1fr] md:items-center">
            <div>
              <Kicker>Chez nous</Kicker>
              <p className="mt-3 font-serif text-2xl font-semibold leading-snug text-ink-900">La Côte d’Ivoire, une terre de rencontre entre musulmans et chrétiens.</p>
              <p className="mt-2 text-sm text-ink-500">C’est dans cet esprit que la DDR dialogue, écritures en main, dans le respect.</p>
            </div>
            {[['42,5 %', 'de musulmans'], ['39,8 %', 'de chrétiens']].map(([v, l]) => (
              <div key={l} className="r-soft rounded-3xl p-5 text-center">
                <p className="r-ink font-display text-4xl font-bold">{v}</p>
                <p className="text-sm font-semibold text-ink-700">{l}</p>
              </div>
            ))}
            <p className="text-xs text-ink-400 md:col-span-3">Source : recensement général de la population (RGPH 2021).</p>
          </div>
        </Container>
      </section>

      {/* Voyage en images */}
      <section id="voyage" className="scroll-mt-20 py-16 md:py-24">
        <Container>
          <div className="reveal mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Kicker>Un voyage en images</Kicker>
              <H2>Des lieux qui racontent une foi</H2>
              <p className="mt-4 text-lg text-ink-500">De La Mecque à Kong, chaque mosquée a une histoire. Touchez une image pour l’agrandir.</p>
            </div>
            <div className="hidden gap-2 md:flex">
              <button onClick={() => scrollBy(-1)} aria-label="Images précédentes" className="grid h-12 w-12 place-items-center rounded-full bg-white shadow ring-1 ring-ink-900/10 hover:bg-ivory-100"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => scrollBy(1)} aria-label="Images suivantes" className="r-grad grid h-12 w-12 place-items-center rounded-full text-white shadow"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </Container>
        <div
          ref={scroller}
          onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / Math.min(560, window.innerWidth * 0.85)))}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-10 2xl:px-24"
        >
          {VOYAGE.map((k, n) => {
            const p = PHOTOS[k];
            return (
              <button key={k} onClick={() => setOpen(p)} className="group relative w-[85vw] max-w-[540px] shrink-0 snap-start overflow-hidden rounded-[2rem] text-left shadow-[0_30px_60px_-34px_rgba(11,94,102,0.9)]">
                <Photo src={commons(p.file, 1100)} alt={p.title} eager={n < 2} className="aspect-[4/5] w-full object-cover transition duration-[1200ms] group-hover:scale-105 sm:aspect-[5/6]" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#05262a] via-[#05262a]/30 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0B5E66]">{String(n + 1).padStart(2, '0')} / {String(VOYAGE.length).padStart(2, '0')}</span>
                <span className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#9fe3dd]"><MapPin className="h-4 w-4" /> {p.place}</span>
                  <span className="mt-1 block font-serif text-3xl font-semibold">{p.title}</span>
                  <span className="mt-2 line-clamp-3 block text-[15px] text-white/80">{p.story}</span>
                  <span className="mt-3 block text-[10px] text-white/50">{p.credit}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {VOYAGE.map((k, n) => <span key={k} className={`h-1.5 rounded-full transition-all ${n === slide ? 'r-grad w-6' : 'w-1.5 bg-ink-900/20'}`} />)}
        </div>
      </section>

      {/* Repères */}
      <section className="bg-[#ddf4f1]/60 py-16 md:py-24">
        <Container>
          <div className="reveal max-w-2xl">
            <Kicker>L’essentiel</Kicker>
            <H2>L’Islam en quatre repères</H2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REPERES.map((r, i) => (
              <article key={r.title} style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="reveal group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_18px_40px_-30px_rgba(11,94,102,0.7)] ring-1 ring-ink-900/[0.06] transition duration-500 hover:-translate-y-1.5">
                <span className="r-grad absolute inset-x-0 top-0 h-1.5" />
                <span className="text-4xl transition duration-500 group-hover:scale-110 inline-block" aria-hidden>{r.icon}</span>
                <span className="r-ink ml-2 font-display text-sm font-bold opacity-40">0{i + 1}</span>
                <h3 className="mt-3 font-serif text-2xl font-semibold text-ink-900">{r.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{r.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Une journée au rythme de la prière */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="reveal max-w-2xl">
            <Kicker>Une journée de musulman</Kicker>
            <H2>Cinq rendez-vous, du lever au coucher</H2>
            <p className="mt-4 text-lg text-ink-500">La prière rythme la journée comme le ciel change de couleur.</p>
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-5">
            {JOURNEE.map((p, i) => (
              <article key={p.name} style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="reveal relative flex min-h-[10rem] flex-col md:min-h-[15rem] justify-end overflow-hidden rounded-3xl p-5 text-white shadow-[0_24px_50px_-30px_rgba(5,38,42,0.8)]">
                <span className="absolute inset-0" style={{ background: p.sky }} aria-hidden />
                <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#05262a]/70 to-transparent" aria-hidden />
                {i === 4 && <span className="absolute right-5 top-5 text-2xl" aria-hidden>🌙</span>}
                {i === 1 && <span className="absolute right-5 top-5 h-10 w-10 rounded-full bg-[#fff6c8] shadow-[0_0_40px_10px_rgba(255,240,170,.8)]" aria-hidden />}
                <span className="relative">
                  <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white/80">{p.fr}</span>
                  <span className="block font-serif text-3xl font-semibold drop-shadow">{p.name}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-white/90 drop-shadow">{p.text}</span>
                </span>
              </article>
            ))}
          </div>
          <p className="reveal mt-4 text-sm text-ink-500">Les horaires du jour à Abidjan sont affichés sur la <Link to="/" className="r-ink font-bold underline">page d’accueil</Link>.</p>
        </Container>
      </section>

      {/* La communauté */}
      <section className="relative overflow-hidden bg-[#05262a] py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-pattern opacity-[0.07]" aria-hidden />
        <Container className="relative">
          <div className="reveal max-w-2xl">
            <Kicker light>La communauté</Kicker>
            <H2 light>Une seule famille, d’un continent à l’autre</H2>
            <p className="mt-4 text-lg text-white/75">En rangs serrés, épaule contre épaule, le riche à côté du pauvre : dans la prière, chacun est l’égal de l’autre.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-[1.5fr_1fr]">
            {(['istiqlal', 'pelerin'] as const).map((k, n) => {
              const p = PHOTOS[k];
              return (
                <button key={k} onClick={() => setOpen(p)} style={{ '--d': `${n * 120}ms` } as React.CSSProperties} className="reveal group relative overflow-hidden rounded-[2rem] text-left">
                  <Photo src={commons(p.file, 1400)} alt={p.title} className={`w-full object-cover transition duration-[1200ms] group-hover:scale-105 ${n === 0 ? 'aspect-[16/10]' : 'aspect-[4/5] md:h-full md:aspect-auto'}`} />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#05262a]/90 via-transparent to-transparent" />
                  <span className="absolute bottom-0 p-5">
                    <span className="block font-serif text-2xl font-semibold">{p.title}</span>
                    <span className="block text-sm text-white/75">{p.place}</span>
                    <span className="mt-1 block text-[10px] text-white/50">{p.credit}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Link to="/agenda" className="reveal group mt-4 grid items-center gap-5 overflow-hidden rounded-[2rem] bg-white/[0.06] ring-1 ring-white/10 transition hover:bg-white/[0.1] sm:grid-cols-[14rem_1fr]">
            <img src="/images/affiche-rappel-hebdo.jpg" alt="Affiche du rappel hebdomadaire de la DDR" loading="lazy" className="h-48 w-full object-cover object-top sm:h-full" />
            <span className="block p-6">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#9fe3dd]">Et chez nous</span>
              <span className="mt-2 block font-serif text-2xl font-semibold">Chaque jeudi, la DDR vous attend à Yopougon</span>
              <span className="mt-2 block text-white/75">Venez écouter, poser vos questions et échanger, quelle que soit votre religion.</span>
              <span className="mt-4 inline-flex items-center gap-2 font-bold text-[#9fe3dd]">Voir l’agenda <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </span>
          </Link>
        </Container>
      </section>

      {/* Jésus dans l'Islam */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="reveal relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#ddf4f1] via-white to-[#fdf6e3] p-8 ring-1 ring-ink-900/[0.06] md:p-14">
            <span className="absolute -right-6 -top-10 text-[11rem] leading-none opacity-[0.07]" aria-hidden>🕊️</span>
            <Kicker>Ce qui nous rapproche</Kicker>
            <H2>Jésus et Marie, honorés dans le Coran</H2>
            <blockquote className="mt-6 max-w-3xl border-l-4 border-[var(--r-from)] pl-5 font-serif text-xl italic leading-relaxed text-ink-800 md:text-2xl">
              « Ô Marie, voilà qu’Allah t’annonce une parole de Sa part : son nom sera le Messie, Jésus, fils de Marie, illustre ici-bas comme dans l’au-delà… »
            </blockquote>
            <p className="mt-2 pl-6 text-sm font-semibold text-ink-500">Coran, sourate Âl ‘Imrân, 3:45</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/learning#ecritures" className="r-grad inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold text-white shadow-lg"><BookOpen className="h-5 w-5" /> La Bible et le Coran côte à côte</Link>
              <Link to="/debates" className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-white px-6 py-3.5 font-bold text-ink-900"><PlayCircle className="h-5 w-5" /> Voir les débats</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Idées reçues */}
      <section className="bg-[#ddf4f1]/60 py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="reveal">
            <Kicker>Idées reçues</Kicker>
            <H2>Cinq questions qu’on se pose souvent</H2>
            <p className="mt-4 text-lg text-ink-500">Et si vous avez la vôtre, le Compagnon DDR vous répond tout de suite :</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {QUESTIONS.map((q) => (
                <Link key={q} to={`/chat?q=${encodeURIComponent(q)}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 shadow-sm ring-1 ring-ink-900/10 transition hover:-translate-y-0.5 hover:text-[#0B5E66]">{q}</Link>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {IDEES.map((f, i) => (
              <div key={f.q} className="reveal overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/[0.06]">
                <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="flex w-full items-center justify-between gap-4 p-5 text-left text-lg font-bold text-ink-900">
                  {f.q}
                  <ChevronDown className={`r-ink h-5 w-5 shrink-0 transition ${faq === i ? 'rotate-180' : ''}`} />
                </button>
                {faq === i && <p className="px-5 pb-5 leading-relaxed text-ink-700 animate-fade-up">{f.a}</p>}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Votre chemin */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="reveal mx-auto max-w-2xl text-center">
            <Kicker>Votre chemin</Kicker>
            <H2>Avancer à votre rythme</H2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/chat', icon: MessageCircleHeart, title: 'Parler au Compagnon', text: 'Vos questions, à toute heure, en toute discrétion.' },
              { to: '/conversions', icon: Users, title: 'Lire des témoignages', text: 'Ils racontent leur chemin vers l’Islam.' },
              { to: '/learning', icon: GraduationCap, title: 'Centre du savoir', text: 'Piliers, récits du Prophète ﷺ, Bible & Coran.' },
              { to: '/shahada', icon: Heart, title: 'Devenir musulman', text: 'Un frère ou une sœur vous accompagne.' },
            ].map(({ to, icon: Icon, title, text }, i) => (
              <Link key={to} to={to} style={{ '--d': `${i * 80}ms` } as React.CSSProperties} className="reveal group rounded-3xl bg-white p-6 shadow-[0_18px_40px_-30px_rgba(11,94,102,0.7)] ring-1 ring-ink-900/[0.06] transition duration-500 hover:-translate-y-1.5">
                <span className="r-grad grid h-12 w-12 place-items-center rounded-2xl text-white transition group-hover:rotate-[-6deg]"><Icon className="h-6 w-6" /></span>
                <span className="mt-4 block font-serif text-xl font-semibold text-ink-900">{title}</span>
                <span className="mt-1 block text-[15px] text-ink-500">{text}</span>
                <span className="r-ink mt-3 inline-flex items-center gap-1 text-sm font-bold">Y aller <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {open && <Lightbox photo={open} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default Decouvrir;
