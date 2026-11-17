import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Keyboard, Mic, Pause, Play, Square, Trash2 } from 'lucide-react';
import { Button, ButtonLink, Container, Honeypot, Notice, PageHero } from '../components/ui';
import { PhoneField, fullPhone, isPhoneValid } from '../components/forms';
import { submitTestimony } from '../services/db';
import { friendlyError } from '../lib/supabase';
import { SOCIAL_LINKS } from '../constants';

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

const Conversions = () => {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('+225');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const recorder = useRecorder();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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
      });
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error && /trop long/.test(err.message) ? err.message : friendlyError(err));
      setStatus('idle');
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Cœurs apaisés"
        title={<>Votre chemin vers la foi <span className="text-gradient-gold">peut en guider d’autres</span></>}
        subtitle="Vous avez embrassé l’Islam, ou une parole de la DDR vous a touché ? Partagez votre histoire, par écrit ou en message vocal. Nous la lirons avec soin."
      >
        <ButtonLink href={SOCIAL_LINKS.youtube} variant="ghost">Voir les témoignages en vidéo</ButtonLink>
      </PageHero>

      <Container className="pb-10">
        <div className="mx-auto max-w-2xl">
          {status === 'sent' ? (
            <div className="card p-10 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
              <h2 className="mt-6 font-serif text-3xl font-semibold text-cream-50">Merci, qu’Allah vous récompense</h2>
              <p className="mt-3 text-sand-400">Votre témoignage a bien été transmis à l’équipe de la DDR. Nous pourrons vous recontacter avant toute publication.</p>
              <ButtonLink to="/" className="mt-8">Retour à l’accueil</ButtonLink>
            </div>
          ) : (
            <form onSubmit={submit} className="card relative space-y-6 p-6 md:p-8" noValidate>
              <Honeypot value={trap} onChange={setTrap} />
              <div className="grid grid-cols-2 gap-2 rounded-full bg-black/30 p-1" role="tablist" aria-label="Type de témoignage">
                {(['text', 'audio'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition ${mode === m ? 'bg-brand-600 text-white' : 'text-sand-400 hover:text-white'}`}
                  >
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
                  <label htmlFor="t-phone" className="label">Téléphone *</label>
                  <PhoneField id="t-phone" country={country} number={phone} onCountry={setCountry} onNumber={setPhone} />
                </div>
              </div>

              {mode === 'text' ? (
                <div>
                  <label htmlFor="t-text" className="label">Votre témoignage *</label>
                  <textarea id="t-text" rows={7} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} className="input resize-y" placeholder="Racontez-nous votre chemin…" />
                  <p className="mt-1 text-right text-xs text-sand-500">{text.length}/4000</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-center">
                  {!recorder.blob ? (
                    <>
                      <button
                        type="button"
                        onClick={recorder.recording ? recorder.stop : recorder.start}
                        className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-white transition ${recorder.recording ? 'bg-red-600 animate-pulse-ring' : 'bg-brand-600 hover:bg-brand-500'}`}
                        aria-label={recorder.recording ? 'Arrêter l’enregistrement' : 'Commencer l’enregistrement'}
                      >
                        {recorder.recording ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
                      </button>
                      <p className="mt-4 font-mono text-2xl text-cream-50">{fmt(recorder.seconds)}</p>
                      <p className="text-sm text-sand-400">{recorder.recording ? 'Enregistrement… appuyez pour arrêter' : `Appuyez pour parler (3 minutes maximum)`}</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <audio ref={audioRef} src={recorder.url || undefined} onEnded={() => setPlaying(false)} />
                      <button
                        type="button"
                        onClick={() => {
                          if (!audioRef.current) return;
                          if (playing) audioRef.current.pause();
                          else audioRef.current.play();
                          setPlaying(!playing);
                        }}
                        className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white"
                        aria-label={playing ? 'Pause' : 'Écouter'}
                      >
                        {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
                      </button>
                      <span className="font-mono text-lg text-cream-50">{fmt(recorder.seconds)}</span>
                      <button type="button" onClick={recorder.reset} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" /> Recommencer
                      </button>
                    </div>
                  )}
                  {recorder.error && <p className="mt-4 text-sm text-red-300">{recorder.error}</p>}
                </div>
              )}

              <label className="flex items-start gap-3 text-sm text-sand-400">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-brand-600" />
                J’accepte que la DDR me recontacte au sujet de mon témoignage. Rien ne sera publié sans mon accord.
              </label>

              {error && <Notice tone="error">{error}</Notice>}
              <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Envoi en cours…' : 'Envoyer mon témoignage'}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
};

export default Conversions;
