// Rubriques La DDR, Découvrir l'Islam, Agenda et Rejoindre.
// Chaque page a sa couleur et mène toujours vers une action utile.
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, CalendarDays, Camera, Compass, Heart, Info, Megaphone, MessageCircleHeart, Newspaper, Phone,
  PlayCircle, Sparkles, Truck, UserPlus, Users, Wrench, HandHeart, GraduationCap, Baby, Trophy, Lightbulb, RefreshCw,
} from 'lucide-react';
import RubriqueHero from '../components/RubriqueHero';
import NextRappel from '../components/NextRappel';
import { Avatar, Container } from '../components/ui';
import { telHref, useSite, waHref } from '../lib/site';
import { rubriqueVars, type RubriqueKey } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';
import { LETTERS, NAMES, SURAHS } from '../data/quiz/datasets';
import { BANK } from '../data/quiz/bank';
import { QUESTION_COUNT } from '../data/quiz/engine';

/* Briques communes ------------------------------------------------- */

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-16 md:py-24 ${className}`}>
    <Container>{children}</Container>
  </section>
);

const H2 = ({ k, kicker, children }: { k: RubriqueKey; kicker?: string; children: React.ReactNode }) => (
  <div style={rubriqueVars(k)} className="reveal mb-10 max-w-2xl">
    {kicker && (
      <p className="r-ink flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em]">
        <span className="r-grad h-1 w-8 rounded-full" />
        {kicker}
      </p>
    )}
    <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink-900 md:text-[2.7rem]">{children}</h2>
  </div>
);

type Tile = { to?: string; href?: string; icon: React.ComponentType<{ className?: string }>; title: string; text: string };

const Tiles = ({ k, items, cols = 'lg:grid-cols-3' }: { k: RubriqueKey; items: Tile[]; cols?: string }) => (
  <div style={rubriqueVars(k)} className={`grid gap-4 sm:grid-cols-2 ${cols}`}>
    {items.map(({ to, href, icon: Icon, title, text }, i) => {
      const inner = (
        <>
          <span className="r-soft r-ink grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-[var(--r-to)] group-hover:text-white">
            <Icon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="flex items-center justify-between gap-2 font-serif text-xl font-semibold text-ink-900">
              {title}
              <ArrowRight className="r-ink h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
            </span>
            <span className="mt-1 block text-[15px] leading-relaxed text-ink-500">{text}</span>
          </span>
        </>
      );
      const cls = 'reveal card group flex items-start gap-4 p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-30px_var(--r-to)]';
      const style = { '--d': `${(i % 3) * 90}ms` } as React.CSSProperties;
      return href ? (
        <a key={title} href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{inner}</a>
      ) : (
        <Link key={title} to={to || '/'} className={cls} style={style}>{inner}</Link>
      );
    })}
  </div>
);

/* La DDR ----------------------------------------------------------- */

export const LaDDR = () => {
  const site = useSite();
  useReveal([site.speakers.length]);
  React.useEffect(() => {
    if (window.location.pathname.endsWith('/intervenants')) {
      setTimeout(() => document.getElementById('intervenants')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, []);
  return (
    <>
      <RubriqueHero k="ddr" icon={Info} title="La DDR" arabic="الدعوة في الشارع" subtitle="La Da’awah Dans la Rue : une association ivoirienne de prédication et de dialogue interreligieux, née dans les rues d’Abidjan." />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <H2 k="ddr" kicker="Qui sommes-nous">Aller à la rencontre des gens, là où ils sont.</H2>
            <div className="reveal space-y-4 text-lg leading-relaxed text-ink-500">
              <p>La DDR porte la da’wah, l’invitation à l’Islam, directement dans la rue : sur les places de Yopougon, devant tous ceux qui veulent comprendre, musulmans, chrétiens ou curieux.</p>
              <p>Sa méthode : comparer les écritures, la Bible et le Coran en main, échanger et débattre dans le respect. Chaque semaine, le rappel hebdomadaire réunit le public autour de questions-réponses.</p>
              <p>Ses directs et ses débats sont suivis bien au-delà d’Abidjan, sur YouTube, TikTok et Facebook.</p>
            </div>
          </div>
          <div className="reveal relative">
            <div className="arch overflow-hidden shadow-[0_40px_80px_-40px_rgba(20,36,74,0.8)] ring-4 ring-white">
              <img src="/images/affiche-rappel-hebdo.jpg" alt="Affiche du rappel hebdomadaire de la DDR" className="aspect-[4/5] w-full object-cover object-top" loading="lazy" />
            </div>
          </div>
        </div>
      </Section>

      <section id="intervenants" className="scroll-mt-24 bg-[#fff1de]/60 py-16 md:py-24">
        <Container>
          <H2 k="ddr" kicker="Nos intervenants">Les voix de la DDR</H2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.speakers.map((s, i) => (
              <article key={s.id} style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="reveal card overflow-hidden">
                <div className="bg-ink-900">
                  {s.photoUrl ? <img src={s.photoUrl} alt={s.name} loading="lazy" className="aspect-[4/3] w-full object-cover object-top" /> : <div className="grid aspect-[4/3] place-items-center"><Avatar name={s.name} /></div>}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-semibold text-ink-900">{s.name}</h3>
                  <p className="text-sm font-bold text-brand-700">{s.role}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{s.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    {s.youtube && <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-brand-700">YouTube</a>}
                    {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-brand-700">Facebook</a>}
                    {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-brand-700">TikTok</a>}
                  </div>
                  {s.photoUrl && s.photoCredit && <p className="mt-3 text-[10px] text-ink-400">{s.photoCredit}</p>}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <Section>
        <H2 k="ddr" kicker="Aller plus loin">Suivre la vie de la DDR</H2>
        <Tiles
          k="ddr"
          items={[
            { to: '/news', icon: Newspaper, title: 'Actualités', text: 'Les annonces et les nouvelles de l’association.' },
            { to: '/debates', icon: PlayCircle, title: 'Débats & directs', text: 'Revoir les rappels et les débats en vidéo.' },
            { to: '/agenda', icon: CalendarDays, title: 'Agenda', text: 'Le prochain rappel et les rendez-vous à venir.' },
          ]}
        />
      </Section>
    </>
  );
};

/* Découvrir l'Islam ------------------------------------------------ */

const BASES = [
  { title: 'Un seul Dieu', text: 'L’Islam enseigne qu’il n’y a qu’un seul Dieu, Allah en arabe, le Créateur unique, sans associé.' },
  { title: 'Les prophètes', text: 'Abraham, Moïse, Jésus et Muhammad ﷺ, et bien d’autres : tous ont transmis le même message d’adoration du Dieu unique.' },
  { title: 'Le Coran', text: 'La parole de Dieu révélée au prophète Muhammad ﷺ, récitée et lue par les musulmans du monde entier.' },
  { title: 'Cinq piliers', text: 'L’attestation de foi, la prière, l’aumône, le jeûne du Ramadan et le pèlerinage à La Mecque.' },
];

const QUESTIONS = ['Qui est Jésus dans l’Islam ?', 'Que dit le Coran sur Marie ?', 'Pourquoi les musulmans prient-ils cinq fois par jour ?', 'Quelle différence entre Islam et christianisme ?', 'Comment devenir musulman ?', 'Qu’est-ce que la shahada ?'];

export const Decouvrir = () => {
  useReveal();
  return (
    <>
      <RubriqueHero k="decouvrir" icon={Compass} title="Découvrir l’Islam" arabic="السلام" subtitle="Sans jargon et sans pression : les bases de l’Islam, et des réponses franches à vos questions." />

      <Section>
        <H2 k="decouvrir" kicker="L’essentiel">L’Islam en quatre repères</H2>
        <div style={rubriqueVars('decouvrir')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BASES.map((b, i) => (
            <article key={b.title} style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="reveal card relative overflow-hidden p-6">
              <span className="r-grad absolute inset-x-0 top-0 h-1.5" />
              <span className="r-ink font-display text-4xl font-bold opacity-25">0{i + 1}</span>
              <h3 className="mt-2 font-serif text-xl font-semibold text-ink-900">{b.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{b.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <section className="bg-[#ddf4f1]/60 py-16 md:py-24">
        <Container>
          <H2 k="decouvrir" kicker="Vos questions">On nous demande souvent…</H2>
          <div style={rubriqueVars('decouvrir')} className="reveal flex flex-wrap gap-3">
            {QUESTIONS.map((q) => (
              <Link key={q} to={`/chat?q=${encodeURIComponent(q)}`} className="group inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white px-5 py-3 text-[15px] font-semibold text-ink-800 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--r-to)] hover:text-[var(--r-ink)]">
                <MessageCircleHeart className="r-ink h-4 w-4" /> {q}
              </Link>
            ))}
          </div>
          <p className="reveal mt-5 text-sm text-ink-500">Chaque question ouvre le Compagnon DDR, qui vous répond tout de suite.</p>
        </Container>
      </section>

      <Section>
        <H2 k="decouvrir" kicker="Votre chemin">Avancer à votre rythme</H2>
        <Tiles
          k="decouvrir"
          cols="lg:grid-cols-2"
          items={[
            { to: '/chat', icon: MessageCircleHeart, title: 'Parler au Compagnon DDR', text: 'Posez toutes vos questions, à toute heure, en toute discrétion.' },
            { to: '/shahada', icon: Heart, title: 'Devenir musulman', text: 'Un frère ou une sœur vous accompagne pas à pas.' },
            { to: '/learning', icon: GraduationCap, title: 'Centre du savoir', text: 'Les piliers, la sunnah et les histoires des prophètes.' },
            { to: '/debates', icon: PlayCircle, title: 'Voir les débats', text: 'La Bible et le Coran comparés, en vidéo.' },
          ]}
        />
      </Section>
    </>
  );
};

/* Agenda ----------------------------------------------------------- */

export const Agenda = () => {
  const site = useSite();
  useReveal();
  return (
    <>
      <RubriqueHero k="agenda" icon={CalendarDays} title="Agenda" subtitle={`Chaque ${site.preche.day}, ${site.preche.time} : la DDR vous donne rendez-vous. Ajoutez-le à votre agenda en un clic.`} />
      <div className="-mt-6">
        <NextRappel flush />
      </div>
      <Section>
        <H2 k="agenda" kicker="Ne rien manquer">Les autres rendez-vous</H2>
        <Tiles
          k="agenda"
          items={[
            { to: '/news', icon: Megaphone, title: 'Conférences & tournées', text: 'Les événements ponctuels sont annoncés dans les actualités.' },
            { to: '/debates', icon: PlayCircle, title: 'Les directs', text: 'Quand la DDR est en direct, un bandeau rouge apparaît en haut du site.' },
            { href: waHref(site.contact.whatsapp, 'Salam, je souhaite recevoir les dates des prochains rappels de la DDR.'), icon: Phone, title: 'Être prévenu sur WhatsApp', text: 'Demandez à recevoir les dates des prochains rendez-vous.' },
          ]}
        />
      </Section>
    </>
  );
};

/* Rejoindre -------------------------------------------------------- */

const ROLES = [
  { icon: Truck, title: 'Logistique', text: 'Installation du son, des chaises et du matériel lors des rappels.' },
  { icon: Camera, title: 'Image & vidéo', text: 'Filmer, photographier, monter les directs et les extraits.' },
  { icon: Megaphone, title: 'Communication', text: 'Affiches, réseaux sociaux, diffusion des rendez-vous.' },
  { icon: Users, title: 'Accueil', text: 'Recevoir le public et accompagner les nouveaux musulmans.' },
  { icon: Wrench, title: 'Technique', text: 'Site internet, informatique, sonorisation.' },
  { icon: BookOpen, title: 'Enseignement', text: 'Aider aux cours, à l’apprentissage du Coran et de l’arabe.' },
];

export const Rejoindre = () => {
  const site = useSite();
  useReveal();
  const wa = waHref(site.contact.whatsapp, 'Salam, je souhaite rejoindre la DDR comme bénévole. Je peux aider en : ');
  return (
    <>
      <RubriqueHero k="rejoindre" icon={UserPlus} title="Rejoindre la DDR" subtitle="Chaque talent compte. Donnez un peu de votre temps pour servir la da’wah à nos côtés.">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-[#5a2a7b] shadow-xl transition hover:-translate-y-0.5">
          <Sparkles className="h-5 w-5" /> Je deviens bénévole
        </a>
      </RubriqueHero>

      <Section>
        <H2 k="rejoindre" kicker="Comment aider">Trouvez votre place</H2>
        <div style={rubriqueVars('rejoindre')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map(({ icon: Icon, title, text }, i) => (
            <a key={title} href={waHref(site.contact.whatsapp, `Salam, je souhaite aider la DDR (${title}).`)} target="_blank" rel="noopener noreferrer" style={{ '--d': `${(i % 3) * 90}ms` } as React.CSSProperties} className="reveal card group flex items-start gap-4 p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-30px_var(--r-to)]">
              <span className="r-grad grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-md transition group-hover:rotate-[-6deg]">
                <Icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-serif text-xl font-semibold text-ink-900">{title}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-ink-500">{text}</span>
                <span className="r-ink mt-3 inline-flex items-center gap-1.5 text-sm font-bold">Proposer mon aide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </span>
            </a>
          ))}
        </div>
      </Section>

      <section className="pb-8">
        <Container>
          <div style={rubriqueVars('rejoindre')} className="reveal r-soft grid gap-6 rounded-[2rem] p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">Vous préférez en parler de vive voix ?</h2>
              <p className="mt-3 text-ink-500">Appelez-nous ou prenez rendez-vous : nous vous expliquerons comment la DDR fonctionne.</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <a href={telHref(site.contact.phones[0] || '')} className="r-grad inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold text-white shadow-lg"><Phone className="h-5 w-5" /> {site.contact.phones[0]}</a>
              <Link to="/appointments" className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-900/15 bg-white px-6 py-3.5 font-bold text-ink-900"><CalendarDays className="h-5 w-5" /> Prendre rendez-vous</Link>
              <Link to="/donations" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-bold text-ink-700 hover:text-ink-900"><HandHeart className="h-4 w-4" /> Ou soutenir par un don</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};


/* Apprendre -------------------------------------------------------- */

const dayIndex = (mod: number, salt = 0) => {
  const d = new Date();
  return (Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) * 7 + salt) % mod;
};

export const Apprendre = () => {
  useReveal();
  const name = NAMES[dayIndex(NAMES.length)];
  const letter = LETTERS[dayIndex(LETTERS.length, 3)];
  const surah = SURAHS[dayIndex(SURAHS.length, 11)];
  const [fact, setFact] = React.useState(() => Math.floor(Math.random() * BANK.length));
  const f = BANK[fact];
  return (
    <>
      <RubriqueHero k="apprendre" icon={GraduationCap} title="Apprendre l’Islam" arabic="العلم نور" subtitle="« Le savoir est lumière. » Le Coran, les bases de la religion, des jeux pour les enfants et un grand quiz pour progresser chaque jour." />

      {/* Le Grand Quiz, mis en avant */}
      <section style={rubriqueVars('apprendre')} className="relative z-10 -mt-10">
        <Container>
          <Link to="/apprendre/quiz" className="reveal group relative block overflow-hidden rounded-[2rem] bg-ink-900 p-7 text-white shadow-[0_40px_80px_-40px_rgba(20,36,74,0.9)] sm:p-10">
            <div className="absolute inset-0 bg-pattern opacity-[0.08]" aria-hidden />
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold-400/30 blur-[80px] animate-drift" aria-hidden />
            <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.22em] text-gold-300"><Trophy className="h-4 w-4" /> Nouveau · Jeu</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight md:text-5xl">Le Grand Quiz <span className="text-gradient-gold italic">infini</span></h2>
                <p className="mt-4 max-w-lg text-lg text-white/75">Plus de {Math.floor(QUESTION_COUNT / 50) * 50} questions sur le Coran, les prophètes, la prière, les noms d’Allah et l’alphabet arabe. Marathon, défi 60 secondes ou entraînement : la partie ne s’arrête jamais.</p>
                <span className="r-grad mt-7 inline-flex items-center gap-2 rounded-full px-7 py-4 text-lg font-bold text-white shadow-lg transition group-hover:brightness-110">
                  Jouer maintenant <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </span>
              </div>
              <div className="relative hidden md:block" aria-hidden>
                <div className="mx-auto w-72 rotate-3 rounded-3xl bg-white p-5 text-ink-900 shadow-2xl transition duration-700 group-hover:rotate-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gold-600">✍️ Lettres arabes</p>
                  <p className="mt-2 font-serif text-lg font-semibold">Comment s’appelle cette lettre ?</p>
                  <p className="my-3 rounded-xl bg-ivory-100 py-3 text-center font-arabic text-5xl">{letter.ar}</p>
                  <div className="grid gap-1.5 text-sm font-semibold">
                    <span className="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-emerald-900">✓ {letter.name}</span>
                    <span className="rounded-xl border-2 border-ink-900/10 px-3 py-2 opacity-60">{LETTERS[(LETTERS.indexOf(letter) + 5) % 28].name}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Container>
      </section>

      {/* Chaque jour, quelque chose à apprendre */}
      <Section>
        <H2 k="apprendre" kicker="Chaque jour">Votre leçon du jour</H2>
        <div style={rubriqueVars('apprendre')} className="grid gap-4 md:grid-cols-3">
          <article className="reveal card relative overflow-hidden p-6 text-center">
            <span className="r-grad absolute inset-x-0 top-0 h-1.5" />
            <p className="r-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">Nom d’Allah du jour</p>
            <p className="mt-4 font-arabic text-5xl leading-tight text-ink-900" lang="ar">{name.ar}</p>
            <p className="mt-3 font-serif text-xl font-semibold text-ink-900">{name.tr}</p>
            <p className="text-ink-500">{name.fr}</p>
          </article>
          <article style={{ '--d': '100ms' } as React.CSSProperties} className="reveal card relative overflow-hidden p-6 text-center">
            <span className="r-grad absolute inset-x-0 top-0 h-1.5" />
            <p className="r-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">Lettre du jour</p>
            <p className="mt-4 font-arabic text-6xl leading-tight text-ink-900" lang="ar">{letter.ar}</p>
            <p className="mt-3 font-serif text-xl font-semibold text-ink-900">{letter.name}</p>
            <p className="text-ink-500">{LETTERS.indexOf(letter) + 1}ᵉ lettre de l’alphabet</p>
          </article>
          <article style={{ '--d': '200ms' } as React.CSSProperties} className="reveal card relative overflow-hidden p-6 text-center">
            <span className="r-grad absolute inset-x-0 top-0 h-1.5" />
            <p className="r-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">Sourate du jour</p>
            <p className="mt-4 font-display text-5xl font-bold text-ink-900">{surah.n}</p>
            <p className="mt-3 font-serif text-xl font-semibold text-ink-900">{surah.name}</p>
            <p className="text-ink-500">« {surah.fr} » · {surah.ayat} versets · {surah.medine ? 'médinoise' : 'mecquoise'}</p>
            <Link to="/khatma" className="r-ink mt-3 inline-flex items-center gap-1 text-sm font-bold">Lire le Coran <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </div>

        <div style={rubriqueVars('apprendre')} className="reveal r-soft mt-6 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
          <span className="r-grad grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white"><Lightbulb className="h-6 w-6" /></span>
          <div className="flex-1">
            <p className="r-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">Le saviez-vous ?</p>
            <p key={fact} className="mt-1 font-semibold text-ink-900 animate-fade-up">{f[2]} <span className="r-ink">{f[3]}.</span></p>
            <p className="text-[15px] text-ink-700">{f[5]}</p>
          </div>
          <button onClick={() => setFact(Math.floor(Math.random() * BANK.length))} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-900 shadow-sm">
            <RefreshCw className="h-4 w-4" /> Un autre
          </button>
        </div>
      </Section>

      <section className="bg-[#fbf0d2]/50 py-16 md:py-24">
        <Container>
          <H2 k="apprendre" kicker="Pour tous les âges">Tous les espaces pour apprendre</H2>
          <Tiles
            k="apprendre"
            cols="lg:grid-cols-2"
            items={[
              { to: '/khatma', icon: BookOpen, title: 'Le Coran', text: 'Lire et écouter le Coran, juz par juz, avec la traduction.' },
              { to: '/learning', icon: GraduationCap, title: 'Centre du savoir', text: 'Les piliers, la sunnah et les histoires des prophètes.' },
              { to: '/enfants', icon: Baby, title: 'Espace enfants', text: 'Des jeux et des quiz adaptés aux plus petits.' },
              { to: '/tools', icon: Wrench, title: 'Outils du croyant', text: 'Calculer sa zakat, partager des cartes de rappel.' },
            ]}
          />
        </Container>
      </section>
    </>
  );
};
