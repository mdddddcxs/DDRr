import React, { useState } from 'react';
import { Download, Trash2, UserPlus } from 'lucide-react';
import { AdminTitle, useAdminData } from '../../components/AdminLayout';
import { Button, Notice } from '../../components/ui';
import { changeMyPassword, createAdmin, getMaintenance, getMyEmail, listAdmins, listSubscribers, removeAdmin, setMaintenance } from '../../services/db';

const AdminSettings = () => {
  const { data: maintenance, setData } = useAdminData(getMaintenance);
  const { data: subs } = useAdminData(listSubscribers);
  const { data: admins, reload: reloadAdmins, error: adminsErr } = useAdminData(listAdmins);
  const { data: me } = useAdminData(getMyEmail);
  const [err, setErr] = useState('');
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [adminMsg, setAdminMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [pwd, setPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMsg(null);
    try {
      await createAdmin(newAdmin);
      setAdminMsg({ tone: 'success', text: `Compte créé pour ${newAdmin.email}. Transmettez-lui son mot de passe en privé ; il pourra le changer ici.` });
      setNewAdmin({ name: '', email: '', password: '' });
      reloadAdmins();
    } catch (x: any) {
      setAdminMsg({ tone: 'error', text: x?.message || 'Erreur' });
    }
  };
  const revoke = async (id: string, email: string) => {
    if (!confirm(`Retirer les droits d'administration de ${email} ?`)) return;
    try {
      await removeAdmin(id);
      reloadAdmins();
    } catch (x: any) {
      alert(x?.message || 'Erreur');
    }
  };
  const savePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    try {
      await changeMyPassword(pwd);
      setPwd('');
      setPwdMsg({ tone: 'success', text: 'Mot de passe modifié.' });
    } catch (x: any) {
      setPwdMsg({ tone: 'error', text: x?.message || 'Erreur' });
    }
  };

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
          <h2 className="font-bold text-ink-900">Mode maintenance</h2>
          <p className="mt-1 text-sm text-ink-500">Masque le site public (l’administration reste accessible).</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-ink-900/5 p-4">
            <span className={`font-bold ${maintenance ? 'text-red-600' : 'text-emerald-600'}`}>{maintenance === null ? '…' : maintenance ? 'Site masqué' : 'Site en ligne'}</span>
            <Button size="sm" variant={maintenance ? 'primary' : 'ghost'} onClick={toggle} disabled={maintenance === null}>{maintenance ? 'Remettre en ligne' : 'Activer'}</Button>
          </div>
          {err && <div className="mt-3"><Notice tone="error">{err}</Notice></div>}
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-ink-900">Newsletter</h2>
          <p className="mt-1 text-sm text-ink-500">{subs ? `${subs.length} personne(s) inscrite(s) depuis le pied de page.` : '…'}</p>
          <Button size="sm" variant="ghost" className="mt-5" onClick={exportSubs} disabled={!subs?.length}><Download className="h-4 w-4" /> Télécharger la liste</Button>
        </section>
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-ink-900">Administrateurs</h2>
          {adminsErr && <p className="mt-2 text-sm text-red-600">{adminsErr}</p>}
          <ul className="mt-4 divide-y divide-ink-900/5">
            {(admins || []).map((a) => (
              <li key={a.userId} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-800">{a.name || a.email}<span className="ml-2 text-ink-400">{a.name ? a.email : ''}{a.email === me ? ' (vous)' : ''}</span></span>
                {a.email !== me && (
                  <button onClick={() => revoke(a.userId, a.email)} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Retirer</button>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={addAdmin} className="mt-5 grid gap-3 rounded-2xl bg-ink-900/5 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div><label className="label" htmlFor="na-name">Nom</label><input id="na-name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} className="input" /></div>
            <div><label className="label" htmlFor="na-email">Email *</label><input id="na-email" type="email" required value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className="input" /></div>
            <div><label className="label" htmlFor="na-pass">Mot de passe provisoire *</label><input id="na-pass" type="text" required minLength={10} value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} className="input" /></div>
            <Button type="submit" size="sm"><UserPlus className="h-4 w-4" /> Ajouter</Button>
          </form>
          {adminMsg && <div className="mt-3"><Notice tone={adminMsg.tone}>{adminMsg.text}</Notice></div>}
        </section>
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-ink-900">Mon mot de passe</h2>
          <form onSubmit={savePwd} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1"><label className="label" htmlFor="my-pass">Nouveau mot de passe (10 caractères minimum)</label><input id="my-pass" type="password" autoComplete="new-password" minLength={10} required value={pwd} onChange={(e) => setPwd(e.target.value)} className="input" /></div>
            <Button type="submit" size="sm">Changer</Button>
          </form>
          {pwdMsg && <div className="mt-3"><Notice tone={pwdMsg.tone}>{pwdMsg.text}</Notice></div>}
        </section>
      </div>
    </>
  );
};

export default AdminSettings;
