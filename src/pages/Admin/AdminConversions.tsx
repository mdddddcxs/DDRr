import React from 'react';
import { Download, Phone } from 'lucide-react';
import { downloadCsv, dateStamp } from '../../lib/csv';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { listConversionRequests, updateConversionStatus } from '../../services/db';
import type { ConversionRequest } from '../../types';

const LABEL: Record<ConversionRequest['status'], string> = { pending: 'À appeler', contacted: 'Contacté', done: 'Shahâda faite' };

const AdminConversions = () => {
  const { data, error, reload } = useAdminData(listConversionRequests);
  const set = async (id: string, s: ConversionRequest['status']) => {
    try {
      await updateConversionStatus(id, s);
      reload();
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    }
  };
  return (
    <>
      <AdminTitle title="Demandes de conversion" subtitle="Personnes souhaitant être accompagnées pour prononcer la shahâda. À rappeler rapidement." action={<button onClick={() => downloadCsv(`shahada-ddr-${dateStamp()}.csv`, [['Reçu le', 'Nom', 'Téléphone', 'Lieu', 'Mode', 'Statut'], ...(data || []).map((c) => [new Date(c.createdAt).toLocaleString('fr-FR'), c.name, c.phone, c.location || '', c.method === 'video' ? 'Appel / vidéo' : 'En personne', LABEL[c.status]])])} disabled={!data?.length} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"><Download className="h-4 w-4" /> Excel</button>} />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {data && data.length === 0 && <Empty>Aucune demande pour le moment.</Empty>}
      <div className="space-y-4">
        {(data || []).map((c) => (
          <article key={c.id} className={`card p-5 ${c.status === 'pending' ? 'border-gold-400/30' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink-900">{c.name}</p>
                <p className="text-sm text-ink-500">{c.location || 'Lieu non précisé'} · {c.method === 'video' ? 'Par appel / vidéo' : 'En personne'}</p>
                <p className="text-xs text-ink-400">Reçu {fmtDateTime(c.createdAt)}</p>
              </div>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 rounded-full bg-ink-900/5 px-4 py-2 font-mono text-sm hover:bg-ink-900/10"><Phone className="h-4 w-4" /> {c.phone}</a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(LABEL) as ConversionRequest['status'][]).map((s) => (
                <button key={s} onClick={() => set(c.id, s)} className={`rounded-full px-4 py-2 text-sm font-bold ${c.status === s ? 'bg-brand-600 text-white' : 'bg-ink-900/5 text-ink-500 hover:text-ink-900'}`}>{LABEL[s]}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export default AdminConversions;
