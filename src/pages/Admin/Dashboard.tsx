import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, CalendarCheck, CalendarPlus, Eye, HandHeart, Inbox, Megaphone, Newspaper, PenSquare, Radio, Sparkles, Target, Users,
} from 'lucide-react';
import { AdminTitle, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { formatFCFA } from '../../components/ui';
import { Delta, LineChart, SERIES, Sparkline } from '../../components/admin/Charts';
import { getAdminCounts, getAdminStats, getCampaign, listDonations, type AdminStats } from '../../services/db';
import { useSite } from '../../lib/site';

const fmtDay = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const Dashboard = () => {
  const site = useSite();
  const { data, error } = useAdminData(() => Promise.all([getAdminCounts(), getCampaign(), listDonations()]));
  const [counts, campaign, donations] = data || [null, null, null];
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsReady, setStatsReady] = useState(true);
  useEffect(() => {
    getAdminStats(14).then(setStats).catch(() => setStatsReady(false));
  }, []);

  const total30 = (donations || [])
    .filter((d) => d.status === 'success' && Date.now() - new Date(d.createdAt).getTime() < 30 * 864e5)
    .reduce((s, d) => s + d.amount, 0);
  const pct = campaign ? Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100)) : 0;
  const hour = new Date().getHours();
  const todo = (counts?.messages || 0) + (counts?.appointments || 0) + (counts?.conversions || 0);

  return (
    <>
      <AdminTitle title={hour < 12 ? 'Bonjour, as-salâmou ‘alaykoum' : 'Bonsoir, as-salâmou ‘alaykoum'} subtitle={todo ? `${todo} demande(s) attendent votre attention.` : 'Tout est à jour. Voici l’activité du site.'} />
      {error && <p className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-700">{error}</p>}

      {/* À traiter */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { to: '/admin/mailbox', label: 'Témoignages non lus', value: counts?.messages, icon: Inbox },
          { to: '/admin/appointments', label: 'Rendez-vous à confirmer', value: counts?.appointments, icon: CalendarCheck },
          { to: '/admin/conversions', label: 'Shahada à rappeler', value: counts?.conversions, icon: Sparkles },
          { to: '/admin/donations', label: 'Dons (30 derniers jours)', value: donations ? formatFCFA(total30) : undefined, icon: HandHeart },
        ].map(({ to, label, value, icon: Icon }) => (
          <Link key={to} to={to} className={`card card-hover p-5 ${typeof value === 'number' && value > 0 ? 'ring-2 ring-brand-400' : ''}`}>
            <div className="flex items-center justify-between">
              <Icon className="h-6 w-6 text-brand-600" />
              {typeof value === 'number' && value > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">à traiter</span>}
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-ink-900">{value ?? '…'}</p>
            <p className="text-sm text-ink-500">{label}</p>
          </Link>
        ))}
      </div>

      {/* Fréquentation */}
      <section className="card mt-6 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-ink-900">Fréquentation · 14 derniers jours</h2>
          <Link to="/admin/stats" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700">Toutes les statistiques <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {!statsReady ? (
          <p className="rounded-2xl bg-ivory-100 p-5 text-sm text-ink-500">La mesure d’audience est en cours d’activation. Les courbes apparaîtront ici dès les premières visites enregistrées.</p>
        ) : !stats ? (
          <div className="h-56 animate-pulse rounded-2xl bg-ink-900/5" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {[
                { label: 'Visiteurs', icon: Users, v: stats.totals.visitors, b: stats.previous.visitors, spark: stats.daily.map((d) => d.visitors), color: SERIES[1] },
                { label: 'Pages vues', icon: Eye, v: stats.totals.views, b: stats.previous.views, spark: stats.daily.map((d) => d.views), color: SERIES[0] },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl bg-ivory-100 p-4">
                  <div className="flex items-center justify-between"><k.icon className="h-4 w-4 text-ink-500" /><Delta now={k.v} before={k.b} /></div>
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900">{k.v.toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-ink-500">{k.label}</p>
                  <Sparkline values={k.spark} color={k.color} />
                </div>
              ))}
              <p className="col-span-2 flex items-center gap-2 text-sm text-ink-500 lg:col-span-1"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> {stats.live} visiteur(s) en ce moment</p>
            </div>
            <LineChart height={220} labels={stats.daily.map((d) => d.day)} formatLabel={fmtDay} series={[{ name: 'Pages vues', values: stats.daily.map((d) => d.views) }, { name: 'Visiteurs', values: stats.daily.map((d) => d.visitors) }]} />
          </div>
        )}
      </section>

      {/* Actions rapides */}
      <section className="mt-6">
        <h2 className="mb-3 font-bold text-ink-900">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { to: '/admin/content', label: 'Publier une actualité', icon: Newspaper },
            { to: '/admin/pilotage', label: site.banner.on ? 'Modifier l’annonce' : 'Afficher une annonce', icon: Megaphone, on: site.banner.on },
            { to: '/admin/pilotage', label: site.live.on ? 'Direct annoncé' : 'Annoncer un direct', icon: Radio, on: site.live.on },
            { to: '/admin/pilotage', label: 'Ajouter un événement', icon: CalendarPlus },
            { to: '/admin/donations', label: 'Enregistrer un don', icon: HandHeart },
            { to: '/admin/site', label: 'Contenu du site', icon: PenSquare },
          ].map(({ to, label, icon: Icon, on }) => (
            <Link key={label} to={to} className="card card-hover flex flex-col items-start gap-3 p-4">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${on ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700'}`}><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-bold text-ink-900">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink-900">{campaign?.title || 'Campagne'}</h2>
            <Link to="/admin/campaigns" className="text-ink-400 hover:text-ink-900" aria-label="Modifier la campagne"><Target className="h-5 w-5" /></Link>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-ink-900">{campaign ? formatFCFA(campaign.currentAmount) : '…'}</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-900/10">
            <div className="h-full bg-gradient-to-r from-brand-600 to-gold-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink-500">{pct}% de {campaign ? formatFCFA(campaign.targetAmount) : '…'}</p>
          <Link to="/admin/donations" className="mt-5 inline-block text-sm font-bold text-brand-700">Enregistrer un don →</Link>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink-900">Derniers dons</h2>
            <Link to="/admin/stats" className="text-ink-400 hover:text-ink-900" aria-label="Statistiques"><BarChart3 className="h-5 w-5" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-ink-900/5">
            {(donations || []).slice(0, 5).map((d) => (
              <li key={d.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-ink-700">{d.isAnonymous ? `Anonyme (${d.donorName})` : d.donorName}<span className="ml-2 text-xs text-ink-400">{fmtDateTime(d.createdAt)}</span></span>
                <span className="font-bold text-ink-900">{formatFCFA(d.amount)}</span>
              </li>
            ))}
            {donations && donations.length === 0 && <li className="py-3 text-sm text-ink-400">Aucun don enregistré pour l’instant.</li>}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
