// Le Compagnon DDR côté navigateur.
// Aucune clé ici : le texte passe par /api/chat, la voix par un jeton temporaire de /api/live-token.
// Si le serveur IA n'est pas disponible, on répond avec la base de connaissances locale.
import { searchKnowledgeBaseLocal } from './localSearchService';

export type ChatTurn = { role: 'user' | 'model'; text: string };

async function localAnswer(question: string): Promise<string> {
  const results = await searchKnowledgeBaseLocal(question);
  if (!results.length) {
    return "Je n'ai pas trouvé de réponse précise dans ma base de connaissances.\n\nVenez poser votre question en direct lors du **prêche du jeudi à 16h, place Ficgayo (Yopougon)**, ou écrivez-nous depuis la page **Contact & RDV**.";
  }
  const [best, ...others] = results;
  let text = `**${best.question}**\n\n${best.answer}`;
  if (others.length) text += '\n\n**Sujets liés :**\n' + others.slice(0, 3).map((r) => `- ${r.question}`).join('\n');
  return text;
}

/** Pose une question au Compagnon (avec l'historique de la conversation). */
export async function askCompanion(history: ChatTurn[]): Promise<{ text: string; source: 'ai' | 'local' }> {
  const last = history[history.length - 1]?.text || '';
  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && typeof data.text === 'string') return { text: data.text, source: 'ai' };
    if (r.status === 429 && data.message) return { text: data.message, source: 'local' };
  } catch {
    /* hors ligne ou API absente : on bascule en local */
  }
  return { text: await localAnswer(last), source: 'local' };
}

/**
 * Discussion vocale en direct (Gemini Live) avec un jeton temporaire.
 * Le SDK n'est chargé qu'au moment où l'utilisateur lance la voix.
 */
export class LiveClient {
  private session: any = null;
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private playing: AudioBufferSourceNode[] = [];

  constructor(
    private onModelText: (text: string) => void,
    private onUserText?: (text: string) => void,
  ) {}

  async connect() {
    const r = await fetch('/api/live-token', { method: 'POST' });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.token) {
      throw new Error(data.message || "La discussion vocale n'est pas disponible pour le moment. Utilisez le chat écrit.");
    }

    const { GoogleGenAI, Modality } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: data.token, httpOptions: { apiVersion: 'v1beta' } });

    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    this.inputCtx = new Ctx({ sampleRate: 16000 });
    this.outputCtx = new Ctx({ sampleRate: 24000 });
    this.nextStartTime = 0;

    let modelBuffer = '';
    this.session = await ai.live.connect({
      model: data.model,
      config: { responseModalities: [Modality.AUDIO] },
      callbacks: {
        onopen: () => {},
        onmessage: (message: any) => {
          const sc = message.serverContent;
          const audio = sc?.modelTurn?.parts?.find((p: any) => p.inlineData?.data)?.inlineData?.data;
          if (audio) this.playAudio(audio);
          if (sc?.outputTranscription?.text) modelBuffer += sc.outputTranscription.text;
          if (sc?.inputTranscription?.text && this.onUserText) this.onUserText(sc.inputTranscription.text);
          if (sc?.interrupted) this.stopPlayback();
          if (sc?.turnComplete && modelBuffer.trim()) {
            this.onModelText(modelBuffer.trim());
            modelBuffer = '';
          }
        },
        onerror: (e: any) => console.error('[voix]', e),
        onclose: () => {},
      },
    });
    await this.startMicrophone();
  }

  private async startMicrophone() {
    if (!this.inputCtx) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      this.disconnect();
      throw new Error("Impossible d'accéder au micro. Autorisez le micro dans votre navigateur.");
    }
    if (this.inputCtx.state === 'suspended') await this.inputCtx.resume();
    this.source = this.inputCtx.createMediaStreamSource(this.stream);
    this.processor = this.inputCtx.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioprocess = (e) => {
      if (!this.session) return;
      const pcm = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
      this.session.sendRealtimeInput({ audio: { mimeType: 'audio/pcm;rate=16000', data: toBase64(pcm.buffer) } });
    };
    this.source.connect(this.processor);
    this.processor.connect(this.inputCtx.destination);
  }

  private playAudio(b64: string) {
    const ctx = this.outputCtx;
    if (!ctx) return;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
    const buf = ctx.createBuffer(1, pcm.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 32768;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    this.nextStartTime = Math.max(this.nextStartTime, ctx.currentTime + 0.05);
    src.start(this.nextStartTime);
    this.nextStartTime += buf.duration;
    this.playing.push(src);
    src.onended = () => (this.playing = this.playing.filter((s) => s !== src));
  }

  private stopPlayback() {
    this.playing.forEach((s) => {
      try { s.stop(); } catch { /* déjà arrêté */ }
    });
    this.playing = [];
    this.nextStartTime = 0;
  }

  disconnect() {
    try { this.session?.close(); } catch { /* ignore */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source?.disconnect();
    this.processor?.disconnect();
    this.stopPlayback();
    this.inputCtx?.close().catch(() => {});
    this.outputCtx?.close().catch(() => {});
    this.session = this.stream = this.source = this.processor = this.inputCtx = this.outputCtx = null;
  }
}

function floatTo16BitPCM(input: Float32Array) {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
