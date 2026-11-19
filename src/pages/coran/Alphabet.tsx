// Apprendre à lire l'arabe : les lettres et leurs formes, les voyelles, puis de premiers mots.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Volume2 } from 'lucide-react';
import { LETTERS } from '../../data/quiz/datasets';
import { speakArabic } from './common';

// Ces six lettres ne s'attachent jamais à la lettre qui les suit.
const NON_JOIN = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);
const T = 'ـ'; // tatweel : permet d'afficher les formes attachées

const HARAKAT = [
  { mark: 'بَ', name: 'Fatha', sound: 'a', text: 'Un petit trait au-dessus : le son « a ».' },
  { mark: 'بِ', name: 'Kasra', sound: 'i', text: 'Un petit trait en dessous : le son « i ».' },
  { mark: 'بُ', name: 'Damma', sound: 'ou', text: 'Une petite boucle au-dessus : le son « ou ».' },
  { mark: 'بْ', name: 'Soukoun', sound: '—', text: 'Un petit rond : la lettre se prononce sans voyelle.' },
  { mark: 'بّ', name: 'Chadda', sound: 'bb', text: 'Un petit « w » : la lettre est doublée.' },
  { mark: 'بً', name: 'Tanwin', sound: 'an', text: 'Voyelle doublée : on ajoute un « n » à la fin (an, in, oun).' },
  { mark: 'بَا', name: 'Voyelle longue', sound: 'â', text: 'Fatha suivie d’un alif : un « a » allongé. De même « î » (ي) et « oû » (و).' },
];

const WORDS = [
  { ar: 'اللَّه', tr: 'Allâh', fr: 'Dieu' },
  { ar: 'سَلَام', tr: 'salâm', fr: 'paix' },
  { ar: 'كِتَاب', tr: 'kitâb', fr: 'livre' },
  { ar: 'قَلَم', tr: 'qalam', fr: 'plume' },
  { ar: 'نُور', tr: 'noûr', fr: 'lumière' },
  { ar: 'عِلْم', tr: '‘ilm', fr: 'savoir' },
  { ar: 'صَبْر', tr: 'sabr', fr: 'patience' },
  { ar: 'قَلْب', tr: 'qalb', fr: 'cœur' },
  { ar: 'رَحْمَة', tr: 'rahma', fr: 'miséricorde' },
  { ar: 'جَنَّة', tr: 'janna', fr: 'paradis' },
  { ar: 'رَبّ', tr: 'rabb', fr: 'Seigneur' },
  { ar: 'دِين', tr: 'dîn', fr: 'religion' },
];

const SpeakButton = ({ text, label, className = '' }: { text: string; label: string; className?: string }) => {
  const [noVoice, setNoVoice] = useState(false);
  return (
    <>
      <button onClick={() => setNoVoice(!speakArabic(text))} className={`inline-flex items-center gap-2 rounded-full bg-[#0F3B52] px-4 py-2.5 text-sm font-bold text-white ${className}`}>
        <Volume2 className="h-4 w-4" /> {label}
      </button>
      {noVoice && <p className="mt-2 text-xs text-ink-500">Votre appareil n’a pas de voix arabe installée. Sur Android : Paramètres › Synthèse vocale › ajouter l’arabe.</p>}
    </>
  );
};

const Alphabet = () => {
  const [sel, setSel] = useState(1);
  const [revealed, setRevealed] = useState<string[]>([]);
  const l = LETTERS[sel];
  const joins = !NON_JOIN.has(l.ar);
  useEffect(() => {
    // Certains navigateurs chargent les voix après coup
    window.speechSynthesis?.getVoices();
  }, []);

  return (
    <div className="space-y-10">
      {/* 1. Les lettres */}
      <section>
        <h3 className="font-serif text-2xl font-semibold text-ink-900">1. Les 28 lettres</h3>
        <p className="mt-1 text-ink-500">L’arabe s’écrit de droite à gauche. Touchez une lettre pour voir ses formes et l’entendre.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" dir="rtl">
            {LETTERS.map((x, k) => (
              <button key={x.name} onClick={() => { setSel(k); speakArabic(x.ar); }} aria-pressed={sel === k} className={`flex aspect-square flex-col items-center justify-center rounded-2xl transition duration-300 ${sel === k ? 'scale-105 bg-gradient-to-br from-[#2A8FA8] to-[#0F3B52] text-white shadow-lg' : 'bg-white ring-1 ring-ink-900/[0.07] hover:-translate-y-0.5 hover:shadow'}`}>
                <span className="font-quran text-4xl leading-none">{x.ar}</span>
                <span className={`mt-1 text-[11px] font-bold ${sel === k ? 'text-white/85' : 'text-ink-500'}`} dir="ltr">{x.name}</span>
              </button>
            ))}
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-[#E2F0F4] to-[#fdf6e3] p-6 text-center lg:sticky lg:top-40 lg:self-start">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2A8FA8]">{sel + 1}ᵉ lettre</p>
            <p key={l.ar} className="mt-2 font-quran text-8xl leading-none text-[#0F3B52] animate-fade-up">{l.ar}</p>
            <p className="mt-3 font-serif text-2xl font-semibold text-ink-900">{l.name}</p>
            <div className="mt-5 grid grid-cols-4 gap-2" dir="rtl">
              {[
                ['Seule', l.ar],
                ['Début', joins ? l.ar + T : l.ar],
                ['Milieu', joins ? T + l.ar + T : T + l.ar],
                ['Fin', T + l.ar],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white p-2">
                  <p className="font-quran text-3xl text-[#0F3B52]">{v}</p>
                  <p className="text-[11px] font-bold text-ink-500" dir="ltr">{k}</p>
                </div>
              ))}
            </div>
            {!joins && <p className="mt-3 text-xs text-ink-500">Cette lettre ne s’attache jamais à la lettre suivante.</p>}
            <div className="mt-5"><SpeakButton text={l.ar} label="Écouter la lettre" /></div>
          </div>
        </div>
      </section>

      {/* 2. Les voyelles */}
      <section>
        <h3 className="font-serif text-2xl font-semibold text-ink-900">2. Les voyelles (harakât)</h3>
        <p className="mt-1 text-ink-500">De petits signes au-dessus ou en dessous des lettres indiquent le son. Exemple avec la lettre ب (Bâ) :</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HARAKAT.map((h) => (
            <button key={h.name} onClick={() => speakArabic(h.mark)} className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-left ring-1 ring-ink-900/[0.07] transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#E2F0F4] font-quran text-4xl text-[#0F3B52]">{h.mark}</span>
              <span>
                <span className="block font-bold text-ink-900">{h.name} <span className="font-normal text-[#2A8FA8]">« {h.sound} »</span></span>
                <span className="block text-sm text-ink-500">{h.text}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Lire des mots */}
      <section>
        <h3 className="font-serif text-2xl font-semibold text-ink-900">3. Lire vos premiers mots</h3>
        <p className="mt-1 text-ink-500">Essayez de lire le mot, puis touchez-le pour vérifier et l’entendre.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {WORDS.map((w) => {
            const open = revealed.includes(w.ar);
            return (
              <button key={w.ar} onClick={() => { setRevealed(open ? revealed : [...revealed, w.ar]); speakArabic(w.ar); }} className={`rounded-2xl p-5 text-center transition ${open ? 'bg-gradient-to-br from-[#E2F0F4] to-[#fdf6e3] ring-2 ring-[#2A8FA8]' : 'bg-white ring-1 ring-ink-900/[0.07] hover:-translate-y-0.5'}`}>
                <span className="block font-quran text-4xl text-[#0F3B52]" dir="rtl" lang="ar">{w.ar}</span>
                {open ? (
                  <span className="mt-2 block animate-fade-up"><span className="font-bold text-[#2A8FA8]">{w.tr}</span><span className="block text-sm text-ink-500">{w.fr}</span></span>
                ) : (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-ink-400"><Eye className="h-3.5 w-3.5" /> Vérifier</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-ink-500">
          Entraînez-vous ensuite avec le thème « Lettres arabes » du <Link to="/apprendre/quiz" className="font-bold text-[#0F3B52] underline">Grand Quiz</Link>.
        </p>
      </section>
    </div>
  );
};

export default Alphabet;
