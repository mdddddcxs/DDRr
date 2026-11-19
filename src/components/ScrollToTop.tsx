import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// À chaque clic vers une page : retour immédiat en haut (sans animation, sinon le défilement doux
// est interrompu quand la nouvelle page se charge et on reste en bas).
// Si le lien vise une section (#intervenants, #ecritures…), on attend qu'elle apparaisse et on y va.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    const timers: number[] = [];
    let raf = 0;

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const started = Date.now();
      const seek = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        if (Date.now() - started < 4000) raf = requestAnimationFrame(seek);
        else toTop();
      };
      seek();
    } else {
      toTop();
      // Les pages se chargent par morceaux : on reconfirme le haut pendant le chargement.
      raf = requestAnimationFrame(toTop);
      [60, 200, 500].forEach((ms) => timers.push(window.setTimeout(toTop, ms)));
      // Mais si la personne défile elle-même entre-temps, on la laisse faire.
      const stop = () => timers.forEach(clearTimeout);
      window.addEventListener('wheel', stop, { once: true, passive: true });
      window.addEventListener('touchmove', stop, { once: true, passive: true });
      return () => {
        cancelAnimationFrame(raf);
        stop();
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchmove', stop);
      };
    }
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToTop;
