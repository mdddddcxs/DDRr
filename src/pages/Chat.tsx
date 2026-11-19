import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Send } from 'lucide-react';
import { Bubble, Typing, useCompanion } from '../components/Companion';
import { LogoMark } from '../components/Logo';

const STARTERS = [
  'Qui est Allah ?',
  'Que dit le Coran sur Jésus (Issa) ?',
  'Quels sont les 5 piliers de l’Islam ?',
  'Comment devenir musulman ?',
  'Pourquoi le mal existe-t-il ?',
  'Quand a lieu le prêche de la DDR ?',
];

const ChatPage = () => {
  const { messages, loading, send, reset } = useCompanion();
  const [input, setInput] = useState('');
  const [params, setParams] = useSearchParams();
  const endRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  // Question venue de la page d'accueil (?q=...)
  useEffect(() => {
    const q = params.get('q');
    if (q && !asked.current) {
      asked.current = true;
      send(q);
      setParams({}, { replace: true });
    }
  }, [params, send, setParams]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
    setInput('');
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-76px)] max-w-4xl flex-col px-3 sm:px-6">
      <header className="flex items-center justify-between gap-3 border-b border-white/5 py-4">
        <div className="flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <div>
            <h1 className="font-serif text-xl font-semibold text-cream-50">Le Compagnon DDR</h1>
            <p className="flex items-center gap-1.5 text-xs text-sand-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Répond avec douceur, en citant ses sources
            </p>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-sand-400 hover:bg-white/5 hover:text-white">
          <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Nouvelle discussion</span>
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto py-6" aria-live="polite">
        {messages.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
        {loading && <Typing />}
        {messages.length === 1 && !loading && (
          <div className="grid gap-2 pt-2 sm:grid-cols-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className="card card-hover px-4 py-3 text-left text-sm text-cream-200">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="sticky bottom-0 pb-4 pt-2">
        <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-night-900 p-2 shadow-2xl focus-within:border-brand-500/60">
          <label htmlFor="chat-input" className="sr-only">Votre question</label>
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            maxLength={1500}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
            placeholder="Écrivez votre question…"
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-base text-cream-50 placeholder:text-sand-500 focus:outline-none"
          />
          <button disabled={loading || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-40" aria-label="Envoyer">
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-sand-500">Le Compagnon peut se tromper. Pour une question importante, demandez conseil à un imam.</p>
      </form>
    </div>
  );
};

export default ChatPage;
