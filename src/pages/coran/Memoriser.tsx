// Apprendre une sourate par cœur, guidé par la voix du récitateur.
// Méthode : écouter un verset plusieurs fois, le répéter, masquer peu à peu le texte,
// puis enchaîner les versets appris depuis le début.
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Eye, EyeOff, GraduationCap, Headphones, ListRestart, Pause, Play, Sparkles, Trophy } from 'lucide-react';
import { SURAHS } from '../../data/quiz/datasets';
import { AyahNumber, PickerModal } from './common';
import { BASMALA, RECITERS, STARTER, hasBasmala, loadSurah, store, surahInfo, type Ayah } from './quranApi';
import { useRecitation } from './useRecitation';

type Learned = Record<number, number[]>;
const HIDE = [
  { label: 'Tout voir', hint: 'Lisez en écoutant' },
  { label: 'Arabe seul', hint: 'Sans phonétique ni traduction' },
  { label: 'Premiers mots', hint: 'Seul le début du verset reste' },
  { label: 'De mémoire', hint: 'Récitez sans regarder' },
];

const firstWords = (s: string, n = 2) => s.split(/\s+/).slice(0, n).join(' ') + ' …';

const Memoriser = () => {
  const [surah, setSurah] = useState<number | null>(() => store.get<number | null>('ddr_memo_surah', null));
  const [learned, setLearned] = useState<Learned>(() => store.get('ddr_memo_learned', {}));
  const [picker, setPicker] = useState(false);
  const [reciter, setReciter] = useState(() => store.get('ddr_memo_reciter', 'ar.husary'));
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [i, setI] = useState(0);
  const [repeat, setRepeat] = useState(3);
  const [hide, setHide] = useState(0);
  const [chain, setChain] = useState(false);

  useEffect(() => store.set('ddr_memo_learned', learned), [learned]);
  useEffect(() => store.set('ddr_memo_reciter', reciter), [reciter]);
  useEffect(() => {
    if (surah) store.set('ddr_memo_surah', surah);
  }, [surah]);

  useEffect(() => {
    if (!surah) return;
    let alive = true;
    setAyahs(null);
    setFailed(false);
    loadSurah(surah, reciter)
      .then((a) => {
        if (!alive) return;
        setAyahs(a);
        // On reprend au premier verset pas encore appris
        const done = new Set(learned[surah] || []);
        const first = a.findIndex((x) => !done.has(x.n));
        setI(first < 0 ? 0 : first);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [surah, reciter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mode « enchaîner » : de 1 jusqu'au verset en cours, une fois chacun
  const rec = useRecitation(ayahs || [], chain ? { continuous: true, repeat: 1, range: [0, i] } : { repeat });
  useEffect(() => {
    if (chain && !rec.playing && rec.index === i) setChain(false);
  }, [rec.playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = useMemo(() => new Set(surah ? learned[surah] || [] : []), [learned, surah]);
  const a = ayahs?.[i];
  const info = surah ? surahInfo(surah) : null;
  const pct = ayahs ? Math.round((done.size / ayahs.length) * 100) : 0;

  const listen = () => {
    setChain(false);
    if (rec.playing && rec.index === i) rec.pause();
    else rec.play(i);
  };
  const chainFromStart = () => {
    setChain(true);
    setTimeout(() => rec.play(0), 0);
  };
  const markLearned = () => {
    if (!surah || !a) return;
    const list = Array.from(new Set([...(learned[surah] || []), a.n])).sort((x, y) => x - y);
    setLearned({ ...learned, [surah]: list });
    navigator.vibrate?.(30);
    if (ayahs && i < ayahs.length - 1) {
      setI(i + 1);
      setHide(0);
    }
  };
  const move = (d: number) => {
    if (!ayahs) return;
    rec.pause();
    setI(Math.min(ayahs.length - 1, Math.max(0, i + d)));
    setHide(0);
  };

  /* ---------- Choix de la sourate ---------- */
  if (!surah) {
    const inProgress = Object.keys(learned).map(Number).filter((n) => (learned[n] || []).length > 0);
    return (
      <div>
        <div className="rounded-[2rem] bg-gradient-to-br from-[#0F3B52] to-[#071a2b] p-7 text-white sm:p-10">
          <GraduationCap className="h-10 w-10 text-gold-300" />
          <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">Apprendre une sourate par cœur</h2>
          <p className="mt-3 max-w-xl text-white/75">Choisissez une sourate. Le récitateur vous guide verset par verset : vous écoutez, vous répétez, puis le texte s’efface peu à peu pour réciter de mémoire.</p>
          <button onClick={() => setPicker(true)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-6 py-3.5 font-bold text-[#071a2b] shadow-lg">Choisir parmi les 114 sourates <ChevronDown className="h-4 w-4" /></button>
        </div>
        {inProgress.length > 0 && (
          <>
            <h3 className="mt-8 font-serif text-2xl font-semibold text-ink-900">Mes sourates en cours</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((n) => {
                const s = SURAHS[n - 1];
                const p = Math.round(((learned[n] || []).length / s.ayat) * 100);
                return (
                  <button key={n} onClick={() => setSurah(n)} className="rounded-2xl bg-white p-4 text-left ring-1 ring-ink-900/[0.07] transition hover:-translate-y-0.5 hover:shadow-md">
                    <span className="flex items-center justify-between font-bold text-ink-900">{s.name} <span className="text-sm text-[#2A8FA8]">{p}%</span></span>
                    <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#E2F0F4]"><span className="block h-full rounded-full bg-gradient-to-r from-[#2A8FA8] to-gold-400" style={{ width: `${p}%` }} /></span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        <h3 className="mt-8 font-serif text-2xl font-semibold text-ink-900">Pour commencer : les sourates courtes</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STARTER.map((n) => {
            const s = SURAHS[n - 1];
            return (
              <button key={n} onClick={() => setSurah(n)} className="group rounded-2xl bg-white p-4 text-left ring-1 ring-ink-900/[0.07] transition hover:-translate-y-1 hover:shadow-lg hover:ring-[#2A8FA8]">
                <span className="text-xs font-bold text-[#2A8FA8]">Sourate {n}</span>
                <span className="block font-serif text-lg font-semibold text-ink-900">{s.name}</span>
                <span className="block text-xs text-ink-500">{s.fr} · {s.ayat} versets</span>
              </button>
            );
          })}
        </div>
        {picker && <PickerModal highlight={inProgress} onClose={() => setPicker(false)} onSurah={(n) => { setSurah(n); setPicker(false); }} />}
      </div>
    );
  }

  /* ---------- Séance d'apprentissage ---------- */
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { rec.pause(); setSurah(null); }} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink-700 ring-1 ring-ink-900/10"><ArrowLeft className="h-4 w-4" /> Autre sourate</button>
        <select value={reciter} onChange={(e) => setReciter(e.target.value)} aria-label="Voix" className="w-full min-w-0 rounded-full border border-ink-900/10 bg-white px-4 py-2.5 text-sm font-semibold sm:w-auto">
          {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.hint}</option>)}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-50px_rgba(15,59,82,0.8)] ring-1 ring-ink-900/[0.06]">
        {/* En-tête + progression */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F3B52] to-[#071a2b] px-6 py-6 text-white">
          <div className="absolute inset-0 bg-pattern opacity-[0.1]" aria-hidden />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-300">J’apprends</p>
              <h2 className="font-serif text-3xl font-semibold">{info?.name}</h2>
              <p className="text-sm text-white/70">{info?.fr} · {info?.ayat} versets</p>
            </div>
            <p className="font-display text-3xl font-bold">{pct}%</p>
          </div>
          <div className="relative mt-4 flex gap-1" aria-label={`${done.size} versets appris sur ${ayahs?.length || info?.ayat}`}>
            {(ayahs || []).map((x, k) => (
              <button key={x.n} onClick={() => { rec.pause(); setI(k); setHide(0); }} aria-label={`Verset ${x.n}`} className={`h-2.5 flex-1 rounded-full transition ${k === i ? 'bg-white' : done.has(x.n) ? 'bg-gold-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {failed && <p className="p-8 text-center text-red-700">Impossible de charger la sourate. Vérifiez votre connexion.</p>}
        {!ayahs && !failed && <div className="m-6 h-64 animate-pulse rounded-3xl bg-ink-900/5" />}

        {a && (
          <div className="p-5 sm:p-8">
            {i === 0 && surah && hasBasmala(surah) && <p className="mb-4 text-center font-quran text-2xl text-[#2A8FA8]" dir="rtl" lang="ar">{BASMALA}</p>}
            <div className="flex items-center justify-between">
              <AyahNumber n={a.n} active />
              <span className="text-sm font-semibold text-ink-500">Verset {a.n} sur {ayahs?.length}</span>
              {done.has(a.n) ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"><Check className="h-3.5 w-3.5" /> Appris</span> : <span className="w-16" />}
            </div>

            <div key={`${a.n}-${hide}`} className="mt-6 min-h-[9rem] rounded-3xl bg-gradient-to-br from-[#E2F0F4] to-[#fdf6e3] p-6 text-center animate-fade-up sm:p-8">
              {hide < 3 ? (
                <p className="font-quran text-[2.1rem] leading-[2.2] text-[#0F3B52] sm:text-[2.6rem]" dir="rtl" lang="ar">{hide === 2 ? firstWords(a.arabic) : a.arabic}</p>
              ) : (
                <div className="py-6">
                  <EyeOff className="mx-auto h-10 w-10 text-[#2A8FA8]" />
                  <p className="mt-3 font-serif text-xl text-[#0F3B52]">Récitez le verset de mémoire…</p>
                  <button onClick={() => setHide(0)} className="mt-3 text-sm font-bold text-[#2A8FA8] underline">Vérifier</button>
                </div>
              )}
              {hide === 0 && (
                <>
                  <p className="mt-4 text-[17px] italic text-[#2A8FA8]">{a.phonetic}</p>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-700">{a.french}</p>
                </>
              )}
            </div>

            {/* Commandes */}
            <div className="mt-6 flex flex-col items-center gap-4">
              <button onClick={listen} className="inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#2A8FA8] to-[#0F3B52] px-8 py-4 text-lg font-bold text-white shadow-[0_18px_36px_-16px_rgba(15,59,82,0.9)] transition hover:brightness-110">
                {rec.playing && !chain ? <Pause className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
                {rec.playing && !chain ? 'Pause' : `Écouter ${repeat > 1 ? `${repeat} fois` : ''}`}
              </button>
              {rec.error && <p className="text-sm text-red-700">{rec.error}</p>}

              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="flex items-center gap-1 rounded-full bg-ivory-200 p-1">
                  {[1, 3, 5, 10].map((n) => (
                    <button key={n} onClick={() => setRepeat(n)} aria-pressed={repeat === n} className={`rounded-full px-3 py-1.5 font-bold ${repeat === n ? 'bg-[#0F3B52] text-white' : 'text-ink-700'}`}>×{n}</button>
                  ))}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-ivory-200 p-1">
                  {[0.75, 1].map((r) => (
                    <button key={r} onClick={() => rec.setRate(r)} aria-pressed={rec.rate === r} className={`rounded-full px-3 py-1.5 font-bold ${rec.rate === r ? 'bg-[#0F3B52] text-white' : 'text-ink-700'}`}>{r === 1 ? 'Normal' : 'Lent'}</button>
                  ))}
                </span>
              </div>

              <div className="grid w-full max-w-lg grid-cols-4 gap-1.5 rounded-2xl bg-ivory-200 p-1.5">
                {HIDE.map((h, k) => (
                  <button key={h.label} onClick={() => setHide(k)} aria-pressed={hide === k} title={h.hint} className={`rounded-xl px-1 py-2 text-xs font-bold transition ${hide === k ? 'bg-white text-[#0F3B52] shadow' : 'text-ink-500'}`}>
                    {k === 0 ? <Eye className="mx-auto mb-0.5 h-4 w-4" /> : k === 3 ? <EyeOff className="mx-auto mb-0.5 h-4 w-4" /> : <Sparkles className="mx-auto mb-0.5 h-4 w-4" />}
                    {h.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-500">{HIDE[hide].hint}</p>

              <div className="flex w-full max-w-lg items-center gap-2">
                <button onClick={() => move(-1)} disabled={i === 0} aria-label="Verset précédent" className="grid h-12 w-12 place-items-center rounded-full bg-ivory-200 text-ink-700 disabled:opacity-30"><ArrowLeft className="h-5 w-5" /></button>
                <button onClick={markLearned} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-md">
                  <Check className="h-5 w-5" /> Je connais ce verset
                </button>
                <button onClick={() => move(1)} disabled={!ayahs || i >= ayahs.length - 1} aria-label="Verset suivant" className="grid h-12 w-12 place-items-center rounded-full bg-ivory-200 text-ink-700 disabled:opacity-30"><ArrowRight className="h-5 w-5" /></button>
              </div>

              {i > 0 && (
                <button onClick={chainFromStart} className="inline-flex items-center gap-2 rounded-full border-2 border-[#2A8FA8] px-5 py-2.5 text-sm font-bold text-[#0F3B52]">
                  <ListRestart className="h-4 w-4" /> {chain && rec.playing ? `Enchaînement… verset ${(rec.index ?? 0) + 1}` : `Enchaîner les versets 1 à ${a.n}`}
                </button>
              )}
            </div>

            {ayahs && done.size === ayahs.length && (
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-gold-200 to-gold-400 p-6 text-center text-[#3d2c06] animate-fade-up">
                <Trophy className="mx-auto h-10 w-10" />
                <p className="mt-2 font-serif text-2xl font-semibold">Mâ shâ Allah ! Vous connaissez {info?.name}.</p>
                <p className="mt-1 text-sm">Récitez-la dans votre prière, puis passez à la suivante.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-[#E2F0F4] p-5 text-[15px] leading-relaxed text-[#0F3B52]">
        <p className="font-bold">La méthode, en 4 gestes</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Écoutez le verset 3 à 5 fois en suivant le texte.</li>
          <li>Répétez à voix haute avec le récitateur, en mode « Lent » si besoin.</li>
          <li>Masquez peu à peu le texte, jusqu’à réciter « de mémoire ».</li>
          <li>Enchaînez depuis le début avant de passer au verset suivant.</li>
        </ol>
      </div>
    </div>
  );
};

export default Memoriser;
