import React, { useMemo, useState } from 'react';
import { Copy, Download, Mail, Search, Trash2 } from 'lucide-react';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { deleteSubscriber, listSubscribers } from '../../services/db';
import { downloadCsv, dateStamp } from '../../lib/csv';

/** Abonnés à la lettre d'information (inscrits depuis le pied de page du site). */
const AdminSubscribers = () => {
  const { data, error, setData } = useAdminData(listSubscribers);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState(false);
  const list = useMemo(() => (data || []).filter((s) => s.email.includes(q.trim().toLowerCase())), [data, q]);

  const remove = async (id: string, email: string) => {
    if (!confirm(`Désinscrire ${email} ? Cette action est définitive.`)) return;
    try {
      await deleteSubscriber(id);
      setData((data || []).filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    }
  };
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(list.map((s) => s.email).join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copie impossible sur cet appareil : utilisez l’export Excel.');
    }
  };

  return (
    <>
      <AdminTitle
        title="Abonnés"
        subtitle="Personnes inscrites pour recevoir les dates des rappels et les annonces de la DDR."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={copyAll} disabled={!list.length} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-ink-700 ring-1 ring-ink-900/10 disabled:opacity-40"><Copy className="h-4 w-4" /> {copied ? 'Copié ✓' : 'Copier les emails'}</button>
            <a href={list.length ? `mailto:?bcc=${encodeURIComponent(list.map((s) => s.email).join(','))}&subject=${encodeURIComponent('Nouvelles de la DDR')}` : undefined} aria-disabled={!list.length} className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-ink-700 ring-1 ring-ink-900/10 ${list.length ? '' : 'pointer-events-none opacity-40'}`}><Mail className="h-4 w-4" /> Écrire à tous</a>
            <button onClick={() => downloadCsv(`abonnes-ddr-${dateStamp()}.csv`, [['Email', 'Inscrit le'], ...list.map((s) => [s.email, new Date(s.createdAt).toLocaleDateString('fr-FR')])])} disabled={!list.length} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"><Download className="h-4 w-4" /> Excel</button>
          </div>
        }
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <label className="mb-5 flex max-w-md items-center gap-2 rounded-full bg-white px-4 py-2.5 ring-1 ring-ink-900/10">
        <Search className="h-4 w-4 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un email" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </label>
      <p className="mb-3 text-sm text-ink-500">{data ? `${list.length} abonné(s)` : 'Chargement…'}</p>
      {data && list.length === 0 && <Empty>{data.length ? 'Aucun résultat.' : 'Aucun abonné pour le moment.'}</Empty>}
      <ul className="card divide-y divide-ink-900/[0.06]">
        {list.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <span className="min-w-0">
              <a href={`mailto:${s.email}`} className="block truncate font-semibold text-ink-900 hover:text-brand-700">{s.email}</a>
              <span className="text-xs text-ink-400">Inscrit {fmtDateTime(s.createdAt)}</span>
            </span>
            <button onClick={() => remove(s.id, s.email)} className="rounded-full p-2 text-red-600 hover:bg-red-500/10" aria-label={`Désinscrire ${s.email}`}><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default AdminSubscribers;
