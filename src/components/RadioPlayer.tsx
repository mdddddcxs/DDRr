
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ListMusic, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';

interface Station {
    id: string;
    name: string;
    frequency: string;
    type: 'Coran';
    url: string;
    image?: string;
    description: string;
}

// Liste des Sourates (MP3 Fiables - Serveur MP3Quran)
const STATIONS: Station[] = [
    { 
        id: 's001', 
        name: 'Sourate Al-Fatiha', 
        frequency: 'Ch. 001', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/001.mp3', 
        description: 'L\'Ouverture (Mishary Alafasy)'
    },
    { 
        id: 's036', 
        name: 'Sourate Ya-Sin', 
        frequency: 'Ch. 036', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/036.mp3', 
        description: 'Le Cœur du Coran'
    },
    { 
        id: 's055', 
        name: 'Sourate Ar-Rahman', 
        frequency: 'Ch. 055', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/055.mp3', 
        description: 'Le Tout Miséricordieux'
    },
    { 
        id: 's067', 
        name: 'Sourate Al-Mulk', 
        frequency: 'Ch. 067', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/067.mp3', 
        description: 'La Royauté (Protection)'
    },
    { 
        id: 's112', 
        name: 'Sourate Al-Ikhlas', 
        frequency: 'Ch. 112', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/112.mp3', 
        description: 'Le Monothéisme Pur'
    },
    { 
        id: 's113', 
        name: 'Sourate Al-Falaq', 
        frequency: 'Ch. 113', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/113.mp3', 
        description: 'L\'Aube Naissante'
    },
    { 
        id: 's114', 
        name: 'Sourate An-Nas', 
        frequency: 'Ch. 114', 
        type: 'Coran',
        url: 'https://server8.mp3quran.net/afs/114.mp3', 
        description: 'Les Hommes'
    }
];

/** Lecteur Coran discret : une pastille en bas à droite qui s'ouvre en petit lecteur. */
const RadioPlayer = React.memo(() => {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [showList, setShowList] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const station = STATIONS[index];

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !playing) return;
    setError(false);
    a.play().catch(() => {
      setPlaying(false);
      setError(true);
    });
  }, [index, playing]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      setPlaying(true);
    }
  };
  const go = (delta: number) => {
    setIndex((i) => (i + delta + STATIONS.length) % STATIONS.length);
    setPlaying(true);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={station.url}
        preload="none"
        onEnded={() => go(1)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setError(false);
        }}
        onError={() => {
          setLoading(false);
          if (playing) {
            setPlaying(false);
            setError(true);
          }
        }}
      />

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-4 z-40 flex items-center gap-2.5 rounded-full border border-gold-400/25 bg-ivory-50/90 py-2 pl-2 pr-4 text-sm font-bold text-ink-800 shadow-2xl backdrop-blur-xl transition hover:border-gold-400/60"
          aria-label="Ouvrir le lecteur de Coran"
        >
          <span className={`grid h-9 w-9 place-items-center rounded-full ${playing ? 'bg-brand-600 text-white' : 'bg-gold-400/15 text-gold-600'}`}>
            {playing ? <Equalizer /> : <Play className="h-4 w-4 translate-x-px" />}
          </span>
          <span className="hidden sm:inline">{playing ? station.name : 'Écouter le Coran'}</span>
        </button>
      ) : (
        <div className="fixed bottom-5 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-ink-900/10 bg-ivory-50/95 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-fade-up">
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-600">Récitation · Mishary Alafasy</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900" aria-label="Réduire le lecteur">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 pb-4 pt-2">
            <p className="font-serif text-xl font-semibold text-ink-900">{station.name}</p>
            <p className="text-sm text-ink-500">{error ? 'Lecture impossible pour le moment. Réessayez.' : station.description}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-900/10">
              {playing && <div className={`h-full w-full bg-gradient-to-r from-brand-600 via-gold-300 to-brand-600 bg-[length:200%_100%] ${loading ? 'animate-shimmer opacity-60' : 'animate-shimmer'}`} />}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setShowList((v) => !v)} className={`rounded-full p-2.5 transition ${showList ? 'bg-brand-500/20 text-brand-700' : 'text-ink-500 hover:bg-ink-900/5 hover:text-ink-900'}`} aria-label="Liste des sourates">
                <ListMusic className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => go(-1)} className="rounded-full p-2.5 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900" aria-label="Sourate précédente">
                  <SkipBack className="h-5 w-5" />
                </button>
                <button onClick={toggle} className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-[0_10px_30px_-8px_rgba(234,88,12,0.8)] transition hover:bg-brand-500" aria-label={playing ? 'Pause' : 'Lecture'}>
                  {playing && loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
                </button>
                <button onClick={() => go(1)} className="rounded-full p-2.5 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900" aria-label="Sourate suivante">
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setPlaying(false);
                  setOpen(false);
                }}
                className="rounded-full p-2.5 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
                aria-label="Arrêter"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {showList && (
            <ul className="max-h-60 overflow-y-auto border-t border-ink-900/5 p-2">
              {STATIONS.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setIndex(i);
                      setPlaying(true);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${i === index ? 'bg-brand-500/15 text-brand-800' : 'text-ink-700 hover:bg-ink-900/5'}`}
                  >
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-ink-400">{s.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
});

const Equalizer = () => (
  <span className="flex h-4 items-end gap-[3px]" aria-hidden>
    {[0, 1, 2].map((i) => (
      <span key={i} className="w-[3px] rounded-full bg-white" style={{ height: '100%', animation: `float ${0.6 + i * 0.2}s ease-in-out infinite`, transformOrigin: 'bottom' }} />
    ))}
  </span>
);

export default RadioPlayer;
