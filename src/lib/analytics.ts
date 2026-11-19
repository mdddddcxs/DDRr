// Mesure d'audience anonyme (voir la migration « statistiques »).
// Aucune donnée personnelle : un identifiant aléatoire par navigateur, la page, la source et le type d'appareil.
import { supabase } from './supabase';

const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => (b % 36).toString(36)).join('');

function ids() {
  let visitor = '';
  let session = '';
  try {
    visitor = localStorage.getItem('ddr_v') || '';
    if (!/^[a-z0-9]{8,40}$/.test(visitor)) {
      visitor = rid();
      localStorage.setItem('ddr_v', visitor);
    }
    session = sessionStorage.getItem('ddr_s') || '';
    if (!/^[a-z0-9]{8,40}$/.test(session)) {
      session = rid();
      sessionStorage.setItem('ddr_s', session);
    }
  } catch {
    visitor = visitor || rid();
    session = session || rid();
  }
  return { visitor, session };
}

const device = () => {
  const w = window.innerWidth;
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua) || (w >= 600 && w < 1024 && 'ontouchstart' in window)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua) || w < 600) return 'mobile';
  return 'desktop';
};

/** Source de la visite (domaine seulement), pour la première page d'une session. */
function source(): string | null {
  try {
    if (sessionStorage.getItem('ddr_src_done')) return null;
    sessionStorage.setItem('ddr_src_done', '1');
    if (!document.referrer) return null;
    const h = new URL(document.referrer).hostname.replace(/^www\./, '').replace(/^(m|l|lm)\./, '');
    if (h === location.hostname) return null;
    if (/facebook|fb\.com/.test(h)) return 'Facebook';
    if (/google\./.test(h)) return 'Google';
    if (/youtube|youtu\.be/.test(h)) return 'YouTube';
    if (/tiktok/.test(h)) return 'TikTok';
    if (/instagram/.test(h)) return 'Instagram';
    if (/whatsapp|wa\.me/.test(h)) return 'WhatsApp';
    if (/bing\./.test(h)) return 'Bing';
    return h.slice(0, 120);
  } catch {
    return null;
  }
}

const disabled = () => !supabase || (typeof navigator !== 'undefined' && (navigator as any).webdriver) || location.pathname.startsWith('/admin');

function send(row: { path: string; event?: string; referrer?: string | null }) {
  if (disabled()) return;
  const { visitor, session } = ids();
  supabase!
    .from('page_views')
    .insert({ path: row.path.slice(0, 200) || '/', event: row.event || null, referrer: row.referrer || null, device: device(), visitor, session })
    .then(() => {}, () => {});
}

let lastPath = '';
/** Une page vue (appelé à chaque changement de page). */
export function trackPage(path: string) {
  if (path === lastPath) return;
  lastPath = path;
  send({ path, referrer: source() });
}

/** Un usage d'outil : quiz joué, verset écouté, carte créée… */
export function trackEvent(event: string) {
  send({ path: location.pathname, event });
}

export const EVENT_LABELS: Record<string, string> = {
  quiz_partie: 'Parties de quiz',
  coran_ecoute: 'Récitations écoutées',
  coran_verset_appris: 'Versets appris par cœur',
  carte_creee: 'Cartes de rappel créées',
  zakat_calcul: 'Calculs de zakat enregistrés',
  compagnon_question: 'Questions au Compagnon',
  temoignage_envoye: 'Témoignages envoyés',
  rdv_demande: 'Demandes de rendez-vous',
  shahada_demande: 'Demandes d’accompagnement (shahada)',
  agenda_ajout: 'Rappels ajoutés à l’agenda',
  whatsapp_clic: 'Contacts WhatsApp',
};
