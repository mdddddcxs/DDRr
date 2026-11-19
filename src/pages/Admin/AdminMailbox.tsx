import React, { useMemo, useState } from 'react';
import { downloadCsv, dateStamp } from '../../lib/csv';
import { Archive, ArchiveRestore, Download, Eye, EyeOff, Mic, Phone, Play, Trash2, Type } from 'lucide-react';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { deleteMessage, getAudioUrl, keepMessage, listMessages, markMessageRead, publishMessage } from '../../services/db';
import type { InboxMessage } from '../../types';

const daysLeft = (t: number) => Math.max(0, Math.ceil((t - Date.now()) / 864e5));
type Filter = 'tous' | 'nonlus' | 'texte' | 'audio' | 'publies' | 'conserves';
const FILTERS: [Filter, string][] = [
  ['tous', 'Tous'], ['nonlus', 'Non lus'], ['texte', 'Écrits'], ['audio', 'Vocaux'], ['publies', 'Publiés'], ['conserves', 'Conservés'],
];

const AdminMailbox = () => {
  const { data, error, setData } = useAdminData(listMessages);
  const [audio, setAudio] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>('tous');
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(() => {
    const all = data || [];
    return all.filter((m) =>
      filter === 'nonlus' ? !m.isRead : filter === 'texte' ? m.type === 'text' : filter === 'audio' ? m.type === 'audio' : filter === 'publies' ? m.published : filter === 'conserves' ? m.expiresAt === Infinity : true,
    );
  }, [data, filter]);
  const count = (f: Filter) => (f === 'tous' ? data?.length || 0 : (data || []).filter((m) => (f === 'nonlus' ? !m.isRead : f === 'texte' ? m.type === 'text' : f === 'audio' ? m.type === 'audio' : f === 'publies' ? m.published : m.expiresAt === Infinity)).length);

  const patch = (id: string, p: Partial<InboxMessage>) => setData((data || []).map((x) => (x.id === id ? { ...x, ...p } : x)));

  const open = async (m: InboxMessage) => {
    if (!m.isRead) {
      markMessageRead(m.id).catch(() => {});
      patch(m.id, { isRead: true });
    }
    if (m.type === 'audio' && !audio[m.id]) {
      try {
        const url = await getAudioUrl(m.content);
        setAudio((a) => ({ ...a, [m.id]: url }));
      } catch {
        alert("Impossible de charger l'audio. Le fichier a peut-être expiré.");
      }
    }
  };
  const run = async (m: InboxMessage, fn: () => Promise<void>, p: Partial<InboxMessage>) => {
    setBusy(m.id);
    try {
      await fn();
      patch(m.id, p);
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    } finally {
      setBusy(null);
    }
  };
  const remove = async (m: InboxMessage) => {
    if (!confirm(`Supprimer définitivement le témoignage de ${m.senderName} ? Cette action est irréversible.`)) return;
    try {
      await deleteMessage(m);
      setData((data || []).filter((x) => x.id !== m.id));
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    }
  };

  return (
    <>
      <AdminTitle
        title="Témoignages"
        subtitle="Écrits et messages vocaux envoyés depuis le site. Ils sont gardés 30 jours : conservez ou publiez ceux que vous voulez garder."
        action={<button onClick={() => downloadCsv(`temoignages-ddr-${dateStamp()}.csv`, [['Reçu le', 'Nom', 'Ville', 'Téléphone', 'Type', 'Texte', 'Publication acceptée', 'Publié'], ...(data || []).map((m) => [new Date(m.receivedAt).toLocaleString('fr-FR'), m.senderName, m.city || '', m.senderPhone || '', m.type === 'audio' ? `Vocal ${m.audioDuration || ''}` : 'Écrit', m.type === 'text' ? m.content : '(message vocal)', m.consentPublish ? 'oui' : 'non', m.published ? 'oui' : 'non'])])} disabled={!data?.length} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"><Download className="h-4 w-4" /> Excel</button>}
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {FILTERS.map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${filter === f ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 ring-1 ring-ink-900/10 hover:ring-ink-900/30'}`}>
            {label} <span className="ml-1 opacity-60">{count(f)}</span>
          </button>
        ))}
      </div>

      {data && list.length === 0 && <Empty>{data.length === 0 ? 'Aucun témoignage pour le moment. Ceux envoyés depuis la page Témoignages apparaîtront ici.' : 'Aucun témoignage dans ce filtre.'}</Empty>}

      <div className="space-y-4">
        {list.map((m) => {
          const kept = m.expiresAt === Infinity;
          return (
            <article key={m.id} onClick={() => open(m)} className={`card cursor-pointer p-5 transition ${m.isRead ? '' : 'ring-2 ring-[#E39AB4]'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-bold text-ink-900">
                    {!m.isRead && <span className="h-2 w-2 rounded-full bg-[#A9567A]" />}
                    {m.senderName}
                    {m.city && <span className="text-sm font-normal text-ink-500">· {m.city}</span>}
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/5 px-2 py-0.5 text-xs font-semibold text-ink-500">
                      {m.type === 'audio' ? <><Mic className="h-3 w-3" /> Vocal {m.audioDuration}</> : <><Type className="h-3 w-3" /> Écrit</>}
                    </span>
                    {m.published && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Publié</span>}
                    {kept && !m.published && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">Conservé</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    Reçu {fmtDateTime(m.receivedAt)} · {kept ? 'conservé sans limite' : `supprimé dans ${daysLeft(m.expiresAt)} j`} · {m.consentPublish ? 'accepte la publication' : 'n’a pas autorisé la publication'}
                  </p>
                </div>
                {m.senderPhone && (
                  <a onClick={(e) => e.stopPropagation()} href={`tel:${m.senderPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 rounded-full bg-ink-900/5 px-4 py-2 font-mono text-sm hover:bg-ink-900/10">
                    <Phone className="h-4 w-4" /> {m.senderPhone}
                  </a>
                )}
              </div>

              {m.type === 'text' ? (
                <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#FBEAF1]/60 p-4 text-[15px] leading-relaxed text-ink-800">{m.content}</p>
              ) : audio[m.id] ? (
                <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <audio controls src={audio[m.id]} className="min-w-0 flex-1" />
                  <a href={audio[m.id]} download className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-3 py-2 text-sm font-bold text-ink-700 hover:bg-ink-900/10"><Download className="h-4 w-4" /> Télécharger</a>
                </div>
              ) : (
                <p className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FBEAF1]/60 p-4 text-sm font-semibold text-[#843E5E]"><Play className="h-4 w-4" /> Touchez pour écouter le message vocal</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {m.consentPublish && !m.published && (
                  <>
                    <input
                      value={names[m.id] ?? (m.displayName || m.senderName.split(' ')[0])}
                      onChange={(e) => setNames({ ...names, [m.id]: e.target.value.slice(0, 60) })}
                      aria-label="Nom affiché publiquement"
                      className="w-40 rounded-full border border-ink-900/15 bg-white px-3 py-2 text-sm"
                    />
                    <button disabled={busy === m.id} onClick={() => run(m, () => publishMessage(m.id, true, names[m.id] ?? m.senderName.split(' ')[0]), { published: true, expiresAt: Infinity })} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                      <Eye className="h-4 w-4" /> Publier sur le site
                    </button>
                  </>
                )}
                {m.published && (
                  <button disabled={busy === m.id} onClick={() => run(m, () => publishMessage(m.id, false), { published: false })} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-4 py-2 text-sm font-bold text-ink-700 disabled:opacity-50">
                    <EyeOff className="h-4 w-4" /> Retirer du site
                  </button>
                )}
                {!m.published && (
                  <button disabled={busy === m.id} onClick={() => run(m, () => keepMessage(m.id, !kept), { expiresAt: kept ? Date.now() + 30 * 864e5 : Infinity })} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-4 py-2 text-sm font-bold text-ink-700 disabled:opacity-50">
                    {kept ? <><ArchiveRestore className="h-4 w-4" /> Ne plus conserver</> : <><Archive className="h-4 w-4" /> Conserver</>}
                  </button>
                )}
                <button onClick={() => remove(m)} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-500/10" aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};

export default AdminMailbox;
