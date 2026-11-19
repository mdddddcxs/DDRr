import React, { useEffect, useState } from 'react';
import { AdminTitle, useAdminData } from '../../components/AdminLayout';
import { Button, Notice, formatFCFA } from '../../components/ui';
import { getCampaign, updateCampaign, uploadMedia } from '../../services/db';
import { ImageField } from '../../components/forms';

const AdminCampaigns = () => {
  const { data: c, reload } = useAdminData(() => getCampaign());
  const [form, setForm] = useState({ title: '', description: '', target: '', imageUrl: '' });
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (c) setForm({ title: c.title, description: c.description, target: String(c.targetAmount), imageUrl: c.imageUrl?.startsWith('https://images.unsplash') ? '' : c.imageUrl || '' });
  }, [c]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c) return;
    const target = Number(form.target);
    if (!target || target < 1) return setErr('Objectif invalide.');
    if (form.imageUrl && !/^https:\/\//.test(form.imageUrl)) return setErr("L'image doit être une adresse https://");
    setState('saving');
    setErr('');
    try {
      await updateCampaign(c.id, { title: form.title, description: form.description, targetAmount: target, imageUrl: form.imageUrl || null });
      setState('saved');
      reload();
    } catch (e: any) {
      setErr(e?.message || 'Erreur');
      setState('error');
    }
  };

  return (
    <>
      <AdminTitle title="Campagne de dons" subtitle={c ? `Collecté : ${formatFCFA(c.currentAmount)} (calculé automatiquement à partir des dons)` : undefined} />
      <form onSubmit={save} className="card max-w-2xl space-y-5 p-6">
        <div><label className="label" htmlFor="c-title">Titre</label><input id="c-title" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></div>
        <div><label className="label" htmlFor="c-desc">Description</label><textarea id="c-desc" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></div>
        <div><label className="label" htmlFor="c-target">Objectif (F CFA)</label><input id="c-target" type="number" min={1} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="input" /></div>
        <ImageField id="c-img" label="Photo du projet (chantier, maquette…)" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} upload={(f) => uploadMedia(f, 'campaign')} />
        {err && <Notice tone="error">{err}</Notice>}
        {state === 'saved' && <Notice tone="success">Campagne mise à jour.</Notice>}
        <Button type="submit" disabled={state === 'saving' || !c}>{state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </form>
    </>
  );
};

export default AdminCampaigns;
