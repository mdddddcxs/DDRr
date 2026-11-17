import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { AdminTitle, useAdminData } from '../../components/AdminLayout';
import { Button, Notice } from '../../components/ui';
import { getMaintenance, listSubscribers, setMaintenance } from '../../services/db';

const AdminSettings = () => {
  const { data: maintenance, setData } = useAdminData(getMaintenance);
  const { data: subs } = useAdminData(listSubscribers);
  const [err, setErr] = useState('');

  const toggle = async () => {
    const next = !maintenance;
    if (next && !confirm('Activer le mode maintenance ? Les visiteurs verront une page « Le site fait peau neuve ».')) return;
    try {
      await setMaintenance(next);
      setData(next);
    } catch (e: any) {
      setErr(e?.message || 'Erreur');
    }
  };

  const exportSubs = () => {
    const blob = new Blob(['﻿email;date\n' + (subs || []).map((s) => `${s.email};${new Date(s.createdAt).toLocaleDateString('fr-FR')}`).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'abonnes-newsletter-ddr.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <AdminTitle title="Réglages" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-bold text-cream-50">Mode maintenance</h2>
          <p className="mt-1 text-sm text-sand-400">Masque le site public (l’administration reste accessible).</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-black/20 p-4">
            <span className={`font-bold ${maintenance ? 'text-red-300' : 'text-emerald-300'}`}>{maintenance === null ? '…' : maintenance ? 'Site masqué' : 'Site en ligne'}</span>
            <Button size="sm" variant={maintenance ? 'primary' : 'ghost'} onClick={toggle} disabled={maintenance === null}>{maintenance ? 'Remettre en ligne' : 'Activer'}</Button>
          </div>
          {err && <div className="mt-3"><Notice tone="error">{err}</Notice></div>}
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-cream-50">Newsletter</h2>
          <p className="mt-1 text-sm text-sand-400">{subs ? `${subs.length} personne(s) inscrite(s) depuis le pied de page.` : '…'}</p>
          <Button size="sm" variant="ghost" className="mt-5" onClick={exportSubs} disabled={!subs?.length}><Download className="h-4 w-4" /> Télécharger la liste</Button>
        </section>
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-cream-50">Gérer les administrateurs</h2>
          <p className="mt-2 text-sm leading-relaxed text-sand-400">
            Pour ajouter un administrateur : créez son compte dans Supabase (Authentication → Users → Add user), puis ajoutez son identifiant dans la table <code className="rounded bg-white/5 px-1">admins</code>. Pour changer votre mot de passe, utilisez le même écran Supabase.
          </p>
        </section>
      </div>
    </>
  );
};

export default AdminSettings;
