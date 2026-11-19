// Lecteur du Coran : sourate ou juz, récitation continue surlignée, réglages de lecture.
import React, { useEffect, useRef, useState } from 'react';
import { BookOpenCheck, ChevronDown, Languages, Minus, Pause, Play, Plus, Repeat, SkipBack, SkipForward, Type, CheckCircle2 } from 'lucide-react';
import { AyahNumber, PickerModal } from './common';
import { BASMALA, RECITERS, hasBasmala, loadJuz, loadSurah, store, surahInfo, type Ayah } from './quranApi';
import { useRecitation } from './useRecitation';

export type Source = { kind: 'surah' | 'juz'; n: number };

const THEMES = {
  clair: { name: 'Clair', page: 'bg-white', text: 'text-ink-900', sub: 'text-ink-500', card: 'bg-white', ring: 'ring-ink-900/[0.06]' },
  sepia: { name: 'Sépia', page: 'bg-[#f6ecd9]', text: 'text-[#4a3b24]', sub: 'text-[#7a6646]', card: 'bg-[#fbf4e6]', ring: 'ring-[#c9b38a]/30' },
  nuit: { name: 'Nuit', page: 'bg-[#0b2233]', text: 'text-[#f3ead8]', sub: 'text-[#9fb8c6]', card: 'bg-[#0f2c40]', ring: 'ring-white/10' },
};
type ThemeKey = keyof typeof THEMES;

const Lecteur = ({ source, setSource, onJuzDone }: { source: Source; setSource: (s: Source) => void; onJuzDone?: (n: number) => void }) => {
  const [prefs, setPrefs] = useState(() =>
    store.get('ddr_coran_prefs', { reciter: 'ar.alafasy', size: 34, phon: true, fr: true, theme: 'clair' as ThemeKey }),
  );
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [picker, setPicker] = useState(false);
  const [settings, setSettings] = useState(false);
  const [repeat, setRepeat] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const rec = useRecitation(ayahs || [], { continuous: true, repeat });
  const t = THEMES[prefs.theme] || THEMES.clair;

  useEffect(() => store.set('ddr_coran_prefs', prefs), [prefs]);

  useEffect(() => {
    let alive = true;
    setAyahs(null);
    setFailed(false);
    (source.kind === 'surah' ? loadSurah(source.n, prefs.reciter) : loadJuz(source.n, prefs.reciter))
      .then((a) => alive && setAyahs(a))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [source.kind, source.n, prefs.reciter, attempt]);

  // Suivre le verset récité à l'écran, et mémoriser la position
  useEffect(() => {
    if (rec.index === null || !ayahs) return;
    refs.current[rec.index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const a = ayahs[rec.index];
    store.set('ddr_coran_last', { ...source, surah: a.surah, ayah: a.n, at: Date.now() });
  }, [rec.index]); // eslint-disable-line react-hooks/exhaustive-deps

  const info = source.kind === 'surah' ? surahInfo(source.n) : null;
  const title = info ? info.name : `Juz ${source.n}`;
  const sub = info ? `${info.fr} · ${info.ayat} versets · ${info.medine ? 'médinoise' : 'mecquoise'}` : ayahs ? `De ${surahInfo(ayahs[0].surah).name} ${ayahs[0].n} à ${surahInfo(ayahs[ayahs.length - 1].surah).name} ${ayahs[ayahs.length - 1].n}` : '';
  const go = (d: number) => {
    const max = source.kind === 'surah' ? 114 : 30;
    const n = source.n + d;
    if (n >= 1 && n <= max) setSource({ ...source, n });
  };

  return (
    <div className={`overflow-hidden rounded-[2rem] ${t.page} shadow-[0_40px_80px_-50px_rgba(15,59,82,0.8)] ring-1 ${t.ring}`}>
      {/* Barre de choix, compacte */}
      <div className="flex flex-wrap items-center gap-2 border-b border-current/10 p-3 sm:p-4" style={{ borderColor: 'rgba(15,59,82,.1)' }}>
        <button onClick={() => setPicker(true)} className="flex w-full min-w-0 items-center gap-3 rounded-2xl bg-[#0F3B52] px-4 py-2.5 text-left text-white sm:w-auto sm:min-w-[18rem]">
          <BookOpenCheck className="h-5 w-5 shrink-0 text-gold-300" />
          <span className="min-w-0">
            <span className="block truncate font-bold">{source.kind === 'surah' ? `${source.n}. ${title}` : title}</span>
            <span className="block text-xs text-white/70">Changer de sourate ou de juz</span>
          </span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
        </button>
        <select value={prefs.reciter} onChange={(e) => setPrefs({ ...prefs, reciter: e.target.value })} aria-label="Récitateur" className="min-w-0 flex-1 rounded-2xl border sm:flex-none border-ink-900/10 bg-white px-3 py-3 text-sm font-semibold text-ink-900">
          {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button onClick={() => setSettings(!settings)} aria-expanded={settings} className="flex items-center gap-1.5 rounded-2xl border border-ink-900/10 bg-white px-3 py-3 text-sm font-semibold text-ink-900">
          <Type className="h-4 w-4" /> Affichage
        </button>
      </div>
      {settings && (
        <div className="flex flex-wrap items-center gap-3 bg-ivory-100 px-4 py-3 text-sm animate-fade-up">
          <span className="flex items-center gap-1 rounded-full bg-white px-1 py-1 ring-1 ring-ink-900/10">
            <button onClick={() => setPrefs({ ...prefs, size: Math.max(24, prefs.size - 4) })} aria-label="Texte plus petit" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-900/5"><Minus className="h-4 w-4" /></button>
            <span className="w-10 text-center font-bold">{prefs.size}</span>
            <button onClick={() => setPrefs({ ...prefs, size: Math.min(56, prefs.size + 4) })} aria-label="Texte plus grand" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-900/5"><Plus className="h-4 w-4" /></button>
          </span>
          {([['phon', 'Phonétique'], ['fr', 'Traduction']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setPrefs({ ...prefs, [k]: !prefs[k] })} aria-pressed={prefs[k]} className={`rounded-full px-4 py-2 font-bold ${prefs[k] ? 'bg-[#0F3B52] text-white' : 'bg-white text-ink-500 ring-1 ring-ink-900/10'}`}>
              <Languages className="mr-1 inline h-4 w-4" />{label}
            </button>
          ))}
          <span className="flex gap-1">
            {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
              <button key={k} onClick={() => setPrefs({ ...prefs, theme: k })} aria-pressed={prefs.theme === k} className={`rounded-full px-3 py-2 font-bold ${prefs.theme === k ? 'ring-2 ring-[#2A8FA8]' : 'ring-1 ring-ink-900/10'} ${THEMES[k].page} ${THEMES[k].text}`}>{THEMES[k].name}</button>
            ))}
          </span>
        </div>
      )}

      {/* En-tête de la sourate */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F3B52] to-[#071a2b] px-6 py-8 text-center text-white">
        <div className="absolute inset-0 bg-pattern opacity-[0.1]" aria-hidden />
        <p className="relative text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-300">{source.kind === 'surah' ? `Sourate ${source.n}` : 'Lecture par juz'}</p>
        <h2 className="relative mt-2 font-serif text-4xl font-semibold">{title}</h2>
        <p className="relative mt-1 text-sm text-white/70">{sub}</p>
        {source.kind === 'surah' && hasBasmala(source.n) && (
          <p className="relative mt-5 font-quran text-3xl text-gold-200" lang="ar" dir="rtl">{BASMALA}</p>
        )}
      </div>

      {/* Versets */}
      <div className="px-3 py-4 sm:px-6">
        {failed && (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-red-800">
            Le texte n’a pas pu être chargé. Vérifiez votre connexion.
            <button onClick={() => setAttempt((x) => x + 1)} className="ml-2 font-bold underline">Réessayer</button>
          </div>
        )}
        {!ayahs && !failed && (
          <div className="space-y-3 py-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-900/5" />)}</div>
        )}
        {ayahs?.map((a, i) => {
          const active = rec.index === i;
          const newSurah = source.kind === 'juz' && a.n === 1;
          return (
            <React.Fragment key={a.global}>
              {newSurah && (
                <div className="my-6 rounded-2xl bg-[#E2F0F4] p-4 text-center">
                  <p className="font-serif text-xl font-semibold text-[#0F3B52]">{surahInfo(a.surah).name} · {surahInfo(a.surah).fr}</p>
                  {hasBasmala(a.surah) && <p className="mt-2 font-quran text-2xl text-[#0F3B52]" dir="rtl" lang="ar">{BASMALA}</p>}
                </div>
              )}
              <article
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={`group mb-3 rounded-2xl p-4 transition duration-500 sm:p-5 ${active ? 'bg-gradient-to-br from-[#E2F0F4] to-[#fdf6e3] ring-2 ring-gold-400 shadow-lg' : `${t.card} ring-1 ${t.ring}`}`}
              >
                <div className="flex items-start gap-3">
                  <button onClick={() => (active && rec.playing ? rec.pause() : rec.play(i))} aria-label={active && rec.playing ? 'Pause' : `Écouter le verset ${a.n}`} className="shrink-0">
                    <AyahNumber n={a.n} active={active} />
                  </button>
                  <p className={`flex-1 text-right font-quran leading-[2.1] ${active ? 'text-[#0F3B52]' : t.text}`} style={{ fontSize: prefs.size }} dir="rtl" lang="ar">{a.arabic}</p>
                </div>
                {prefs.phon && a.phonetic && <p className={`mt-3 text-[15px] italic ${active ? 'text-[#2A8FA8]' : 'text-[#2A8FA8]'}`}>{a.phonetic}</p>}
                {prefs.fr && <p className={`mt-2 text-[16px] leading-relaxed ${active ? 'text-ink-800' : t.sub}`}>{a.french}</p>}
              </article>
            </React.Fragment>
          );
        })}
        {ayahs && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/10 pt-5">
            <button onClick={() => go(-1)} disabled={source.n <= 1} className="rounded-full bg-ink-900/5 px-5 py-3 text-sm font-bold text-ink-700 disabled:opacity-30">← {source.kind === 'surah' ? 'Sourate précédente' : 'Juz précédent'}</button>
            {source.kind === 'juz' && onJuzDone && (
              <button onClick={() => onJuzDone(source.n)} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white"><CheckCircle2 className="h-4 w-4" /> J’ai terminé ce juz</button>
            )}
            <button onClick={() => go(1)} disabled={source.n >= (source.kind === 'surah' ? 114 : 30)} className="rounded-full bg-ink-900/5 px-5 py-3 text-sm font-bold text-ink-700 disabled:opacity-30">{source.kind === 'surah' ? 'Sourate suivante' : 'Juz suivant'} →</button>
          </div>
        )}
      </div>

      {/* Lecteur audio collé en bas */}
      {ayahs && (
        <div className="sticky bottom-0 z-20 flex items-center gap-2 border-t border-white/10 bg-[#071a2b]/95 px-3 py-3 text-white backdrop-blur sm:px-5">
          <button onClick={() => rec.play(Math.max(0, (rec.index ?? 0) - 1))} aria-label="Verset précédent" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"><SkipBack className="h-5 w-5" /></button>
          <button onClick={() => rec.toggle(0)} aria-label={rec.playing ? 'Pause' : 'Écouter'} className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-gold-300 to-gold-500 text-[#071a2b] shadow-lg">
            {rec.playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
          </button>
          <button onClick={() => rec.play(Math.min(ayahs.length - 1, (rec.index ?? -1) + 1))} aria-label="Verset suivant" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"><SkipForward className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-sm font-bold">{rec.index === null ? 'Prêt à écouter' : `Verset ${ayahs[rec.index].n}${source.kind === 'juz' ? ` · ${surahInfo(ayahs[rec.index].surah).name}` : ''}`}</p>
            <p className="truncate text-xs text-white/60">{rec.error || RECITERS.find((r) => r.id === prefs.reciter)?.name}</p>
          </div>
          <button onClick={() => setRepeat(repeat === 1 ? 3 : repeat === 3 ? 5 : 1)} aria-label="Répéter chaque verset" className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold ${repeat > 1 ? 'bg-gold-400 text-[#071a2b]' : 'bg-white/10'}`}>
            <Repeat className="h-4 w-4" /> ×{repeat}
          </button>
          <button onClick={() => rec.setRate(rec.rate === 1 ? 0.75 : rec.rate === 0.75 ? 1.25 : 1)} aria-label="Vitesse" className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">{rec.rate}x</button>
        </div>
      )}

      {picker && (
        <PickerModal
          onClose={() => setPicker(false)}
          onSurah={(n) => {
            setSource({ kind: 'surah', n });
            setPicker(false);
          }}
          onJuz={(n) => {
            setSource({ kind: 'juz', n });
            setPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default Lecteur;
