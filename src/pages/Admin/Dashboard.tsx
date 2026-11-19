import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, HandHeart, Inbox, Sparkles } from 'lucide-react';
import { AdminTitle, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { formatFCFA } from '../../components/ui';
import { getAdminCounts, getCampaign, listDonations } from '../../services/db';

const Dashboard = () => {
  const { data, error } = useAdminData(() => Promise.all([getAdminCounts(), getCampaign(), listDonations()]));
  const [counts, campaign, donations] = data || [null, null, null];
  const total30 = (donations || [])
    .filter((d) => d.status === 'success' && Date.now() - new Date(d.createdAt).getTime() < 30 * 864e5)
    .reduce((s, d) => s + d.amount, 0);
  const pct = campaign ? Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100)) : 0;

  const cards = [
    { to: '/admin/mailbox', label: 'Témoignages non lus', value: counts?.messages, icon: Inbox },
    { to: '/admin/appointments', label: 'Rendez-vous en attente', value: counts?.appointments, icon: CalendarCheck },
    { to: '/admin/conversions', label: 'Demandes de conversion', value: counts?.conversions, icon: Sparkles },
    { to: '/admin/donations', label: 'Dons (30 derniers jours)', value: donations ? formatFCFA(total30) : undefined, icon: HandHeart },
  ];

  return (
    <>
      <AdminTitle title="Tableau de bord" subtitle="Assalamou alaykoum. Voici ce qui attend votre attention." />
      {error && <p className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ to, label, value, icon: Icon }) => (
          <Link key={to} to={to} className="card card-hover p-5">
            <Icon className="h-6 w-6 text-brand-400" />
            <p className="mt-4 font-serif text-3xl font-semibold text-white">{value ?? '…'}</p>
            <p className="text-sm text-sand-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-bold text-cream-50">{campaign?.title || 'Campagne'}</h2>
          <p className="mt-4 font-serif text-3xl text-white">{campaign ? formatFCFA(campaign.currentAmount) : '…'}</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-brand-600 to-gold-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-sand-400">{pct}% de {campaign ? formatFCFA(campaign.targetAmount) : '…'}</p>
          <Link to="/admin/donations" className="mt-5 inline-block text-sm font-bold text-brand-300">Enregistrer un don →</Link>
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-cream-50">Derniers dons</h2>
          <ul className="mt-4 divide-y divide-white/5">
            {(donations || []).slice(0, 5).map((d) => (
              <li key={d.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-cream-200">{d.isAnonymous ? `Anonyme (${d.donorName})` : d.donorName}<span className="ml-2 text-xs text-sand-500">{fmtDateTime(d.createdAt)}</span></span>
                <span className="font-bold text-white">{formatFCFA(d.amount)}</span>
              </li>
            ))}
            {donations && donations.length === 0 && <li className="py-3 text-sm text-sand-500">Aucun don enregistré pour l’instant.</li>}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
