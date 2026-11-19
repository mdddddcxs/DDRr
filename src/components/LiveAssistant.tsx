import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, MessageCircleHeart, Mic, MicOff, Send, X } from 'lucide-react';
import { Bubble, Typing, useCompanion } from './Companion';
import { LiveClient } from '../services/geminiService';
import { LogoMark } from './Logo';

/** Assistant flottant (bas à gauche) : chat écrit + discussion vocale. */
const LiveAssistant = () => {
  const [open, setOpen] = useState(false);
  const { messages, loading, send, push } = useCompanion();
  const [input, setInput] = useState('');
  const [voice, setVoice] = useState<'off' | 'connecting' | 'on'>('off');
  const [error, setError] = useState('');
  const client = useRef<LiveClient | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, loading, open]);
  useEffect(() => () => client.current?.disconnect(), []);
  useEffect(() => {
    if (!open && client.current) {
      client.current.disconnect();
      client.current = null;
      setVoice('off');
    }
  }, [open]);

  const toggleVoice = async () => {
    setError('');
    if (voice !== 'off') {
      client.current?.disconnect();
      client.current = null;
      setVoice('off');
      return;
    }
    setVoice('connecting');
    try {
      const c = new LiveClient(
        (text) => push({ role: 'model', text }),
        (text) => text.trim() && push({ role: 'user', text: text.trim() }),
      );
      await c.connect();
      client.current = c;
      setVoice('on');
    } catch (e) {
      setVoice('off');
      setError(e instanceof Error ? e.message : 'La voix n’est pas disponible.');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-4 z-40 flex items-center gap-2 rounded-full bg-brand-600 py-2 pl-2 pr-4 text-sm font-bold text-white shadow-[0_15px_40px_-10px_rgba(234,88,12,0.8)] transition hover:bg-brand-500"
        aria-label="Ouvrir le Compagnon DDR"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900/15">
          <MessageCircleHeart className="h-5 w-5" />
        </span>
        <span className="hidden sm:inline">Une question ?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-4 z-50 flex h-[min(560px,calc(100dvh-6rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-ink-900/10 bg-ivory-50/95 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl animate-fade-up" role="dialog" aria-label="Compagnon DDR">
      <header className="flex items-center justify-between border-b border-ink-900/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <div>
            <p className="font-bold leading-tight text-ink-900">Compagnon DDR</p>
            <p className="text-[11px] text-ink-500">{voice === 'on' ? '🎙️ Je vous écoute…' : 'Posez votre question'}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Link to="/chat" onClick={() => setOpen(false)} className="rounded-full p-2 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900" aria-label="Ouvrir en plein écran">
            <Maximize2 className="h-4 w-4" />
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <Bubble key={i} m={m} compact />
        ))}
        {loading && <Typing />}
        <div ref={endRef} />
      </div>

      {error && <p className="mx-4 mb-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-700">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput('');
        }}
        className="flex items-center gap-2 border-t border-ink-900/5 p-3"
      >
        <button
          type="button"
          onClick={toggleVoice}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${voice === 'on' ? 'bg-red-600 text-white animate-pulse-ring' : 'bg-ink-900/5 text-ink-700 hover:bg-ink-900/10'}`}
          aria-label={voice === 'on' ? 'Arrêter la voix' : 'Parler au Compagnon'}
          disabled={voice === 'connecting'}
        >
          {voice === 'connecting' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : voice === 'on' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <label htmlFor="la-input" className="sr-only">Votre question</label>
        <input id="la-input" value={input} maxLength={1500} onChange={(e) => setInput(e.target.value)} placeholder="Écrivez ici…" className="input !rounded-full !py-2.5" />
        <button disabled={loading || !input.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white disabled:opacity-40" aria-label="Envoyer">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default LiveAssistant;
