import React, { useEffect, useMemo, useState } from 'react';

type Timings = Record<'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha', string>;
type Data = { timings: Timings; hijri: string; readable: string };

const PRAYERS: { key: keyof Timings; fr: string; ar: string }[] = [
  { key: 'Fajr', fr: 'Fajr', ar: 'الفجر' },
  { key: 'Dhuhr', fr: 'Dhouhr', ar: 'الظهر' },
  { key: 'Asr', fr: 'Asr', ar: 'العصر' },
  { key: 'Maghrib', fr: 'Maghrib', ar: 'المغرب' },
  { key: 'Isha', fr: 'Icha', ar: 'العشاء' },
];

const HIJRI_MONTHS_FR = ['Mouharram', 'Safar', 'Rabi al-awwal', 'Rabi ath-thani', 'Joumada al-oula', 'Joumada ath-thania', 'Rajab', 'Chaabane', 'Ramadan', 'Chawwal', 'Dhou al-qi’da', 'Dhou al-hijja'];

const toMin = (t: string) => {
  const [h, m] = t.split(' ')[0].split(':').map(Number);
  return h * 60 + m;
};

/** Horaires de prière d'Abidjan (API Aladhan, méthode Ligue islamique mondiale), mis en cache pour la journée. */
const PrayerTimes = React.memo(() => {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const d = new Date();
    const key = `ddr_prayer_${d.toDateString()}`;
    try {
      const cached = localStorage.getItem(key);
      if (cached) return setData(JSON.parse(cached));
    } catch {
      /* stockage indisponible */
    }
    fetch(`https://api.aladhan.com/v1/timingsByCity/${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}?city=Abidjan&country=CI&method=3`)
      .then((r) => r.json())
      .then((j) => {
        if (!j?.data) throw new Error('vide');
        const h = j.data.date.hijri;
        const value: Data = {
          timings: j.data.timings,
          hijri: `${Number(h.day)} ${HIJRI_MONTHS_FR[Number(h.month.number) - 1] || h.month.en} ${h.year}`,
          readable: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        };
        setData(value);
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          /* ignore */
        }
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const next = useMemo(() => {
    if (!data) return null;
    const cur = now.getHours() * 60 + now.getMinutes();
    const found = PRAYERS.find((p) => toMin(data.timings[p.key]) > cur);
    const p = found || PRAYERS[0];
    let diff = toMin(data.timings[p.key]) - cur;
    if (diff < 0) diff += 24 * 60;
    return { ...p, left: diff >= 60 ? `${Math.floor(diff / 60)} h ${String(diff % 60).padStart(2, '0')}` : `${diff} min` };
  }, [data, now]);

  if (failed) {
    return <p className="card p-6 text-center text-ink-500">Les horaires de prière n'ont pas pu être chargés. Vérifiez votre connexion.</p>;
  }

  return (
    <div className="card relative overflow-hidden p-6 md:p-8">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-400">Abidjan · {data?.readable || '…'}</p>
          <p className="mt-1 font-serif text-lg text-gold-600">{data?.hijri || ' '}</p>
          {next && (
            <p className="mt-4 text-ink-800">
              Prochaine prière : <span className="font-serif text-3xl font-semibold text-ink-900">{next.fr}</span>
              <span className="ml-3 rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">dans {next.left}</span>
            </p>
          )}
        </div>
        <ol className="grid grid-cols-5 gap-2 md:gap-3">
          {PRAYERS.map((p) => {
            const active = next?.key === p.key;
            return (
              <li
                key={p.key}
                className={`flex min-w-0 flex-col items-center rounded-2xl border px-1.5 py-3 text-center transition md:min-w-[92px] md:px-3 md:py-4 ${
                  active ? 'border-gold-300/60 bg-gradient-to-b from-gold-300/25 to-gold-500/5 text-white shadow-[0_10px_30px_-12px_rgba(220,180,74,0.6)]' : 'border-ink-900/5 bg-ink-900/5 text-ink-700'
                }`}
              >
                <span className="font-arabic text-base leading-none text-gold-600/90 md:text-lg" lang="ar">{p.ar}</span>
                <span className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-500 md:text-xs">{p.fr}</span>
                <span className={`mt-1 font-mono text-sm md:text-lg ${active ? 'font-bold' : ''}`}>{data ? data.timings[p.key].split(' ')[0] : '--:--'}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
});

export default PrayerTimes;
