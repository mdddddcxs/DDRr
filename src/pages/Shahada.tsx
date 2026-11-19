import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Home, Video } from 'lucide-react';
import { Button, ButtonLink, Container, Honeypot, Notice } from '../components/ui';
import { PhoneField, fullPhone, isPhoneValid } from '../components/forms';
import { submitConversionRequest } from '../services/db';
import { friendlyError } from '../lib/supabase';

const Shahada = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('+225');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [method, setMethod] = useState<'presentiel' | 'video'>('presentiel');
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const go = (s: 1 | 2 | 3) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (trap) return go(3);
    if (name.trim().length < 2) return setError('Merci d’indiquer votre nom.');
    if (!isPhoneValid(phone)) return setError('Merci d’indiquer un numéro valide pour qu’un frère puisse vous appeler.');
    setSending(true);
    try {
      await submitConversionRequest({ name, phone: fullPhone(country, phone), location, method });
      go(3);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-[0.05] [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]" aria-hidden />
      <div className="absolute left-1/2 top-0 h-80 w-[50rem] max-w-full -translate-x-1/2 rounded-full bg-gold-400/15 blur-[100px]" aria-hidden />
      <Container className="relative flex flex-col items-center py-14 md:py-20">
        {step !== 3 && (
          <header className="mb-10 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold-300">Le plus beau des pas</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-cream-50 md:text-6xl">Devenir musulman</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-sand-400">Il n’y a ni cérémonie compliquée ni frais. Un frère ou une sœur de la DDR vous accompagne, avec bienveillance et discrétion.</p>
          </header>
        )}

        {step === 1 && (
          <div className="card w-full max-w-2xl border-gold-400/20 p-8 text-center md:p-12">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-300">L’attestation de foi (shahâda)</p>
            <p className="mt-8 font-arabic text-3xl leading-[2] text-cream-50 md:text-5xl md:leading-[1.9]" lang="ar" dir="rtl">
              أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ
              <br />
              وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ ٱللَّٰهِ
            </p>
            <p className="mt-6 font-serif text-lg italic text-sand-400">Ach-hadou an lâ ilâha illa Llâh, wa ach-hadou anna Mouhammadan rassoûlou Llâh</p>
            <div className="mx-auto my-6 h-px w-20 bg-gold-400/40" />
            <p className="text-xl text-cream-100">« J’atteste qu’il n’y a pas de divinité digne d’adoration en dehors d’Allah, et j’atteste que Muhammad est le Messager d’Allah. »</p>
            <Button variant="gold" size="lg" className="mt-10 w-full" onClick={() => go(2)}>
              Je souhaite être accompagné(e)
            </Button>
            <Link to="/chat" className="mt-5 inline-block text-sm text-sand-400 underline-offset-4 hover:text-gold-200 hover:underline">
              J’ai encore des questions : je préfère en parler d’abord
            </Link>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={submit} className="card relative w-full max-w-xl space-y-5 p-6 md:p-10" noValidate>
            <Honeypot value={trap} onChange={setTrap} />
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => go(1)} className="flex items-center gap-1 text-sm text-sand-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full bg-gold-400" />
              </div>
              <span className="text-sm font-bold text-gold-300">Étape 2/2</span>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-semibold text-cream-50">Bienvenue dans la famille</h2>
              <p className="mt-2 text-sm text-sand-400">Laissez vos coordonnées : un responsable de la DDR vous appellera personnellement.</p>
            </div>
            <div>
              <label htmlFor="s-name" className="label">Prénom et nom *</label>
              <input id="s-name" maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ex. : Marc Kouassi" />
            </div>
            <div>
              <label htmlFor="s-phone" className="label">Téléphone *</label>
              <PhoneField id="s-phone" country={country} number={phone} onCountry={setCountry} onNumber={setPhone} />
            </div>
            <div>
              <label htmlFor="s-loc" className="label">Ville ou quartier</label>
              <input id="s-loc" maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} className="input" placeholder="Ex. : Yopougon, Abidjan" />
            </div>
            <fieldset>
              <legend className="label">Je préfère être reçu(e)</legend>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['presentiel', 'En personne', Home],
                  ['video', 'Par appel / vidéo', Video],
                ] as const).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={method === value}
                    onClick={() => setMethod(value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition ${method === value ? 'border-gold-300 bg-gold-400/10 text-gold-200' : 'border-white/10 text-sand-400 hover:border-white/25'}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </fieldset>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={sending}>
              {sending ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </Button>
            <p className="text-center text-xs text-sand-500">Votre demande reste confidentielle et n’est vue que par l’équipe de la DDR.</p>
          </form>
        )}

        {step === 3 && (
          <div className="w-full max-w-2xl text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-gold-200 to-gold-500 text-night-950 shadow-[0_20px_60px_-15px_rgba(220,180,74,0.8)]">
              <CheckCircle2 className="h-14 w-14" />
            </div>
            <h1 className="mt-8 font-serif text-5xl font-semibold text-cream-50 md:text-6xl">Allahou akbar !</h1>
            <p className="mt-3 font-serif text-xl italic text-gold-300">« Dieu est le plus grand »</p>
            <div className="card mx-auto mt-8 max-w-lg p-8 text-left">
              <p className="text-lg leading-relaxed text-cream-100">
                Votre demande a été reçue avec une grande joie. <strong className="text-white">Un responsable vous appellera très bientôt</strong> pour vous accompagner.
              </p>
              <p className="mt-4 rounded-2xl border border-gold-400/20 bg-gold-400/10 p-4 text-sm text-gold-200">
                En attendant, vous pouvez découvrir les bases avec le Centre du savoir, ou poser vos questions au Compagnon DDR.
              </p>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/learning" variant="gold">Découvrir les bases</ButtonLink>
              <ButtonLink to="/" variant="ghost">Retour à l’accueil</ButtonLink>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Shahada;
