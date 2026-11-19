// Logique et bulles partagées par la page /chat et l'assistant flottant.
import React, { useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { askCompanion, type ChatTurn } from '../services/geminiService';
import { trackEvent } from '../lib/analytics';

export const WELCOME: ChatTurn = {
  role: 'model',
  text: "**Assalamou alaykoum !** Je suis le Compagnon DDR. Posez-moi vos questions sur l’Islam, le Coran, Jésus (Issa) dans l’Islam, ou sur la DDR. Je réponds avec douceur et en citant mes sources.",
};

export function useCompanion() {
  const [messages, setMessagesState] = useState<ChatTurn[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const current = useRef<ChatTurn[]>([WELCOME]);
  const setMessages = useCallback((next: ChatTurn[]) => {
    current.current = next;
    setMessagesState(next);
  }, []);

  const send = useCallback(async (text: string) => {
    const q = text.trim().slice(0, 1500);
    if (!q || busy.current) return;
    busy.current = true;
    setLoading(true);
    const history: ChatTurn[] = [...current.current, { role: 'user', text: q }];
    setMessages(history);
    try {
      trackEvent('compagnon_question');
      const { text: answer } = await askCompanion(history.filter((m) => m !== WELCOME));
      setMessages([...current.current, { role: 'model', text: answer }]);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [setMessages]);

  const reset = useCallback(() => setMessages([WELCOME]), [setMessages]);
  const push = useCallback((m: ChatTurn) => setMessages([...current.current, m]), [setMessages]);
  return { messages, loading, send, reset, push };
}

export const Bubble = ({ m, compact = false }: { m: ChatTurn; compact?: boolean }) => (
  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`${compact ? 'max-w-[88%] px-3.5 py-2.5 text-sm' : 'max-w-[90%] px-5 py-4 text-[15px] md:max-w-[75%]'} rounded-3xl leading-relaxed ${
        m.role === 'user' ? 'rounded-br-lg bg-brand-600 text-white' : 'prose-ddr rounded-bl-lg border border-ink-900/10 bg-ivory-200 text-ink-800'
      }`}
    >
      {m.role === 'user' ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
    </div>
  </div>
);

export const Typing = () => (
  <div className="flex justify-start" aria-label="Le Compagnon écrit">
    <div className="flex gap-1.5 rounded-3xl rounded-bl-lg border border-ink-900/10 bg-ivory-200 px-5 py-4">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  </div>
);
