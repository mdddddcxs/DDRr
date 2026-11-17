import React from 'react';
import { Phone } from 'lucide-react';
import Logo from '../components/Logo';
import { CONTACT } from '../constants';

const Maintenance = () => (
  <div className="relative grid min-h-screen place-items-center overflow-hidden bg-night-950 px-4">
    <div className="absolute inset-0 bg-pattern opacity-[0.05]" aria-hidden />
    <div className="absolute left-1/2 top-1/3 h-80 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-brand-600/20 blur-[110px]" aria-hidden />
    <div className="relative max-w-lg text-center">
      <div className="mx-auto w-fit"><Logo /></div>
      <h1 className="mt-10 font-serif text-4xl font-semibold text-cream-50 md:text-5xl">Le site fait peau neuve</h1>
      <p className="mt-4 text-lg text-sand-400">Nous améliorons le site de la DDR. Revenez dans quelques instants, in shâ Allah.</p>
      <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 font-bold text-cream-100 hover:bg-white/5">
        <Phone className="h-4 w-4 text-brand-400" /> {CONTACT.phones[0]}
      </a>
    </div>
  </div>
);

export default Maintenance;
