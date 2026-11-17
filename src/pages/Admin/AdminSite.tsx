import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { AdminTitle } from '../../components/AdminLayout';
import { Button, Notice } from '../../components/ui';
import { ImageField } from '../../components/forms';
import { DEFAULT_SITE, mergeSite, useSite, useSiteReload, type SiteContent, type SpeakerInfo } from '../../lib/site';
import { saveSiteContent, uploadMedia } from '../../services/db';

const Field = ({ id, label, value, onChange, placeholder, area = false }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; area?: boolean }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    {area ? (
      <textarea id={id} rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    ) : (
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    )}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="card space-y-4 p-6">
    <h2 className="font-serif text-xl font-semibold text-cream-50">{title}</h2>
    {children}
  </section>
);

/** L'administrateur modifie toutes les informations visibles sur le site. */
const AdminSite = () => {
  const current = useSite();
  const reload = useSiteReload();
  const [s, setS] = useState<SiteContent>(current);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [err, setErr] = useState('');
  useEffect(() => {
    setS(current);
  }, [current]);

  const set = (patch: Partial<SiteContent>) => {
    setS((x) => ({ ...x, ...patch }));
    setState('idle');
  };
  const setSpeaker = (i: number, patch: Partial<SpeakerInfo>) => set({ speakers: s.speakers.map((sp, k) => (k === i ? { ...sp, ...patch } : sp)) });
  const moveSpeaker = (i: number, d: number) => {
    const list = [...s.speakers];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set({ speakers: list });
  };

  const save = async () => {
    setErr('');
    setState('saving');
    try {
      const clean = mergeSite(s); // nettoie (liens https uniquement, etc.)
      await saveSiteContent(clean);
      setS(clean);
      reload();
      setState('saved');
    } catch (e: any) {
      setErr(e?.message || 'Enregistrement impossible.');
      setState('idle');
    }
  };

  return (
    <>
      <AdminTitle
        title="Contenu du site"
        subtitle="Coordonnées, réseaux, prêche et intervenants : tout ce que vous changez ici apparaît immédiatement sur le site."
        action={<Button onClick={save} disabled={state === 'saving'}>{state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}</Button>}
      />
      {state === 'saved' && <div className="mb-6"><Notice tone="success">Modifications enregistrées et publiées.</Notice></div>}
      {err && <div className="mb-6"><Notice tone="error">{err}</Notice></div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Coordonnées">
          {s.contact.phones.map((p, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1"><Field id={`ph${i}`} label={`Téléphone ${i + 1}`} value={p} onChange={(v) => set({ contact: { ...s.contact, phones: s.contact.phones.map((x, k) => (k === i ? v : x)) } })} /></div>
              <button type="button" onClick={() => set({ contact: { ...s.contact, phones: s.contact.phones.filter((_, k) => k !== i) } })} className="mb-1 rounded-full p-2.5 text-red-300 hover:bg-red-500/10" aria-label="Retirer ce numéro"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {s.contact.phones.length < 5 && (
            <button type="button" onClick={() => set({ contact: { ...s.contact, phones: [...s.contact.phones, ''] } })} className="flex items-center gap-1.5 text-sm font-bold text-brand-300"><Plus className="h-4 w-4" /> Ajouter un numéro</button>
          )}
          <Field id="wa" label="Numéro WhatsApp principal (chiffres, avec 225)" value={s.contact.whatsapp} onChange={(v) => set({ contact: { ...s.contact, whatsapp: v } })} placeholder="2250747320455" />
          <Field id="email" label="Email" value={s.contact.email} onChange={(v) => set({ contact: { ...s.contact, email: v } })} />
          <Field id="addr" label="Adresse du siège" value={s.contact.address} onChange={(v) => set({ contact: { ...s.contact, address: v } })} />
        </Section>

        <div className="space-y-6">
          <Section title="Réseaux sociaux (liens https)">
            <Field id="yt" label="YouTube" value={s.social.youtube} onChange={(v) => set({ social: { ...s.social, youtube: v } })} />
            <Field id="tt" label="TikTok" value={s.social.tiktok} onChange={(v) => set({ social: { ...s.social, tiktok: v } })} />
            <Field id="fb" label="Facebook" value={s.social.facebook} onChange={(v) => set({ social: { ...s.social, facebook: v } })} />
            <Field id="ig" label="Instagram (facultatif)" value={s.social.instagram} onChange={(v) => set({ social: { ...s.social, instagram: v } })} placeholder="https://www.instagram.com/…" />
          </Section>
          <Section title="Prêche hebdomadaire">
            <div className="grid grid-cols-2 gap-4">
              <Field id="pday" label="Jour" value={s.preche.day} onChange={(v) => set({ preche: { ...s.preche, day: v } })} />
              <Field id="ptime" label="Heure" value={s.preche.time} onChange={(v) => set({ preche: { ...s.preche, time: v } })} />
            </div>
            <Field id="pplace" label="Lieu" value={s.preche.place} onChange={(v) => set({ preche: { ...s.preche, place: v } })} />
            <Field id="pmap" label="Recherche Google Maps" value={s.preche.mapsQuery} onChange={(v) => set({ preche: { ...s.preche, mapsQuery: v } })} />
          </Section>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-cream-50">Intervenants</h2>
        <Button size="sm" variant="ghost" onClick={() => set({ speakers: [...s.speakers, { id: `s${Date.now()}`, name: 'Nouvel intervenant', role: '', bio: '', photoUrl: '' }] })}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {s.speakers.map((sp, i) => (
          <section key={sp.id} className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-cream-50">{sp.name || 'Sans nom'}</p>
              <div className="flex">
                <button type="button" disabled={i === 0} onClick={() => moveSpeaker(i, -1)} className="rounded-full p-2 text-sand-400 hover:bg-white/5 disabled:opacity-30" aria-label="Monter"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={i === s.speakers.length - 1} onClick={() => moveSpeaker(i, 1)} className="rounded-full p-2 text-sand-400 hover:bg-white/5 disabled:opacity-30" aria-label="Descendre"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => confirm(`Retirer ${sp.name} ?`) && set({ speakers: s.speakers.filter((_, k) => k !== i) })} className="rounded-full p-2 text-red-300 hover:bg-red-500/10" aria-label="Retirer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <ImageField id={`photo-${sp.id}`} label="Photo officielle" value={sp.photoUrl} onChange={(url) => setSpeaker(i, { photoUrl: url })} upload={(f) => uploadMedia(f, 'speakers')} round />
            <Field id={`n-${sp.id}`} label="Nom" value={sp.name} onChange={(v) => setSpeaker(i, { name: v })} />
            <Field id={`r-${sp.id}`} label="Rôle" value={sp.role} onChange={(v) => setSpeaker(i, { role: v })} />
            <Field id={`b-${sp.id}`} label="Présentation" value={sp.bio} onChange={(v) => setSpeaker(i, { bio: v })} area />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={`w-${sp.id}`} label="WhatsApp (chiffres)" value={sp.whatsapp || ''} onChange={(v) => setSpeaker(i, { whatsapp: v })} />
              <Field id={`f-${sp.id}`} label="Facebook" value={sp.facebook || ''} onChange={(v) => setSpeaker(i, { facebook: v })} />
              <Field id={`y-${sp.id}`} label="YouTube" value={sp.youtube || ''} onChange={(v) => setSpeaker(i, { youtube: v })} />
              <Field id={`t-${sp.id}`} label="TikTok" value={sp.tiktok || ''} onChange={(v) => setSpeaker(i, { tiktok: v })} />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={() => confirm('Revenir aux informations par défaut ? (pensez à enregistrer)') && set(DEFAULT_SITE)}>Revenir aux valeurs par défaut</Button>
        <Button onClick={save} disabled={state === 'saving'}>{state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </div>
    </>
  );
};

export default AdminSite;
