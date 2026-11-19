import React from 'react';
import { ButtonLink, Container } from '../components/ui';

const NotFound = () => (
  <Container className="py-28 text-center">
    <p className="font-arabic text-3xl text-gold-600" lang="ar">سُبْحَانَ اللّٰه</p>
    <h1 className="mt-4 font-serif text-5xl font-semibold text-ink-900">Page introuvable</h1>
    <p className="mx-auto mt-4 max-w-md text-ink-500">Cette page n’existe pas ou a été déplacée.</p>
    <ButtonLink to="/" className="mt-8">Retour à l’accueil</ButtonLink>
  </Container>
);

export default NotFound;
