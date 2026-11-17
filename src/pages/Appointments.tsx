import React, { useState } from 'react';
import { CheckCircle2, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Button, ButtonLink, Container, Honeypot, Notice, PageHero } from '../components/ui';
import { PhoneField, fullPhone, isPhoneValid } from '../components/forms';
import { submitAppointment } from '../services/db';
import { friendlyError } from '../lib/supabase';
import { CONTACT } from '../constants';

const SUBJECTS = ['Question religieuse', 'Je souhaite devenir musulman', 'Don matériel / logistique', 'Proposition de débat', 'Presse / médias', 'Autre'];
const today = () => new Date().toISOString().slice(0, 10);

const Appointments = () => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('+225');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (trap) return setStatus('sent');
    if (name.trim().length < 2) return setError('Merci d’indiquer votre nom.');
    if (!isPhoneValid(phone)) return setError('Merci d’indiquer un numéro de téléphone valide.');
    setStatus('sending');
    try {
      await submitAppointment({ name, phone: fullPhone(country, phone), subject, requestedDate: date || undefined, message });
      setStatus('sent');
    } catch (err) {
      setError(friendlyError(err));
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <Container className="py-24">
        <div className="card mx-auto max-w-xl p-10 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h1 className="mt-6 font-serif text-4xl font-semibold text-cream-50">Demande bien reçue</h1>
          <p className="mt-4 text-lg leading-relaxed text-sand-400">
            Barak Allahou fik{name ? `, ${name.split(' ')[0]}` : ''}. Un membre de la DDR vous rappellera très vite au numéro indiqué.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to="/">Retour à l’accueil</ButtonLink>
            <Button variant="ghost" onClick={() => { setStatus('idle'); setMessage(''); }}>
              Nouvelle demande
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <PageHero eyebrow="Contact & rendez-vous" title={<>Parlons-en, <span className="text-gradient-gold">simplement</span></>} subtitle="Une question sur l’Islam, une proposition de débat, un don matériel ? Laissez-nous vos coordonnées, nous vous rappelons." />
      <Container className="pb-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <aside className="space-y-4">
            <div className="card p-6">
              <h2 className="font-serif text-2xl font-semibold text-cream-50">Besoin d’une réponse rapide ?</h2>
              <p className="mt-2 text-sm text-sand-400">Appelez-nous ou écrivez sur WhatsApp.</p>
              <div className="mt-5 space-y-3">
                {CONTACT.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-brand-500/50">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white"><Phone className="h-5 w-5" /></span>
                    <span className="font-mono text-lg font-bold text-cream-50">{p}</span>
                  </a>
                ))}
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-bold text-emerald-200 transition hover:bg-emerald-500/20">
                  <MessageCircle className="h-5 w-5" /> Écrire sur WhatsApp
                </a>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-cream-50"><MapPin className="h-5 w-5 text-brand-400" /> Siège</h3>
              <p className="mt-2 text-sm leading-relaxed text-sand-400">{CONTACT.address}. Nous recevons sur rendez-vous confirmé.</p>
              <a href="https://www.google.com/maps/search/?api=1&query=Yopougon+Andokoi+Abidjan" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-brand-300 hover:text-brand-200">
                Ouvrir dans Google Maps →
              </a>
            </div>
          </aside>

          <form onSubmit={submit} className="card relative space-y-5 p-6 md:p-8" noValidate>
            <Honeypot value={trap} onChange={setTrap} />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="rdv-name" className="label">Nom complet *</label>
                <input id="rdv-name" required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. : Moussa Koné" className="input" />
              </div>
              <div>
                <label htmlFor="rdv-phone" className="label">Téléphone *</label>
                <PhoneField id="rdv-phone" country={country} number={phone} onCountry={setCountry} onNumber={setPhone} />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="rdv-subject" className="label">Sujet</label>
                <select id="rdv-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="input">
                  {SUBJECTS.map((s) => (
                    <option key={s} className="bg-night-900">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rdv-date" className="label">Date souhaitée (facultatif)</label>
                <input id="rdv-date" type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} className="input [color-scheme:dark]" />
              </div>
            </div>
            <div>
              <label htmlFor="rdv-msg" className="label">Votre message</label>
              <textarea id="rdv-msg" rows={5} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Expliquez-nous brièvement votre demande…" className="input resize-y" />
              <p className="mt-1 text-right text-xs text-sand-500">{message.length}/2000</p>
            </div>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </Button>
            <p className="text-center text-xs text-sand-500">Vos coordonnées servent uniquement à vous recontacter. Elles ne sont jamais partagées.</p>
          </form>
        </div>
      </Container>
    </>
  );
};

export default Appointments;
