// Briques partagées de la rubrique Coran.
import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SURAHS } from '../../data/quiz/datasets';
import { JUZ_START } from './quranApi';

/** Médaillon de numéro de verset, à la manière des mushafs. */
export const AyahNumber = ({ n, active = false }: { n: number; active?: boolean }) => (
  <span className={`relative inline-grid h-10 w-10 shrink-0 place-items-center text-[13px] font-bold ${active ? 'text-white' : 'text-[#0F3B52]'}`}>
    <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d="M20 2l5 6.5 8-1.5-1.5 8L38 20l-6.5 5 1.5 8-8-1.5L20 38l-5-6.5-8 1.5 1.5-8L2 20l6.5-5L7 7l8 1.5z" fill={active ? '#C99A2E' : 'none'} stroke="#C99A2E" strokeWidth="1.6" />
    </svg>
    <span className="relative">{n}</span>
  </span>
);

/** Fenêtre de choix d'une sourate (avec recherche) ou d'un juz. */
export const PickerModal = ({
  onClose,
  onSurah,
  onJuz,
  highlight = [],
}: {
  onClose: () => void;
  onSurah: (n: number) => void;
  onJuz?: (n: number) => void;
  highlight?: number[];
}) => {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'surah' | 'juz'>('surah');
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ’'‘-]/g, '').toLowerCase();
  const list = useMemo(() => {
    const k = norm(q.trim());
    if (!k) return SURAHS;
    return SURAHS.filter((s) => norm(s.name).includes(k) || norm(s.fr).includes(k) || String(s.n) === k);
  }, [q]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Choisir une sourate">
      <div className="absolute inset-0 bg-[#071a2b]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-ivory-50 shadow-2xl animate-fade-up sm:rounded-[2rem]">
        <div className="flex items-center gap-3 border-b border-ink-900/[0.07] p-4">
          {onJuz ? (
            <div className="flex rounded-full bg-ivory-200 p-1 text-sm font-bold">
              {(['surah', 'juz'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 transition ${tab === t ? 'bg-[#0F3B52] text-white' : 'text-ink-700'}`}>{t === 'surah' ? 'Sourates' : 'Juz'}</button>
              ))}
            </div>
          ) : (
            <p className="font-serif text-xl font-semibold text-ink-900">Choisir une sourate</p>
          )}
          <button onClick={onClose} className="ml-auto grid h-10 w-10 place-items-center rounded-full hover:bg-ink-900/5" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        {tab === 'surah' ? (
          <>
            <div className="p-4 pb-2">
              <label className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white px-4 py-3 focus-within:border-[#2A8FA8]">
                <Search className="h-5 w-5 text-[#2A8FA8]" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, sens ou numéro (ex. : Yâ-Sîn, Marie, 36)" className="min-w-0 flex-1 bg-transparent outline-none" />
              </label>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 pb-4">
              {list.map((s) => (
                <li key={s.n}>
                  <button onClick={() => onSurah(s.n)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[#E2F0F4]">
                    <AyahNumber n={s.n} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink-900">{s.name} {highlight.includes(s.n) && <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">en cours</span>}</span>
                      <span className="block text-sm text-ink-500">{s.fr} · {s.ayat} versets · {s.medine ? 'médinoise' : 'mecquoise'}</span>
                    </span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="p-6 text-center text-ink-500">Aucune sourate trouvée.</li>}
            </ul>
          </>
        ) : (
          <div className="grid grid-cols-5 gap-2 overflow-y-auto p-4 sm:grid-cols-6">
            {JUZ_START.map(([s, a], i) => (
              <button key={i} onClick={() => onJuz?.(i + 1)} className="rounded-2xl bg-white p-3 text-center ring-1 ring-ink-900/[0.07] transition hover:-translate-y-0.5 hover:ring-[#2A8FA8]">
                <span className="block font-display text-xl font-bold text-[#0F3B52]">{i + 1}</span>
                <span className="block truncate text-[10px] text-ink-500">{SURAHS[s - 1].name} {a}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/** Prononciation par la voix de l'appareil (lettres, mots). Renvoie false si aucune voix arabe. */
export function speakArabic(text: string, rate = 0.8): boolean {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return false;
    const voices = synth.getVoices();
    const voice = voices.find((v) => v.lang?.toLowerCase().startsWith('ar'));
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || 'ar-SA';
    if (voice) u.voice = voice;
    u.rate = rate;
    synth.cancel();
    synth.speak(u);
    return !!voice || voices.length === 0;
  } catch {
    return false;
  }
}
