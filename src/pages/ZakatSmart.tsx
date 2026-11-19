// Zakat Smart — identité vert sauge. Calcul de la zakat sur les biens (zakat al-mâl).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote, BellRing, Calculator, ChevronDown, Coins, Gem, HandCoins, HandHeart, Package, RotateCcw, Save, Smartphone, Trash2, Wallet,
} from 'lucide-react';
import RubriqueHero from '../components/RubriqueHero';
import { Container, formatFCFA } from '../components/ui';
import { rubriqueVars } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';

// Cours indicatifs (novembre 2026), modifiables par l'utilisateur.
const DEFAULT_GOLD = 74000; // F CFA / g, or 24 carats
const DEFAULT_SILVER = 1050; // F CFA / g
const NISAB_GOLD_G = 85;
const NISAB_SILVER_G = 595;

type Field = { key: keyof Assets; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; unit?: 'g'; minus?: boolean };
type Assets = { cash: number; mobile: number; gold: number; silver: number; goods: number; receivables: number; debts: number };
const EMPTY: Assets = { cash: 0, mobile: 0, gold: 0, silver: 0, goods: 0, receivables: 0, debts: 0 };

const FIELDS: Field[] = [
  { key: 'cash', label: 'Espèces et comptes bancaires', hint: 'Argent liquide, comptes courants et épargne', icon: Banknote },
  { key: 'mobile', label: 'Mobile Money', hint: 'Orange Money, MTN, Moov, Wave…', icon: Smartphone },
  { key: 'gold', label: 'Or', hint: 'Bijoux et lingots, en grammes', icon: Gem, unit: 'g' },
  { key: 'silver', label: 'Argent (métal)', hint: 'En grammes', icon: Coins, unit: 'g' },
  { key: 'goods', label: 'Marchandises à vendre', hint: 'Stock de votre commerce, à sa valeur de vente', icon: Package },
  { key: 'receivables', label: 'Créances', hint: 'Argent prêté que vous êtes sûr de récupérer', icon: HandCoins },
  { key: 'debts', label: 'Dettes à payer', hint: 'Dettes dues maintenant (à déduire)', icon: Wallet, minus: true },
];

const fmtInput = (n: number) => (n ? n.toLocaleString('fr-FR') : '');
const parseInput = (s: string) => Math.max(0, Number(s.replace(/[^\d]/g, '')) || 0);

/** Nombre qui défile doucement vers sa valeur. */
const useCountUp = (value: number) => {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 600);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(a + (value - a) * e));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return v;
};

function reminderIcs(amount: number) {
  const d = new Date();
  // Une année lunaire ≈ 354 jours
  const start = new Date(d.getTime() + 354 * 864e5);
  const stamp = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La DDR//Zakat Smart//FR', 'BEGIN:VEVENT',
    `UID:zakat-${Date.now()}@la-ddr`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${stamp(start)}`, `DTEND;VALUE=DATE:${stamp(new Date(start.getTime() + 864e5))}`,
    'SUMMARY:Calculer ma zakat (Zakat Smart, La DDR)',
    `DESCRIPTION:Une année lunaire s’est écoulée. L’an dernier : ${amount.toLocaleString('fr-FR')} F CFA. https://la-ddr.vercel.app/outils/zakat`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Zakat', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rappel-zakat.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

type Saved = { id: number; date: string; base: number; zakat: number };
const HIST_KEY = 'ddr_zakat_history_v2';

const FAQ = [
  { q: 'Qui doit payer la zakat ?', a: 'Tout musulman dont les biens atteignent le seuil (nisâb) et restent au-dessus pendant une année lunaire complète (le hawl).' },
  { q: 'Qu’est-ce que le nisâb ?', a: 'C’est le seuil minimum : la valeur de 85 g d’or ou de 595 g d’argent. Beaucoup de savants recommandent le seuil de l’argent, plus bas, car il profite davantage aux pauvres. Les deux options sont proposées ici.' },
  { q: 'À qui donner sa zakat ?', a: 'Le Coran cite huit catégories de bénéficiaires (sourate At-Tawba, 9:60) : les pauvres, les nécessiteux, ceux qui la collectent, ceux dont on veut rapprocher les cœurs, l’affranchissement des captifs, les endettés, la cause d’Allah et le voyageur en difficulté.' },
  { q: 'Et la maison, la voiture, les habits ?', a: 'Les biens d’usage personnel (logement, véhicule, vêtements, meubles) ne sont pas soumis à la zakat. Seuls l’épargne, l’or, l’argent, les marchandises et les créances sûres sont comptés.' },
  { q: 'Est-ce la même chose que la zakat al-fitr ?', a: 'Non. La zakat al-fitr est une petite aumône due par chaque personne à la fin du Ramadan. Ce calculateur concerne la zakat annuelle sur les biens.' },
];

const ZakatSmart = () => {
  useReveal();
  const [assets, setAssets] = useState<Assets>(EMPTY);
  const [basis, setBasis] = useState<'gold' | 'silver'>('silver');
  const [goldPrice, setGoldPrice] = useState(DEFAULT_GOLD);
  const [silverPrice, setSilverPrice] = useState(DEFAULT_SILVER);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [history, setHistory] = useState<Saved[]>(() => {
    try {
      const h = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
      return Array.isArray(h) ? h : [];
    } catch {
      return [];
    }
  });
  const [saved, setSaved] = useState(false);

  const value = (k: keyof Assets) => (k === 'gold' ? assets.gold * goldPrice : k === 'silver' ? assets.silver * silverPrice : assets[k]);
  const gross = FIELDS.filter((f) => !f.minus).reduce((s, f) => s + value(f.key), 0);
  const base = Math.max(0, gross - assets.debts);
  const nisab = basis === 'gold' ? NISAB_GOLD_G * goldPrice : NISAB_SILVER_G * silverPrice;
  const due = base >= nisab && nisab > 0;
  const zakat = due ? Math.round(base * 0.025) : 0;
  const shown = useCountUp(zakat);
  const pct = nisab > 0 ? Math.min(100, (base / nisab) * 100) : 0;
  const breakdown = useMemo(() => FIELDS.filter((f) => value(f.key) > 0), [assets, goldPrice, silverPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    const h = [{ id: Date.now(), date: new Date().toISOString(), base, zakat }, ...history].slice(0, 6);
    setHistory(h);
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(h));
    } catch {
      /* stockage indisponible */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const removeSaved = (id: number) => {
    const h = history.filter((x) => x.id !== id);
    setHistory(h);
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(h));
    } catch {
      /* rien */
    }
  };

  return (
    <div style={rubriqueVars('zakat')}>
      <RubriqueHero k="zakat" icon={Calculator} title="Zakat Smart" arabic="الزكاة" subtitle="Calculez votre zakat en quelques gestes, en francs CFA, avec des explications claires. Vos chiffres restent sur votre téléphone." />

      <section className="relative z-10 -mt-10 pb-16">
        <Container className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Saisie */}
          <div className="reveal rounded-[2rem] bg-white p-5 shadow-[0_30px_70px_-40px_rgba(67,104,42,0.6)] ring-1 ring-ink-900/[0.06] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold text-ink-900">1. Ce que vous possédez</h2>
              <button onClick={() => setAssets(EMPTY)} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-900"><RotateCcw className="h-4 w-4" /> Tout effacer</button>
            </div>
            <div className="mt-6 grid gap-3">
              {FIELDS.map(({ key, label, hint, icon: Icon, unit, minus }) => (
                <label key={key} htmlFor={`z-${key}`} className={`group flex items-center gap-3 rounded-2xl border-2 p-3 transition focus-within:border-[var(--r-from)] focus-within:bg-[var(--r-soft)] sm:p-4 ${minus ? 'border-red-200 bg-red-50/40' : 'border-ink-900/[0.07] bg-ivory-50'}`}>
                  <span className={`hidden h-11 w-11 shrink-0 place-items-center rounded-xl sm:grid ${minus ? 'bg-red-100 text-red-700' : 'r-soft r-ink'}`}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-ink-900">{minus ? '− ' : ''}{label}</span>
                    <span className="block text-xs text-ink-500">{hint}{unit === 'g' && (assets[key] > 0 ? ` · ≈ ${formatFCFA(value(key))}` : '')}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <input
                      id={`z-${key}`}
                      inputMode="numeric"
                      value={fmtInput(assets[key])}
                      onChange={(e) => setAssets({ ...assets, [key]: parseInput(e.target.value) })}
                      placeholder="0"
                      className="w-[7.5rem] rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-right font-display text-lg font-bold text-ink-900 outline-none focus:border-[var(--r-to)] sm:w-40"
                    />
                    <span className="w-4 text-xs font-bold text-ink-400 sm:w-8">{unit === 'g' ? 'g' : 'F'}</span>
                  </span>
                </label>
              ))}
            </div>

            <h2 className="mt-8 font-serif text-2xl font-semibold text-ink-900">2. Le seuil (nisâb)</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(['silver', 'gold'] as const).map((b) => (
                <button key={b} onClick={() => setBasis(b)} aria-pressed={basis === b} className={`rounded-2xl p-4 text-left transition ${basis === b ? 'r-grad text-white shadow-lg' : 'bg-ivory-200 text-ink-800 hover:bg-ivory-300'}`}>
                  <span className="block font-bold">{b === 'silver' ? 'Argent · 595 g' : 'Or · 85 g'}</span>
                  <span className={`block text-xs ${basis === b ? 'text-white/85' : 'text-ink-500'}`}>{b === 'silver' ? 'Seuil plus bas, recommandé par de nombreux savants' : 'Seuil plus élevé'}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ['Prix de l’or (24 carats)', goldPrice, setGoldPrice],
                ['Prix de l’argent', silverPrice, setSilverPrice],
              ].map(([label, v, set]) => (
                <label key={label as string} className="flex items-center justify-between gap-2 rounded-xl bg-ivory-100 px-3 py-2 text-sm">
                  <span className="font-semibold text-ink-700">{label as string}</span>
                  <span className="flex items-center gap-1">
                    <input inputMode="numeric" value={fmtInput(v as number)} onChange={(e) => (set as (n: number) => void)(parseInput(e.target.value))} className="w-24 rounded-lg border border-ink-900/10 bg-white px-2 py-1.5 text-right font-bold text-ink-900 outline-none" />
                    <span className="text-xs text-ink-400">F/g</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-400">Cours indicatifs de novembre 2026 : vérifiez le prix du jour auprès d’un bijoutier et corrigez-le si besoin.</p>
          </div>

          {/* Barre de résultat toujours visible sur téléphone */}
          {base > 0 && (
            <a href="#resultat-zakat" className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-2xl bg-[#22351a] px-5 py-3 text-white shadow-2xl lg:hidden">
              <span className="text-sm font-semibold text-white/75">{due ? 'Votre zakat' : 'Sous le seuil'}</span>
              <span className="font-display text-xl font-bold tabular-nums">{shown.toLocaleString('fr-FR')} F</span>
            </a>
          )}

          {/* Résultat */}
          <aside id="resultat-zakat" className="reveal scroll-mt-24 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#22351a] p-6 text-white shadow-[0_40px_80px_-40px_rgba(67,104,42,0.9)] sm:p-8">
              <div className="absolute inset-0 bg-pattern opacity-[0.08]" aria-hidden />
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#93C26B]/30 blur-[70px] animate-drift" aria-hidden />
              <p className="relative text-[12px] font-extrabold uppercase tracking-[0.22em] text-[#cfe6b6]">Votre zakat</p>
              <p className="relative mt-2 font-display text-5xl font-bold tabular-nums sm:text-6xl">{shown.toLocaleString('fr-FR')}<span className="ml-2 text-2xl text-white/60">F</span></p>
              <p className="relative mt-2 text-sm text-white/75">
                {base === 0 ? 'Renseignez vos biens pour voir le résultat.' : due ? `2,5 % de ${formatFCFA(base)} de biens nets.` : `Vos biens nets (${formatFCFA(base)}) n’atteignent pas le seuil : la zakat n’est pas due.`}
              </p>

              <div className="relative mt-6">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>Seuil : {formatFCFA(nisab)}</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
                  <div className={`h-full rounded-full transition-all duration-700 ${due ? 'bg-gradient-to-r from-[#cfe6b6] to-gold-300' : 'bg-white/60'}`} style={{ width: `${Math.max(pct, base ? 3 : 0)}%` }} />
                </div>
              </div>

              {breakdown.length > 0 && (
                <ul className="relative mt-6 space-y-1.5 border-t border-white/10 pt-5 text-sm">
                  {breakdown.map((f) => (
                    <li key={f.key} className="flex justify-between gap-3 text-white/80">
                      <span>{f.minus ? '− ' : ''}{f.label}</span>
                      <span className="font-semibold tabular-nums">{formatFCFA(value(f.key))}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="relative mt-7 grid gap-2">
                <Link to="/donations" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 font-bold text-[#43682A] shadow-lg transition hover:-translate-y-0.5">
                  <HandHeart className="h-5 w-5" /> Confier ma zakat à la DDR
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={save} disabled={!base} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-40">
                    <Save className="h-4 w-4" /> {saved ? 'Enregistré ✓' : 'Enregistrer'}
                  </button>
                  <button onClick={() => reminderIcs(zakat)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-bold transition hover:bg-white/10">
                    <BellRing className="h-4 w-4" /> Rappel dans 1 an
                  </button>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink-900/[0.06]">
                <p className="r-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">Mes calculs enregistrés</p>
                <ul className="mt-3 divide-y divide-ink-900/[0.06]">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                      <span className="text-ink-500">{new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-bold text-ink-900">{formatFCFA(h.zakat)}</span>
                        <button onClick={() => removeSaved(h.id)} aria-label="Supprimer ce calcul" className="text-ink-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      </section>

      <section className="bg-[#eef5e4]/70 py-16 md:py-24">
        <Container className="max-w-3xl">
          <p className="r-ink reveal flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.24em]"><span className="r-grad h-1 w-8 rounded-full" /> Comprendre</p>
          <h2 className="reveal mt-4 font-serif text-3xl font-semibold text-ink-900 md:text-[2.7rem]">La zakat en cinq questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="reveal overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/[0.06]">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-ink-900">
                  {f.q}
                  <ChevronDown className={`r-ink h-5 w-5 shrink-0 transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-700 animate-fade-up">{f.a}</p>}
              </div>
            ))}
          </div>
          <p className="reveal mt-6 text-sm text-ink-500">Ce calculateur donne une estimation. Pour un cas particulier (entreprise, héritage, biens agricoles…), demandez conseil à un savant ou <Link to="/appointments" className="r-ink font-bold underline">prenez rendez-vous</Link> avec la DDR.</p>
        </Container>
      </section>
    </div>
  );
};

export default ZakatSmart;
