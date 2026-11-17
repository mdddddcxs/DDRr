import React, { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { Button, Notice, formatFCFA } from '../../components/ui';
import { addOfflineDonation, deleteDonation, listDonations } from '../../services/db';
import type { Donation } from '../../types';

const METHODS: Donation['method'][] = ['Wave', 'OrangeMoney', 'MTN', 'Moov', 'Espèces', 'Carte', 'Autre'];

const csvCell = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // évite l'injection de formules dans Excel
  return `"${s.replace(/"/g, '""')}"`;
};

const AdminDonations = () => {
  const { data, error, reload } = useAdminData(listDonations);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ amount: '', donorName: '', isAnonymous: false, donorPhone: '', method: 'Wave' as Donation['method'], note: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const total = (data || []).filter((d) => d.status === 'success').reduce((s, d) => s + d.amount, 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount < 1) return setMsg('Montant invalide.');
    setSaving(true);
    setMsg('');
    try {
      await addOfflineDonation({ ...form, amount });
      setForm({ amount: '', donorName: '', isAnonymous: false, donorPhone: '', method: 'Wave', note: '' });
      setShow(false);
      reload();
    } catch (e: any) {
      setMsg(e?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [['Date', 'Donateur', 'Anonyme', 'Téléphone', 'Montant', 'Moyen', 'Statut', 'Note']].concat(
      (data || []).map((d) => [new Date(d.createdAt).toLocaleString('fr-FR'), d.donorName, d.isAnonymous ? 'oui' : 'non', d.donorPhone, String(d.amount), d.method, d.status, d.note || '']),
    );
    const blob = new Blob(['﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dons-ddr-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <AdminTitle
        title="Dons"
        subtitle={`Total enregistré : ${formatFCFA(total)}. La campagne se met à jour automatiquement.`}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={exportCsv} disabled={!data?.length}><Download className="h-4 w-4" /> Export Excel</Button>
            <Button size="sm" onClick={() => setShow((v) => !v)}><Plus className="h-4 w-4" /> Enregistrer un don</Button>
          </div>
        }
      />
      {show && (
        <form onSubmit={save} className="card mb-6 grid gap-4 p-5 md:grid-cols-3">
          <div><label className="label" htmlFor="d-amount">Montant (F CFA) *</label><input id="d-amount" type="number" min={1} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" /></div>
          <div><label className="label" htmlFor="d-name">Nom du donateur</label><input id="d-name" maxLength={120} value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} className="input" /></div>
          <div><label className="label" htmlFor="d-method">Moyen</label><select id="d-method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Donation['method'] })} className="input">{METHODS.map((m) => <option key={m} className="bg-night-900">{m}</option>)}</select></div>
          <div><label className="label" htmlFor="d-phone">Téléphone</label><input id="d-phone" maxLength={30} value={form.donorPhone} onChange={(e) => setForm({ ...form, donorPhone: e.target.value })} className="input" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="d-note">Note (référence de transaction…)</label><input id="d-note" maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input" /></div>
          <label className="flex items-center gap-2 text-sm text-sand-400"><input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} className="accent-brand-600" /> Afficher « Anonyme » sur le site</label>
          <div className="flex items-center gap-3 md:col-span-2 md:justify-end">{msg && <span className="text-sm text-red-300">{msg}</span>}<Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
        </form>
      )}
      <Notice tone="info">Le paiement en ligne n’est pas encore activé : enregistrez ici les dons reçus (Wave, espèces…). Ils s’affichent sur le site et font avancer la barre de la campagne.</Notice>
      {error && <p className="my-4 text-sm text-red-300">{error}</p>}
      {data && data.length === 0 && <div className="mt-6"><Empty>Aucun don enregistré.</Empty></div>}
      {data && data.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-sand-500">
              <tr><th className="p-4">Date</th><th className="p-4">Donateur</th><th className="p-4">Moyen</th><th className="p-4 text-right">Montant</th><th className="p-4" /></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((d) => (
                <tr key={d.id}>
                  <td className="p-4 text-sand-400">{fmtDateTime(d.createdAt)}</td>
                  <td className="p-4 text-cream-100">{d.donorName}{d.isAnonymous && <span className="ml-2 text-xs text-sand-500">(anonyme)</span>}{d.note && <span className="block text-xs text-sand-500">{d.note}</span>}</td>
                  <td className="p-4 text-sand-400">{d.method}</td>
                  <td className="p-4 text-right font-bold text-white">{formatFCFA(d.amount)}</td>
                  <td className="p-4 text-right"><button onClick={async () => { if (confirm('Supprimer ce don ?')) { await deleteDonation(d.id).catch((e) => alert(e.message)); reload(); } }} className="rounded-full p-2 text-red-300 hover:bg-red-500/10" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminDonations;
