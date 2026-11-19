// Pilotage du site : bandeau d'annonce, direct, événements de l'agenda, sections de l'accueil, maintenance.
import React, { useEffect, useState } from 'react';
import { CalendarPlus, ExternalLink, Megaphone, Radio, ToggleLeft, Trash2, Wrench } from 'lucide-react';
import { AdminTitle } from '../../components/AdminLayout';
import { Button, Notice } from '../../components/ui';
import { mergeSite, useSite, useSiteReload, type HomeSections, type SiteContent, type SiteEvent } from '../../lib/site';
import { getMaintenance, saveSiteContent, setMaintenance } from '../../services/db';

const Field = ({ id, label, value, onChange, placeholder, type = 'text', area = false }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; area?: boolean }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    {area ? (
      <textarea id={id} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    ) : (
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    )}
  </div>
);

const Switch = ({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) => (
  <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-ivory-100 p-4 text-left transition hover:bg-ivory-200">
    <span>
      <span className="block font-bold text-ink-900">{label}</span>
      {hint && <span className="block text-sm text-ink-500">{hint}</span>}
    </span>
    <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-emerald-600' : 'bg-ink-400/40'}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </span>
  </button>
);

const Card = ({ icon: Icon, title, hint, children }: { icon: React.ComponentType<{ className?: string }>; title: string; hint?: string; children: React.ReactNode }) => (
  <section className="card space-y-4 p-6">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon className="h-5 w-5" /></span>
      <div>
        <h2 className="font-serif text-xl font-semibold text-ink-900">{title}</h2>
        {hint && <p className="text-sm text-ink-500">{hint}</p>}
      </div>
    </div>
    {children}
  </section>
);

const SECTION_LABELS: Record<keyof HomeSections, string> = {
  rappel: 'Prochain rappel du jeudi',
  realisations: 'Réalisations sur le terrain',
  videos: 'Derniers directs & débats',
  intervenants: 'Les voix de la DDR',
  priere: 'Horaires de prière',
  campagne: 'Projet à soutenir (campagne)',
  actualites: 'Dernières actualités',
};

const AdminPilotage = () => {
  const current = useSite();
  const reload = useSiteReload();
  const [s, setS] = useState<SiteContent>(current);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [err, setErr] = useState('');
  const [maint, setMaint] = useState<boolean | null>(null);
  useEffect(() => setS(current), [current]);
  useEffect(() => {
    getMaintenance().then(setMaint).catch(() => setMaint(false));
  }, []);

  const set = (patch: Partial<SiteContent>) => {
    setS((x) => ({ ...x, ...patch }));
    setState('idle');
  };
  const setEvent = (i: number, patch: Partial<SiteEvent>) => set({ events: s.events.map((e, k) => (k === i ? { ...e, ...patch } : e)) });

  const save = async () => {
    setErr('');
    const incomplete = s.events.find((e) => !e.title.trim() || !e.date);
    if (incomplete) return setErr('Chaque événement doit avoir un titre et une date.');
    setState('saving');
    try {
      const clean = mergeSite(s);
      await saveSiteContent(clean);
      setS(clean);
      reload();
      setState('saved');
    } catch (e: any) {
      setErr(e?.message || 'Enregistrement impossible.');
      setState('idle');
    }
  };
  const toggleMaintenance = async () => {
    if (maint === null) return;
    if (!maint && !confirm('Mettre le site en maintenance ? Les visiteurs verront une page d’attente (l’administration reste accessible).')) return;
    try {
      await setMaintenance(!maint);
      setMaint(!maint);
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    }
  };

  return (
    <>
      <AdminTitle title="Pilotage du site" subtitle="Annonces, direct, agenda et affichage de l’accueil. Les changements apparaissent dès que vous enregistrez." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={Megaphone} title="Bandeau d’annonce" hint="Un message en haut de toutes les pages (Ramadan, collecte, conférence…).">
          <Switch on={s.banner.on} onChange={(on) => set({ banner: { ...s.banner, on } })} label={s.banner.on ? 'Bandeau affiché' : 'Bandeau masqué'} />
          <Field id="b-text" label="Message (200 caractères max.)" value={s.banner.text} onChange={(text) => set({ banner: { ...s.banner, text: text.slice(0, 200) } })} placeholder="Ex. : Grande conférence ce samedi à Abobo !" />
          <Field id="b-link" label="Lien (facultatif) : une page du site (/agenda) ou un lien https" value={s.banner.link} onChange={(link) => set({ banner: { ...s.banner, link } })} placeholder="/agenda" />
          <div>
            <p className="label">Couleur</p>
            <div className="flex gap-2">
              {([['or', 'Or', 'bg-gold-300'], ['vert', 'Vert', 'bg-emerald-600'], ['bleu', 'Bleu nuit', 'bg-ink-900'], ['rouge', 'Rouge', 'bg-red-600']] as const).map(([k, label, bg]) => (
                <button key={k} type="button" onClick={() => set({ banner: { ...s.banner, tone: k } })} aria-pressed={s.banner.tone === k} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${s.banner.tone === k ? 'ring-2 ring-ink-900' : 'ring-1 ring-ink-900/10'}`}>
                  <span className={`h-4 w-4 rounded-full ${bg}`} /> {label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card icon={Radio} title="Direct en cours" hint="Le site détecte les directs YouTube tout seul. Activez ceci pour annoncer un direct ailleurs (Facebook, TikTok…).">
          <Switch on={s.live.on} onChange={(on) => set({ live: { ...s.live, on } })} label={s.live.on ? 'Bandeau « En direct » affiché' : 'Pas de direct annoncé'} hint="Pensez à le désactiver à la fin du direct." />
          <Field id="l-title" label="Titre du direct" value={s.live.title} onChange={(title) => set({ live: { ...s.live, title } })} placeholder="Rappel du jeudi à Yopougon" />
          <Field id="l-url" label="Lien du direct (https)" value={s.live.url} onChange={(url) => set({ live: { ...s.live, url } })} placeholder="https://www.facebook.com/…" />
          {s.live.url && <a href={s.live.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700">Tester le lien <ExternalLink className="h-4 w-4" /></a>}
        </Card>

        <Card icon={ToggleLeft} title="Sections de l’accueil" hint="Masquez une section le temps de la mettre à jour, sans rien supprimer.">
          <div className="grid gap-2">
            {(Object.keys(SECTION_LABELS) as (keyof HomeSections)[]).map((k) => (
              <Switch key={k} on={s.sections[k]} onChange={(v) => set({ sections: { ...s.sections, [k]: v } })} label={SECTION_LABELS[k]} />
            ))}
          </div>
        </Card>

        <Card icon={Wrench} title="Maintenance" hint="Affiche une page d’attente aux visiteurs pendant une intervention.">
          <Switch on={!!maint} onChange={toggleMaintenance} label={maint === null ? 'Chargement…' : maint ? 'Site en maintenance' : 'Site en ligne'} hint="Ce réglage s’applique tout de suite, sans enregistrer." />
        </Card>
      </div>

      <section className="card mt-6 space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><CalendarPlus className="h-5 w-5" /></span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-ink-900">Événements de l’agenda</h2>
              <p className="text-sm text-ink-500">Conférences, tournées, journées spéciales. Ils s’affichent dans l’Agenda et disparaissent une fois la date passée.</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => set({ events: [...s.events, { id: `e${Date.now()}`, title: '', date: new Date().toISOString().slice(0, 10), time: '', place: '', text: '', link: '' }] })}>
            <CalendarPlus className="h-4 w-4" /> Ajouter un événement
          </Button>
        </div>
        {s.events.length === 0 && <p className="rounded-2xl bg-ivory-100 p-5 text-center text-sm text-ink-500">Aucun événement. Le rappel hebdomadaire du jeudi s’affiche toujours, il se règle dans « Contenu du site ».</p>}
        <div className="grid gap-4 lg:grid-cols-2">
          {s.events.map((e, i) => (
            <div key={e.id} className="space-y-3 rounded-2xl border border-ink-900/10 p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ink-900">{e.title || 'Nouvel événement'}</p>
                <button type="button" onClick={() => confirm('Supprimer cet événement ?') && set({ events: s.events.filter((_, k) => k !== i) })} className="rounded-full p-2 text-red-600 hover:bg-red-500/10" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </div>
              <Field id={`et-${e.id}`} label="Titre *" value={e.title} onChange={(title) => setEvent(i, { title })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id={`ed-${e.id}`} label="Date *" type="date" value={e.date} onChange={(date) => setEvent(i, { date })} />
                <Field id={`eh-${e.id}`} label="Heure" value={e.time} onChange={(time) => setEvent(i, { time })} placeholder="16 h – 18 h" />
              </div>
              <Field id={`ep-${e.id}`} label="Lieu" value={e.place} onChange={(place) => setEvent(i, { place })} placeholder="Abobo, place de la mairie" />
              <Field id={`ex-${e.id}`} label="Description" value={e.text} onChange={(text) => setEvent(i, { text })} area />
              <Field id={`el-${e.id}`} label="Lien (facultatif)" value={e.link} onChange={(link) => setEvent(i, { link })} placeholder="https://… ou /news" />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-ink-900/10 backdrop-blur">
        {err && <Notice tone="error">{err}</Notice>}
        {state === 'saved' && <Notice tone="success">Enregistré : c’est en ligne.</Notice>}
        <Button onClick={save} disabled={state === 'saving'}>{state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </div>
    </>
  );
};

export default AdminPilotage;
