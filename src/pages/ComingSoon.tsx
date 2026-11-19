// Rubrique en cours de conception (refonte rubrique par rubrique).
import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { ButtonLink, Container } from '../components/ui';

const ComingSoon = ({ title, text }: { title: string; text: string }) => (
  <Container className="py-24 text-center">
    <LogoMark className="mx-auto h-24 w-auto animate-float" />
    <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-800">
      <Sparkles className="h-4 w-4" /> Rubrique en préparation
    </p>
    <h1 className="mx-auto mt-6 max-w-2xl font-serif text-4xl font-semibold text-ink-900 md:text-6xl">{title}</h1>
    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-500">{text}</p>
    <ButtonLink to="/" variant="ghost" className="mt-10">
      <ArrowLeft className="h-4 w-4" /> Retour à l’accueil
    </ButtonLink>
  </Container>
);

export default ComingSoon;
