// Graphiques de l'espace admin, en SVG, sans dépendance.
// Palette validée (daltonisme, contraste) : orange DDR, bleu ciel, vert sauge, lavande.
import React, { useEffect, useMemo, useRef, useState } from 'react';

export const SERIES = ['#D9640A', '#2382B5', '#5A8A3A', '#8A5BC4'];
const GRID = '#ECE4D6';
const SURFACE = '#FFFDF9';

const nice = (max: number) => {
  if (max <= 4) return [0, 1, 2, 3, 4].map((x) => (x * Math.max(1, max)) / 4).filter((v, i, a) => a.indexOf(v) === i);
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => max / s <= 5) || p * 10;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(v);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
};
export const fmtN = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n.toLocaleString('fr-FR'));

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export const Legend = ({ items }: { items: { name: string; color: string }[] }) =>
  items.length < 2 ? null : (
    <ul className="flex flex-wrap gap-4 text-sm text-ink-700">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} /> {i.name}
        </li>
      ))}
    </ul>
  );

/** Courbes dans le temps (1 à 4 séries), avec réticule et infobulle au survol. */
export function LineChart({
  labels,
  series,
  height = 260,
  formatLabel = (s: string) => s,
}: {
  labels: string[];
  series: { name: string; values: number[]; color?: string }[];
  height?: number;
  formatLabel?: (s: string) => string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 40, r: 56, t: 12, b: 28 };
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const ticks = nice(max);
  const top = ticks[ticks.length - 1];
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length <= 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const every = Math.ceil(labels.length / Math.max(2, Math.floor(iw / 70)));

  const paths = useMemo(
    () =>
      series.map((s) => {
        const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
        return { line: `M${pts.join('L')}`, area: `M${x(0)},${y(0)}L${pts.join('L')}L${x(s.values.length - 1)},${y(0)}Z` };
      }),
    [series, w, top], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round(((px - 0) / r.width) * (labels.length - 1));
    setHover(Math.min(labels.length - 1, Math.max(0, i)));
  };

  return (
    <div ref={ref} className="relative w-full">
      <svg width={w} height={height} role="img" aria-label={`Courbe : ${series.map((s) => s.name).join(', ')}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-ink-400 text-[11px]">{fmtN(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % every === 0 || i === labels.length - 1 ? (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-ink-400 text-[11px]">{formatLabel(l)}</text>
        ) : null))}
        {series.map((s, k) => {
          const c = s.color || SERIES[k];
          return (
            <g key={s.name}>
              {k === 0 && <path d={paths[k].area} fill={c} opacity={0.1} />}
              <path d={paths[k].line} fill="none" stroke={c} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1] || 0)} r={4} fill={c} stroke={SURFACE} strokeWidth={2} />
              <text x={x(s.values.length - 1) + 8} y={y(s.values[s.values.length - 1] || 0) + 4} className="fill-ink-700 text-[11px] font-semibold">{fmtN(s.values[s.values.length - 1] || 0)}</text>
            </g>
          );
        })}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#3a4568" strokeWidth={1} opacity={0.35} />
            {series.map((s, k) => <circle key={s.name} cx={x(hover)} cy={y(s.values[hover] || 0)} r={5} fill={s.color || SERIES[k]} stroke={SURFACE} strokeWidth={2} />)}
          </g>
        )}
        <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-2 z-10 rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-xl" style={{ left: Math.min(w - 160, Math.max(0, x(hover) - 70)) }}>
          <p className="font-bold">{formatLabel(labels[hover])}</p>
          {series.map((s, k) => (
            <p key={s.name} className="mt-0.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color || SERIES[k] }} /> {s.name} : <b>{(s.values[hover] || 0).toLocaleString('fr-FR')}</b>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Barres horizontales classées (pages, sources…). */
export function BarList({ items, color = SERIES[0], unit = '' }: { items: { label: string; value: number; hint?: string }[]; color?: string; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-400">Pas encore de données sur cette période.</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label} className="group" title={`${i.label} : ${i.value.toLocaleString('fr-FR')} ${unit}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-ink-800">{i.label}</span>
            <span className="shrink-0 tabular-nums text-ink-700"><b>{i.value.toLocaleString('fr-FR')}</b>{i.hint && <span className="ml-1.5 text-xs text-ink-400">{i.hint}</span>}</span>
          </div>
          <div className="h-3 rounded-r bg-ivory-200">
            <div className="h-full rounded-r transition-all duration-700 group-hover:brightness-110" style={{ width: `${Math.max(2, (i.value / max) * 100)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Colonnes (ex. : fréquentation par heure). */
export function Columns({ values, labels, color = SERIES[1], height = 160 }: { values: number[]; labels: string[]; color?: string; height?: number }) {
  const max = Math.max(1, ...values);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative">
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {values.map((v, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${labels[i]} : ${v}`}
            className="flex h-full flex-1 items-end"
          >
            <span className="w-full rounded-t-[4px] transition-all duration-500" style={{ height: `${v ? Math.max(3, (v / max) * 100) : 0}%`, background: color, opacity: hover === null || hover === i ? 1 : 0.45 }} />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink-400">
        {labels.filter((_, i) => i % 6 === 0).map((l) => <span key={l}>{l}</span>)}
        <span>23 h</span>
      </div>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-2 rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-white" style={{ left: `${Math.min(80, (hover / values.length) * 100)}%` }}>
          {labels[hover]} : <b>{values[hover]}</b>
        </div>
      )}
    </div>
  );
}

/** Mini-courbe pour les tuiles. */
export function Sparkline({ values, color = SERIES[0] }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(1)},${(28 - (v / max) * 26).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** Évolution par rapport à la période précédente. */
export const Delta = ({ now, before }: { now: number; before: number }) => {
  if (!before && !now) return <span className="text-xs text-ink-400">—</span>;
  if (!before) return <span className="text-xs font-bold text-emerald-700">nouveau</span>;
  const p = Math.round(((now - before) / before) * 100);
  return <span className={`text-xs font-bold ${p >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{p >= 0 ? '▲' : '▼'} {Math.abs(p)} %</span>;
};
