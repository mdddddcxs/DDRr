import type React from 'react';
// Identité de chaque rubrique : une couleur, un dégradé, un mot-clé.
// Utilisé par le menu, l'accueil et l'en-tête de chaque rubrique pour que le visiteur
// reconnaisse immédiatement où il se trouve.
export type RubriqueKey = 'ddr' | 'decouvrir' | 'apprendre' | 'mediatheque' | 'agenda' | 'rejoindre' | 'soutenir';

export const RUBRIQUE_THEME: Record<RubriqueKey, { from: string; to: string; soft: string; ink: string; mot: string }> = {
  ddr: { from: '#F79A1E', to: '#D9600A', soft: '#FFF1DE', ink: '#A84A06', mot: 'Notre famille' },
  decouvrir: { from: '#1BA3A0', to: '#0B6F78', soft: '#DDF4F1', ink: '#0B5E66', mot: 'La paix' },
  apprendre: { from: '#E8B43A', to: '#B07D12', soft: '#FBF0D2', ink: '#7F5A0C', mot: 'Le savoir' },
  mediatheque: { from: '#E0485E', to: '#A3203D', soft: '#FCE3E6', ink: '#8C1A33', mot: 'La parole' },
  agenda: { from: '#5468D4', to: '#2D3C9A', soft: '#E4E8FB', ink: '#26337F', mot: 'Le rendez-vous' },
  rejoindre: { from: '#9A5BC4', to: '#6A3290', soft: '#F0E5F8', ink: '#5A2A7B', mot: 'L’engagement' },
  soutenir: { from: '#F79A1E', to: '#C99A2E', soft: '#FFF1DE', ink: '#A84A06', mot: 'Le partage' },
};

/** Variables CSS d'une rubrique, à poser en `style` : --r-from, --r-to, --r-soft, --r-ink. */
export const rubriqueVars = (k: RubriqueKey) => {
  const t = RUBRIQUE_THEME[k];
  return { '--r-from': t.from, '--r-to': t.to, '--r-soft': t.soft, '--r-ink': t.ink } as React.CSSProperties;
};
