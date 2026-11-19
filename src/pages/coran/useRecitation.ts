// Lecture audio verset par verset : enchaînement, répétitions, vitesse, secours en cas d'erreur.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ayah } from './quranApi';
import { trackEvent } from '../../lib/analytics';

export type RecitationOptions = {
  /** Combien de fois chaque verset est récité avant de passer au suivant. */
  repeat?: number;
  /** Enchaîner automatiquement sur le verset suivant. */
  continuous?: boolean;
  /** Première et dernière position (index) de la plage lue, pour l'apprentissage par blocs. */
  range?: [number, number];
  /** Recommencer la plage en boucle. */
  loop?: boolean;
};

export function useRecitation(ayahs: Ayah[], opts: RecitationOptions = {}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState('');
  const played = useRef(0);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const ayahsRef = useRef(ayahs);
  ayahsRef.current = ayahs;
  const indexRef = useRef<number | null>(null);
  indexRef.current = index;

  const start = useCallback((i: number, resetCount = true) => {
    const a = ayahsRef.current[i];
    if (!a) return;
    if (!a.audio) {
      setError('La récitation n’est pas disponible pour ce verset.');
      return;
    }
    if (!audio.current) audio.current = new Audio();
    const el = audio.current;
    if (resetCount) played.current = 0;
    if (indexRef.current === null) trackEvent('coran_ecoute');
    setError('');
    el.src = a.audio;
    el.dataset.alt = a.audioAlt || '';
    el.playbackRate = rate;
    setIndex(i);
    el.play().then(() => setPlaying(true)).catch(() => {
      setPlaying(false);
      setError('Touchez « Écouter » pour lancer la récitation.');
    });
  }, [rate]);

  // Fin d'un verset : répéter, passer au suivant, ou s'arrêter
  useEffect(() => {
    if (!audio.current) audio.current = new Audio();
    const el = audio.current;
    const onEnded = () => {
      const o = optsRef.current;
      const i = indexRef.current;
      if (i === null) return;
      played.current += 1;
      if (played.current < (o.repeat || 1)) return start(i, false);
      const [lo, hi] = o.range || [0, ayahsRef.current.length - 1];
      if (o.continuous && i < hi) return start(i + 1);
      if (o.loop) return start(lo);
      setPlaying(false);
    };
    const onError = () => {
      // Lien de secours (débit plus faible), une seule fois
      if (el.dataset.alt && el.src !== el.dataset.alt) {
        el.src = el.dataset.alt;
        el.play().catch(() => setPlaying(false));
      } else {
        setPlaying(false);
        setError('La récitation n’a pas pu être chargée. Vérifiez votre connexion.');
      }
    };
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [start]);

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = rate;
  }, [rate]);

  // Arrêt propre quand on quitte la page ou qu'on change de sourate
  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => {
    audio.current?.pause();
    setPlaying(false);
    setIndex(null);
  }, [ayahs]);

  const pause = () => {
    audio.current?.pause();
    setPlaying(false);
  };
  const toggle = (fallback = 0) => {
    if (playing) return pause();
    if (index !== null && audio.current?.src && audio.current.currentTime > 0 && !audio.current.ended) {
      audio.current.play().then(() => setPlaying(true)).catch(() => {});
    } else start(index ?? fallback);
  };

  return { index, playing, rate, setRate, error, play: start, pause, toggle, setIndex };
}
