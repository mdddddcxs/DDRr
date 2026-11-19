import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, Keyboard, Mic, Pause, Play, Quote, Square, Trash2 } from 'lucide-react';
import { Container, Honeypot, Notice } from '../components/ui';
import { PhoneField, fullPhone, isPhoneValid } from '../components/forms';
import { getPublicAudioUrl, listPublicTestimonies, submitTestimony } from '../services/db';
import { friendlyError } from '../lib/supabase';
import { useSite } from '../lib/site';
import { rubriqueVars } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';
import type { PublicTestimony } from '../types';

const MAX_SECONDS = 180;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Enregistreur audio simple (MediaRecorder), limité à 3 minutes. */
function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);
  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, recording]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const start = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg'].find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t));
      const r = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 48000 } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => {
        const b = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' });
        setBlob(b);
        setUrl(URL.createObjectURL(b));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.current = r;
      setSeconds(0);
      r.start();
      setRecording(true);
    } catch {
      setError("Impossible d'accéder au micro. Autorisez le micro dans votre navigateur, ou écrivez votre témoignage.");
    }
  };
  const stop = () => {
    rec.current?.state === 'recording' && rec.current.stop();
    setRecording(false);
  };
  const reset = () => {
    setBlob(null);
    setUrl(null);
    setSeconds(0);
  };
  return { recording, seconds, blob, url, error, start, stop, reset };
}

/* ---------------- Ambiance ---------------- */

/** Petites lueurs qui montent lentement, comme des lanternes. */
const Lueurs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    {Array.from({ length: 22 }).map((_, i) => (
      <span
        key={i}
        className="absolute bottom-[-10%] rounded-full bg-[#ffd9e6]"
        style={{
          left: `${(i * 47) % 100}%`,
          width: 3 + (i % 4) * 2,
          height: 3 + (i % 4) * 2,
          opacity: 0.25 + (i % 5) * 0.1,
          filter: 'blur(1px)',
          animation: `lueur ${14 + (i % 7) * 3}s linear ${-(i * 1.7)}s infinite`,
        }}
      />
    ))}
  </div>
);

const HeroTemoignages = () => (
  <header className="relative -mt-[84px] overflow-hidden pt-[84px] text-white">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#E39AB4_0%,#A9567A_30%,#4a1f36_62%,#1d0d18_100%)]" aria-hidden />
    <div className="absolute inset-0 bg-pattern opacity-[0.08]" aria-hidden />
    <Lueurs />
    <Container className="relative pb-28 pt-12 text-center md:pb-36 md:pt-20">
      <nav aria-label="Fil d’Ariane" className="mb-8 text-sm font-semibold text-white/70 animate-fade-up">
        <Link to="/" className="hover:text-white">Accueil</Link> › <span className="text-white">Témoignages</span>
      </nav>
      <p className="font-arabic text-3xl text-[#ffd9e6] animate-fade-up md:text-4xl" lang="ar" dir="rtl">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</p>
      <h1 className="mx-auto mt-6 max-w-3xl font-serif text-5xl font-semibold leading-[1.02] animate-word md:text-7xl">
        Ils ont trouvé <span className="italic text-[#ffd9e6]">la paix</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 animate-fade-up [animation-delay:250ms]">
        Des femmes et des hommes racontent leur chemin vers l’Islam, ou la parole qui les a touchés. Écoutez-les, puis partagez à votre tour.
      </p>
      <p className="mt-3 text-sm text-white/55 animate-fade-up [animation-delay:350ms]">« N’est-ce point par le rappel d’Allah que les cœurs s’apaisent ? » Coran 13:28</p>
      <div className="mt-9 flex flex-col justify-center gap-3 animate-fade-up [animation-delay:450ms] sm:flex-row">
        <a href="#ecouter" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-[#843E5E] shadow-xl transition hover:-translate-y-0.5"><Heart className="h-5 w-5" /> Lire et écouter</a>
        <a href="#partager" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 font-bold text-white backdrop-blur transition hover:bg-white/10"><Mic className="h-5 w-5" /> Partager mon histoire</a>
      </div>
    </Container>
    <div className="absolute -bottom-px left-0 right-0 h-16 bg-ivory-100 [clip-path:ellipse(70%_100%_at_50%_100%)]" aria-hidden />
  </header>
);

/* ---------------- Mur des témoignages ---------------- */

const AudioCard = ({ t }: { t: PublicTestimony }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);
  const toggle = async () => {
    if (!url) {
      const u = await getPublicAudioUrl(t.content);
      if (!u) return setFailed(true);
      setUrl(u);
      setTimeout(() => ref.current?.play().then(() => setPlaying(true)).catch(() => setFailed(true)), 50);
      return;
    }
    if (playing) ref.current?.pause();
    else ref.current?.play();
    setPlaying(!playing);
  };
  return (
    <article className="reveal mb-5 break-inside-avoid overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a1f36] to-[#843E5E] p-6 text-white shadow-[0_24px_50px_-30px_rgba(132,62,94,0.9)]">
      <div className="flex items-center gap-4">
        <button onClick={toggle} aria-label={playing ? 'Pause' : `Écouter le témoignage de ${t.displayName}`} className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-[#843E5E] shadow-lg transition hover:scale-105">
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
        </button>
        <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} className="w-1 rounded-full bg-[#ffd9e6]" style={{ height: `${25 + ((i * 37) % 70)}%`, opacity: playing ? 1 : 0.5, animation: playing ? `onde 0.9s ease-in-out ${i * 0.05}s infinite alternate` : undefined }} />
          ))}
        </div>
      </div>
      {url && <audio ref={ref} src={url} onEnded={() => setPlaying(false)} />}
      <p className="mt-4 font-serif text-xl font-semibold">{t.displayName}</p>
      <p className="text-sm text-white/70">{t.city ? `${t.city} · ` : ''}Message vocal{t.audioDuration ? ` · ${t.audioDuration}` : ''}</p>
      {failed && <p className="mt-2 text-xs text-[#ffd9e6]">L’audio n’a pas pu être chargé. Réessayez plus tard.</p>}
    </article>
  );
};

const TextCard = ({ t }: { t: PublicTestimony }) => {
  const [open, setOpen] = useState(false);
  const long = t.content.length > 320;
  return (
    <article className="reveal mb-5 break-inside-avoid rounded-3xl bg-white p-6 shadow-[0_24px_50px_-34px_rgba(132,62,94,0.6)] ring-1 ring-[#E39AB4]/30">
      <Quote className="h-8 w-8 text-[#E39AB4]" />
      <p className="mt-3 whitespace-pre-line font-serif text-[18px] leading-relaxed text-ink-800">{long && !open ? `${t.content.slice(0, 320)}…` : t.content}</p>
      {long && <button onClick={() => setOpen(!open)} className="mt-2 text-sm font-bold text-[#843E5E]">{open ? 'Réduire' : 'Lire la suite'}</button>}
      <p className="mt-4 flex items-center gap-2 text-sm font-bold text-ink-900">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FBEAF1] text-[#843E5E]">{t.displayName.charAt(0).toUpperCase()}</span>
        {t.displayName}
        {t.city && <span className="font-normal text-ink-500">· {t.city}</span>}
      </p>
    </article>
  );
};

const Mur = () => {
  const site = useSite();
  const [items, setItems] = useState<PublicTestimony[] | null>(null);
  useEffect(() => {
    listPublicTestimonies().then(setItems);
  }, []);
  useReveal([items?.length]);
  return (
    <section id="ecouter" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <div className="reveal mb-10 max-w-2xl">
          <p className="flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#843E5E]"><span className="h-1 w-8 rounded-full bg-gradient-to-r from-[#E39AB4] to-[#A9567A]" /> Leurs mots</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink-900 md:text-[2.7rem]">Des cœurs qui se sont ouverts</h2>
        </div>
        {items === null ? (
          <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-3xl bg-[#FBEAF1]" />)}</div>
        ) : items.length === 0 ? (
          <div className="reveal rounded-[2rem] bg-gradient-to-br from-[#FBEAF1] to-white p-10 text-center ring-1 ring-[#E39AB4]/30">
            <Heart className="mx-auto h-12 w-12 text-[#A9567A]" />
            <h3 className="mt-4 font-serif text-2xl font-semibold text-ink-900">Les premiers témoignages arrivent</h3>
            <p className="mx-auto mt-2 max-w-md text-ink-500">Chaque témoignage est lu par l’équipe de la DDR avant d’être publié, avec l’accord de son auteur. Retrouvez déjà de nombreux témoignages en vidéo sur la chaîne YouTube.</p>
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#843E5E] px-6 py-3 font-bold text-white">Voir sur YouTube <ArrowRight className="h-4 w-4" /></a>
          </div>
        ) : (
          <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
            {items.map((t) => (t.type === 'audio' ? <AudioCard key={t.id} t={t} /> : <TextCard key={t.id} t={t} />))}
          </div>
        )}
      </Container>
    </section>
  );
};

/* ---------------- Formulaire ---------------- */

const Conversions = () => {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('+225');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [publish, setPublish] = useState(true);
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const recorder = useRecorder();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useReveal();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (trap) return setStatus('sent');
    if (name.trim().length < 2) return setError('Merci d’indiquer votre prénom ou votre nom.');
    if (!isPhoneValid(phone)) return setError('Votre numéro nous permet de vous recontacter. Merci de le renseigner.');
    if (mode === 'text' && text.trim().length < 10) return setError('Votre témoignage est un peu court. Racontez-nous en quelques phrases.');
    if (mode === 'audio' && !recorder.blob) return setError('Enregistrez d’abord votre message vocal.');
    if (!consent) return setError('Merci de cocher la case d’accord avant d’envoyer.');
    setStatus('sending');
    try {
      await submitTestimony({
        name,
        phone: fullPhone(country, phone),
        type: mode,
        text,
        audio: recorder.blob || undefined,
        audioDuration: mode === 'audio' ? fmt(recorder.seconds) : undefined,
        consentPublish: publish,
        city,
      });
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error && /trop long/.test(err.message) ? err.message : friendlyError(err));
      setStatus('idle');
    }
  };

  return (
    <div style={rubriqueVars('temoignages')}>
      <HeroTemoignages />
      <Mur />

      <section id="partager" className="scroll-mt-24 relative overflow-hidden bg-gradient-to-b from-[#FBEAF1] to-ivory-100 py-16 md:py-24">
        <Container className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="reveal lg:sticky lg:top-28">
            <p className="flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#843E5E]"><span className="h-1 w-8 rounded-full bg-gradient-to-r from-[#E39AB4] to-[#A9567A]" /> À votre tour</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink-900 md:text-[2.7rem]">Votre chemin peut en guider d’autres</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">Racontez par écrit, ou enregistrez un message vocal de 3 minutes maximum. L’équipe de la DDR le lit et l’écoute avec soin.</p>
            <ul className="mt-6 space-y-3 text-[15px] text-ink-700">
              {['Votre numéro n’est jamais publié.', 'Seul votre prénom apparaît, si vous acceptez la publication.', 'Vous pouvez demander le retrait à tout moment.'].map((x) => (
                <li key={x} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#A9567A]" /> {x}</li>
              ))}
            </ul>
            <Link to="/shahada" className="mt-8 inline-flex items-center gap-2 font-bold text-[#843E5E]">Vous souhaitez devenir musulman ? <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="reveal">
            {status === 'sent' ? (
              <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_30px_60px_-36px_rgba(132,62,94,0.7)]">
                <CheckCircle2 className="mx-auto h-16 w-16 text-[#A9567A]" />
                <h2 className="mt-6 font-serif text-3xl font-semibold text-ink-900">Merci, qu’Allah vous récompense</h2>
                <p className="mt-3 text-ink-500">Votre témoignage a bien été transmis à l’équipe de la DDR.{publish ? ' Il pourra être publié après relecture.' : ''}</p>
                <Link to="/" className="mt-8 inline-flex rounded-full bg-[#843E5E] px-6 py-3 font-bold text-white">Retour à l’accueil</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="relative space-y-6 rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-36px_rgba(132,62,94,0.7)] md:p-8" noValidate>
                <Honeypot value={trap} onChange={setTrap} />
                <div className="grid grid-cols-2 gap-2 rounded-full bg-[#FBEAF1] p-1" role="tablist" aria-label="Type de témoignage">
                  {(['text', 'audio'] as const).map((m) => (
                    <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition ${mode === m ? 'bg-gradient-to-b from-[#E39AB4] to-[#A9567A] text-white shadow-md' : 'text-[#843E5E]'}`}>
                      {m === 'text' ? <Keyboard className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {m === 'text' ? 'Écrire' : 'Message vocal'}
                    </button>
                  ))}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="t-name" className="label">Prénom ou nom *</label>
                    <input id="t-name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ex. : Aïcha" />
                  </div>
                  <div>
                    <label htmlFor="t-city" className="label">Ville (facultatif)</label>
                    <input id="t-city" maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Ex. : Yopougon" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="t-phone" className="label">Téléphone * <span className="font-normal text-ink-400">(jamais publié)</span></label>
                    <PhoneField id="t-phone" country={country} number={phone} onCountry={setCountry} onNumber={setPhone} />
                  </div>
                </div>

                {mode === 'text' ? (
                  <div>
                    <label htmlFor="t-text" className="label">Votre témoignage *</label>
                    <textarea id="t-text" rows={7} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} className="input resize-y" placeholder="Racontez-nous votre chemin…" />
                    <p className="mt-1 text-right text-xs text-ink-400">{text.length}/4000</p>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-gradient-to-br from-[#4a1f36] to-[#843E5E] p-7 text-center text-white">
                    {!recorder.blob ? (
                      <>
                        <button type="button" onClick={recorder.recording ? recorder.stop : recorder.start} className={`mx-auto grid h-24 w-24 place-items-center rounded-full transition ${recorder.recording ? 'bg-red-500 animate-pulse-ring' : 'bg-white text-[#843E5E] hover:scale-105'}`} aria-label={recorder.recording ? 'Arrêter l’enregistrement' : 'Commencer l’enregistrement'}>
                          {recorder.recording ? <Square className="h-8 w-8" /> : <Mic className="h-10 w-10" />}
                        </button>
                        <p className="mt-4 font-display text-3xl font-bold tabular-nums">{fmt(recorder.seconds)}</p>
                        <p className="text-sm text-white/75">{recorder.recording ? 'Enregistrement… touchez pour arrêter' : 'Touchez le micro pour parler (3 minutes maximum)'}</p>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-4">
                        <audio ref={audioRef} src={recorder.url || undefined} onEnded={() => setPlaying(false)} />
                        <button type="button" onClick={() => { if (!audioRef.current) return; if (playing) audioRef.current.pause(); else audioRef.current.play(); setPlaying(!playing); }} className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#843E5E]" aria-label={playing ? 'Pause' : 'Réécouter'}>
                          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
                        </button>
                        <span className="font-display text-xl font-bold">{fmt(recorder.seconds)}</span>
                        <button type="button" onClick={recorder.reset} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-[#ffd9e6] hover:bg-white/10"><Trash2 className="h-4 w-4" /> Recommencer</button>
                      </div>
                    )}
                    {recorder.error && <p className="mt-4 text-sm text-[#ffd9e6]">{recorder.error}</p>}
                  </div>
                )}

                <div className="space-y-3 rounded-2xl bg-[#FBEAF1]/60 p-4">
                  <label className="flex items-start gap-3 text-sm text-ink-700">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#A9567A]" />
                    J’accepte que la DDR me recontacte au sujet de mon témoignage. *
                  </label>
                  <label className="flex items-start gap-3 text-sm text-ink-700">
                    <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#A9567A]" />
                    J’accepte que mon témoignage soit publié sur le site, avec mon prénom seulement, après relecture par la DDR.
                  </label>
                </div>

                {error && <Notice tone="error">{error}</Notice>}
                <button type="submit" disabled={status === 'sending'} className="w-full rounded-full bg-gradient-to-b from-[#E39AB4] to-[#A9567A] py-4 text-lg font-bold text-white shadow-[0_16px_30px_-14px_rgba(132,62,94,0.9)] transition hover:brightness-105 disabled:opacity-60">
                  {status === 'sending' ? 'Envoi en cours…' : 'Envoyer mon témoignage'}
                </button>
              </form>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Conversions;
