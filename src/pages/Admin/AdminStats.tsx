import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Laptop, RefreshCw, Smartphone, Tablet, Users, Eye, MousePointerClick, Radio, Trash2 } from 'lucide-react';
import { AdminTitle } from '../../components/AdminLayout';
import { BarList, Columns, Delta, Legend, LineChart, SERIES, Sparkline } from '../../components/admin/Charts';
import { getAdminStats, purgeOldStats, type AdminStats as Stats } from '../../services/db';
import { EVENT_LABELS } from '../../lib/analytics';
import { downloadCsv, dateStamp } from '../../lib/csv';

const PERIODS = [
  [7, '7 jours'],
  [30, '30 jours'],
  [90, '3 mois'],
  [365, '12 mois'],
] as const;

const PAGE_NAMES: Record<string, string> = {
  '/': 'Accueil', '/coran': 'Le Coran', '/apprendre': 'Apprendre', '/apprendre/quiz': 'Le Grand Quiz', '/learning': 'Centre du savoir',
  '/decouvrir': 'Découvrir l’Islam', '/la-ddr': 'La DDR', '/agenda': 'Agenda', '/rejoindre': 'Rejoindre', '/news': 'Actualités',
  '/debates': 'Débats & directs', '/conversions': 'Témoignages', '/shahada': 'Devenir musulman', '/chat': 'Compagnon DDR',
  '/donations': 'Soutenir', '/appointments': 'Contact', '/enfants': 'Espace enfants', '/outils/zakat': 'Zakat Smart', '/outils/studio': 'Studio Da’wa',
};
const pageName = (p: string) => PAGE_NAMES[p] || (p.startsWith('/news/') ? 'Article d’actualité' : p);
const fmtDay = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const Card = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="card p-5 sm:p-6">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="font-bold text-ink-900">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const AdminStats = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    getAdminStats(days)
      .then(setData)
      .catch((e) => setError(e.message === 'STATS_NOT_READY' ? 'STATS_NOT_READY' : e.message || 'Erreur'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = () => {
    if (!data) return;
    downloadCsv(`statistiques-ddr-${dateStamp()}.csv`, [
      ['Jour', 'Pages vues', 'Visiteurs'],
      ...data.daily.map((d) => [d.day, d.views, d.visitors]),
      [],
      ['Page', 'Vues', 'Visiteurs'],
      ...data.pages.map((p) => [pageName(p.path), p.views, p.visitors]),
      [],
      ['Source', 'Visites'],
      ...data.sources.map((s) => [s.source, s.visitors]),
    ]);
  };
  const purge = async () => {
    if (!confirm('Supprimer définitivement les statistiques de plus de 13 mois ?')) return;
    try {
      await purgeOldStats();
      load();
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    }
  };

  const t = data?.totals;
  const p = data?.previous;
  const devTotal = (data?.devices || []).reduce((s, d) => s + d.visitors, 0) || 1;
  const hours = Array.from({ length: 24 }, (_, h) => data?.hours.find((x) => x.hour === h)?.views || 0);

  return (
    <>
      <AdminTitle
        title="Statistiques"
        subtitle="Fréquentation du site, mesurée de façon anonyme : aucune donnée personnelle n’est enregistrée."
        action={
          <div className="flex gap-2">
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-ink-700 ring-1 ring-ink-900/10"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser</button>
            <button onClick={exportCsv} disabled={!data} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"><Download className="h-4 w-4" /> Excel</button>
          </div>
        }
      />

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {PERIODS.map(([d, label]) => (
          <button key={d} onClick={() => setDays(d)} aria-pressed={days === d} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${days === d ? 'bg-brand-600 text-white' : 'bg-white text-ink-700 ring-1 ring-ink-900/10'}`}>{label}</button>
        ))}
      </div>

      {error === 'STATS_NOT_READY' ? (
        <div className="card p-8 text-center">
          <p className="font-serif text-2xl font-semibold text-ink-900">La mesure d’audience est en cours d’activation</p>
          <p className="mx-auto mt-2 max-w-lg text-ink-500">La base de données doit encore recevoir la table des statistiques. Dès qu’elle sera en place, les visites s’afficheront ici automatiquement.</p>
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <>
          {/* Chiffres clés */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Visiteurs uniques', icon: Users, v: t?.visitors, before: p?.visitors, spark: data?.daily.map((d) => d.visitors), color: SERIES[1] },
              { label: 'Pages vues', icon: Eye, v: t?.views, before: p?.views, spark: data?.daily.map((d) => d.views), color: SERIES[0] },
              { label: 'Visites', icon: MousePointerClick, v: t?.sessions, before: p?.sessions },
              { label: 'En ce moment', icon: Radio, v: data?.live, live: true },
            ].map((k) => (
              <div key={k.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <k.icon className="h-5 w-5 text-ink-500" />
                  {k.live ? <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> 5 dernières min.</span> : <Delta now={k.v || 0} before={k.before || 0} />}
                </div>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums text-ink-900">{k.v === undefined ? '…' : k.v.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-ink-500">{k.label}</p>
                {k.spark && <div className="mt-2"><Sparkline values={k.spark} color={k.color} /></div>}
              </div>
            ))}
          </div>

          {/* Courbe */}
          <div className="mt-6">
            <Card title="Fréquentation jour par jour" action={<Legend items={[{ name: 'Pages vues', color: SERIES[0] }, { name: 'Visiteurs', color: SERIES[1] }]} />}>
              {data ? (
                <LineChart labels={data.daily.map((d) => d.day)} formatLabel={fmtDay} series={[{ name: 'Pages vues', values: data.daily.map((d) => d.views) }, { name: 'Visiteurs', values: data.daily.map((d) => d.visitors) }]} />
              ) : (
                <div className="h-64 animate-pulse rounded-2xl bg-ink-900/5" />
              )}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Pages les plus vues">
              <BarList items={(data?.pages || []).map((x) => ({ label: pageName(x.path), value: x.views, hint: `${x.visitors} visiteurs` }))} unit="vues" />
            </Card>
            <Card title="D’où viennent les visiteurs">
              <BarList items={(data?.sources || []).map((x) => ({ label: x.source, value: x.visitors }))} color={SERIES[1]} unit="visites" />
            </Card>
            <Card title="Appareils utilisés">
              <div className="grid grid-cols-3 gap-3">
                {(['mobile', 'desktop', 'tablet'] as const).map((d, i) => {
                  const n = data?.devices.find((x) => x.device === d)?.visitors || 0;
                  const Icon = d === 'mobile' ? Smartphone : d === 'desktop' ? Laptop : Tablet;
                  return (
                    <div key={d} className="rounded-2xl bg-ivory-100 p-4 text-center">
                      <Icon className="mx-auto h-6 w-6 text-ink-500" />
                      <p className="mt-2 font-display text-2xl font-bold text-ink-900">{Math.round((n / devTotal) * 100)} %</p>
                      <p className="text-xs text-ink-500">{d === 'mobile' ? 'Téléphone' : d === 'desktop' ? 'Ordinateur' : 'Tablette'} · {n}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-ivory-300"><div className="h-full rounded-full" style={{ width: `${(n / devTotal) * 100}%`, background: SERIES[i] }} /></div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card title="Heures de visite (heure d’Abidjan)">
              <Columns values={hours} labels={hours.map((_, h) => `${h} h`)} />
            </Card>
            <Card title="Utilisation des outils">
              <BarList items={(data?.events || []).map((e) => ({ label: EVENT_LABELS[e.event] || e.event, value: e.count }))} color={SERIES[2]} />
            </Card>
            <Card title="Demandes reçues sur la période">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Rendez-vous', data?.forms.appointments, '/admin/appointments'],
                  ['Shahada', data?.forms.conversions, '/admin/conversions'],
                  ['Témoignages', data?.forms.testimonies, '/admin/mailbox'],
                  ['Abonnés', data?.forms.newsletter, '/admin/subscribers'],
                ].map(([label, v, to]) => (
                  <Link key={label as string} to={to as string} className="rounded-2xl bg-ivory-100 p-4 transition hover:bg-ivory-200">
                    <p className="font-display text-2xl font-bold text-ink-900">{v ?? '…'}</p>
                    <p className="text-sm text-ink-500">{label as string}</p>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-3 text-xs text-ink-400">
            Les statistiques sont conservées 13 mois.
            <button onClick={purge} className="inline-flex items-center gap-1 font-bold text-ink-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> Supprimer les plus anciennes</button>
          </p>
        </>
      )}
    </>
  );
};

export default AdminStats;
