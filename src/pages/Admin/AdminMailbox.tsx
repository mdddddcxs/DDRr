import React, { useState } from 'react';
import { Mic, Phone, Play, Trash2 } from 'lucide-react';
import { AdminTitle, Empty, fmtDateTime, useAdminData } from '../../components/AdminLayout';
import { deleteMessage, getAudioUrl, listMessages, markMessageRead } from '../../services/db';
import type { InboxMessage } from '../../types';

const daysLeft = (t: number) => Math.max(0, Math.ceil((t - Date.now()) / 864e5));

const AdminMailbox = () => {
  const { data, error, setData } = useAdminData(listMessages);
  const [audio, setAudio] = useState<Record<string, string>>({});

  const open = async (m: InboxMessage) => {
    if (!m.isRead) {
      markMessageRead(m.id).catch(() => {});
      setData((data || []).map((x) => (x.id === m.id ? { ...x, isRead: true } : x)));
    }
    if (m.type === 'audio' && !audio[m.id]) {
      try {
        const url = await getAudioUrl(m.content);
        setAudio((a) => ({ ...a, [m.id]: url }));
      } catch {
        alert("Impossible de charger l'audio.");
      }
    }
  };
  const remove = async (m: InboxMessage) => {
    if (!confirm(`Supprimer le message de ${m.senderName} ?`)) return;
    try {
      await deleteMessage(m);
      setData((data || []).filter((x) => x.id !== m.id));
    } catch (e: any) {
      alert(e?.message || 'Erreur');
    }
  };

  return (
    <>
      <AdminTitle title="Témoignages & messages" subtitle="Les messages sont supprimés automatiquement après 7 jours. Rappelez les personnes avant !" />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {data && data.length === 0 && <Empty>Boîte vide. Les témoignages envoyés depuis le site apparaîtront ici.</Empty>}
      <div className="space-y-4">
        {(data || []).map((m) => (
          <article key={m.id} onClick={() => open(m)} className={`card cursor-pointer p-5 ${m.isRead ? '' : 'border-brand-500/40'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-cream-50">
                  {!m.isRead && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-500" />}
                  {m.senderName}
                  {m.type === 'audio' && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-sand-400"><Mic className="h-3 w-3" /> {m.audioDuration}</span>}
                </p>
                <p className="text-xs text-sand-500">Reçu {fmtDateTime(m.receivedAt)} · supprimé dans {daysLeft(m.expiresAt)} j</p>
              </div>
              <div className="flex items-center gap-2">
                {m.senderPhone && <a onClick={(e) => e.stopPropagation()} href={`tel:${m.senderPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 font-mono text-sm hover:bg-white/10"><Phone className="h-4 w-4" /> {m.senderPhone}</a>}
                <button onClick={(e) => { e.stopPropagation(); remove(m); }} className="rounded-full p-2 text-red-300 hover:bg-red-500/10" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {m.type === 'text' ? (
              <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/20 p-4 text-sm leading-relaxed text-cream-200">{m.content}</p>
            ) : audio[m.id] ? (
              <audio controls src={audio[m.id]} className="mt-4 w-full" onClick={(e) => e.stopPropagation()} />
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm text-brand-300"><Play className="h-4 w-4" /> Cliquez pour écouter le message vocal</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
};

export default AdminMailbox;
