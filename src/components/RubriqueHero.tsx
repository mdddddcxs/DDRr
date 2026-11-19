// En-tête d'une rubrique, dans sa couleur (voir lib/rubriques.ts).
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container } from './ui';
import { RUBRIQUE_THEME, rubriqueVars, type RubriqueKey } from '../lib/rubriques';

const RubriqueHero = ({
  k,
  title,
  subtitle,
  arabic,
  icon: Icon,
  children,
}: {
  k: RubriqueKey;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  arabic?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) => (
  <header style={rubriqueVars(k)} className="relative -mt-[84px] overflow-hidden pt-[84px]">
    <div className="r-grad absolute inset-0" aria-hidden />
    <div className="absolute inset-0 bg-pattern opacity-20 mix-blend-overlay" aria-hidden />
    <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-[90px] animate-drift" aria-hidden />
    <div className="absolute -bottom-px left-0 right-0 h-16 bg-ivory-100 [clip-path:ellipse(70%_100%_at_50%_100%)]" aria-hidden />
    <Container className="relative pb-24 pt-8 text-center text-white md:pb-28 md:pt-12">
      <nav aria-label="Fil d’Ariane" className="mb-8 flex items-center justify-center gap-1 text-sm font-semibold text-white/75 animate-fade-up">
        <Link to="/" className="hover:text-white">Accueil</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white">{typeof title === 'string' ? title : RUBRIQUE_THEME[k].mot}</span>
      </nav>
      {Icon && (
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/40 backdrop-blur animate-fade-up">
          <Icon className="h-8 w-8" />
        </span>
      )}
      <p className="text-[12px] font-extrabold uppercase tracking-[0.26em] text-white/80 animate-fade-up">{RUBRIQUE_THEME[k].mot}</p>
      <h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] animate-word md:text-6xl">{title}</h1>
      {arabic && <p className="mt-3 font-arabic text-2xl text-white/85 animate-fade-up" lang="ar" dir="rtl">{arabic}</p>}
      {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85 animate-fade-up [animation-delay:200ms]">{subtitle}</p>}
      {children && <div className="mt-8 animate-fade-up [animation-delay:300ms]">{children}</div>}
    </Container>
  </header>
);

export default RubriqueHero;
