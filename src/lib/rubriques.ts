import type React from 'react';

// Identité de chaque rubrique : une couleur douce et apaisante, un dégradé, une devise.
// Les couleurs suivent un cercle harmonieux (orange → or → sauge → émeraude → turquoise →
// ciel → océan → pervenche → lavande → rose poudré) pour que le site reste calme et cohérent.
export type RubriqueKey =
  | 'ddr' | 'decouvrir' | 'apprendre' | 'savoir' | 'mediatheque' | 'temoignages'
  | 'agenda' | 'rejoindre' | 'soutenir' | 'zakat' | 'studio' | 'actualites';

export const RUBRIQUE_THEME: Record<RubriqueKey, { from: string; to: string; soft: string; ink: string; mot: string }> = {
  ddr: { from: '#F5A03A', to: '#D2691A', soft: '#FFF1DE', ink: '#A04A0A', mot: 'Notre famille' },
  apprendre: { from: '#E6B648', to: '#B08118', soft: '#FBF0D2', ink: '#7A580C', mot: 'Le savoir' },
  zakat: { from: '#93C26B', to: '#5A8A3A', soft: '#EEF5E4', ink: '#43682A', mot: 'La purification' },
  savoir: { from: '#3DBB8C', to: '#17775A', soft: '#E0F5EC', ink: '#125D47', mot: 'La lumière' },
  decouvrir: { from: '#22AFA9', to: '#0D7279', soft: '#DDF4F1', ink: '#0B5E66', mot: 'La paix' },
  studio: { from: '#56BDE6', to: '#2382B5', soft: '#E2F3FB', ink: '#175F87', mot: 'Le partage' },
  mediatheque: { from: '#5C8BDB', to: '#2F57A8', soft: '#E3EBFA', ink: '#25468A', mot: 'La parole' },
  agenda: { from: '#8D95E8', to: '#5A5DB8', soft: '#ECEDFC', ink: '#45489A', mot: 'Le rendez-vous' },
  rejoindre: { from: '#B094DD', to: '#7957B5', soft: '#F2ECFB', ink: '#5E4196', mot: 'L’engagement' },
  temoignages: { from: '#E39AB4', to: '#A9567A', soft: '#FBEAF1', ink: '#843E5E', mot: 'Le cœur' },
  soutenir: { from: '#F5A03A', to: '#C99A2E', soft: '#FFF1DE', ink: '#A04A0A', mot: 'Le partage' },
  actualites: { from: '#6FA0B5', to: '#3B6A80', soft: '#E5F0F4', ink: '#2F5668', mot: 'Les nouvelles' },
};

/** Variables CSS d'une rubrique, à poser en `style` : --r-from, --r-to, --r-soft, --r-ink. */
export const rubriqueVars = (k: RubriqueKey) => {
  const t = RUBRIQUE_THEME[k];
  return { '--r-from': t.from, '--r-to': t.to, '--r-soft': t.soft, '--r-ink': t.ink } as React.CSSProperties;
};
