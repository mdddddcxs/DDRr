import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { Button, Notice } from '../../components/ui';
import { deleteNews, listAllNews, saveNews } from '../../services/db';
import type { NewsItem } from '../../types';

type Draft = { id?: string; title: string; summary: string; body: string; imageUrl: string; category: NewsItem['category'] };
const EMPTY: Draft = { title: '', summary: '', body: '', imageUrl: '', category: 'News' };
const CAT: Record<NewsItem['category'], string> = { News: 'Actualité', Event: 'Événement', Announcement: 'Annonce' };

const AdminContent = () => {
  const { data, error, reload } = useAdminData(listAllNews);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (draft.imageUrl && !/^https:\/\//.test(draft.imageUrl)) return setErr("L'image doit être une adresse https://");
    setSaving(true);
    setErr('');
    try {
      await saveNews(draft);
      setDraft(null);
      reload();
    } catch (e: any) {
      setErr(e?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminTitle title="Actualités" subtitle="Publiez les annonces, conférences et nouvelles de la DDR." action={!draft && <Button size="sm" onClick={() => setDraft({ ...EMPTY })}><Plus className="h-4 w-4" /> Nouvel article</Button>} />
      {draft && (
        <form onSubmit={save} className="card mb-8 space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div><label className="label" htmlFor="n-title">Titre *</label><input id="n-title" required maxLength={200} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="input" /></div>
            <div><label className="label" htmlFor="n-cat">Catégorie</label><select id="n-cat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as NewsItem['category'] })} className="input">{(Object.keys(CAT) as NewsItem['category'][]).map((k) => <option key={k} value={k} className="bg-night-900">{CAT[k]}</option>)}</select></div>
          </div>
          <div><label className="label" htmlFor="n-sum">Résumé (affiché dans la liste)</label><textarea id="n-sum" rows={2} maxLength={400} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} className="input" /></div>
          <div><label className="label" htmlFor="n-body">Texte complet</label><textarea id="n-body" rows={10} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="input font-mono text-sm" placeholder="Astuce : **gras**, - liste, > citation" /></div>
          <div><label className="label" htmlFor="n-img">Image (adresse https)</label><input id="n-img" value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} className="input" placeholder="https://…" /></div>
          {err && <Notice tone="error">{err}</Notice>}
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setDraft(null)}>Annuler</Button><Button type="submit" disabled={saving}>{saving ? 'Publication…' : draft.id ? 'Enregistrer' : 'Publier'}</Button></div>
        </form>
      )}
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {data && data.length === 0 && !draft && <Empty>Aucun article. Cliquez sur « Nouvel article » pour commencer.</Empty>}
      <div className="space-y-3">
        {(data || []).map((n) => (
          <article key={n.id} className="card flex items-center gap-4 p-4">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-night-800">{n.imageUrl && <img src={n.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-cream-50">{n.title}</p>
              <p className="text-xs text-sand-500">{CAT[n.category]} · {fmtDateTime(n.createdAt)}</p>
            </div>
            <button onClick={() => setDraft({ id: n.id, title: n.title, summary: n.content, body: n.body || '', imageUrl: n.imageUrl, category: n.category })} className="rounded-full p-2 text-sand-400 hover:bg-white/5 hover:text-white" aria-label="Modifier"><Pencil className="h-4 w-4" /></button>
            <button onClick={async () => { if (confirm('Supprimer cet article ?')) { await deleteNews(n.id).catch((e) => alert(e.message)); reload(); } }} className="rounded-full p-2 text-red-300 hover:bg-red-500/10" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
          </article>
        ))}
      </div>
    </>
  );
};

export default AdminContent;
