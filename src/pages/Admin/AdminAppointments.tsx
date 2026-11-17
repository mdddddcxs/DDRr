import React, { useState } from 'react';
import { Check, Phone, Trash2, X } from 'lucide-react';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { deleteAppointment, listAppointments, updateAppointmentStatus } from '../../services/db';
import type { Appointment } from '../../types';

const STATUS: Record<Appointment['status'], { label: string; cls: string }> = {
  pending: { label: 'En attente', cls: 'bg-gold-400/15 text-gold-200' },
  confirmed: { label: 'Confirmé', cls: 'bg-emerald-500/15 text-emerald-200' },
  rejected: { label: 'Refusé', cls: 'bg-red-500/15 text-red-200' },
};

const AdminAppointments = () => {
  const { data, error, reload } = useAdminData(listAppointments);
  const [filter, setFilter] = useState<'all' | Appointment['status']>('pending');
  const [busy, setBusy] = useState('');
  const list = (data || []).filter((a) => filter === 'all' || a.status === filter);

  const act = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
      reload();
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <AdminTitle title="Rendez-vous" subtitle="Demandes envoyées depuis la page Contact." />
      <div className="mb-6 flex flex-wrap gap-2">
        {(['pending', 'confirmed', 'rejected', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f ? 'bg-brand-600 text-white' : 'bg-white/5 text-sand-400 hover:text-white'}`}>
            {f === 'all' ? 'Tous' : STATUS[f].label}
          </button>
        ))}
      </div>
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {data && list.length === 0 && <Empty>Aucune demande ici.</Empty>}
      <div className="space-y-4">
        {list.map((a) => (
          <article key={a.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-cream-50">{a.name} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${STATUS[a.status].cls}`}>{STATUS[a.status].label}</span></p>
                <p className="mt-1 text-sm text-brand-300">{a.subject}{a.requestedDate && ` · souhaité le ${new Date(a.requestedDate).toLocaleDateString('fr-FR')}`}</p>
                <p className="text-xs text-sand-500">Reçu {fmtDateTime(a.createdAt)}</p>
              </div>
              <a href={`tel:${a.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 font-mono text-sm text-cream-100 hover:bg-white/10"><Phone className="h-4 w-4" /> {a.phone}</a>
            </div>
            {a.message && <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/20 p-4 text-sm text-cream-200">{a.message}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {a.status !== 'confirmed' && (
                <button disabled={busy === a.id} onClick={() => act(a.id, () => updateAppointmentStatus(a.id, 'confirmed'))} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"><Check className="h-4 w-4" /> Confirmer</button>
              )}
              {a.status !== 'rejected' && (
                <button disabled={busy === a.id} onClick={() => act(a.id, () => updateAppointmentStatus(a.id, 'rejected'))} className="flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-sand-400 hover:text-white"><X className="h-4 w-4" /> Refuser</button>
              )}
              <button disabled={busy === a.id} onClick={() => confirm('Supprimer définitivement cette demande ?') && act(a.id, () => deleteAppointment(a.id))} className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Supprimer</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export default AdminAppointments;
