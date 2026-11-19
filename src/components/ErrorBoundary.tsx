// Filet de sécurité : si une partie du site plante, le visiteur voit un message clair
// (et peut recharger) au lieu d'une page blanche. Le reste du site continue de fonctionner.
import React from 'react';
import { LogoMark } from './Logo';

type Props = { children: React.ReactNode; resetKey?: string };
type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[DDR] Erreur d’affichage :', error);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-lg px-6 py-24 text-center">
        <LogoMark className="mx-auto h-20 w-auto" />
        <h1 className="mt-8 font-serif text-3xl font-semibold text-ink-900">Un petit souci d’affichage</h1>
        <p className="mt-3 text-ink-500">Cette page n’a pas pu s’afficher correctement. Rechargez-la : dans la plupart des cas, tout rentre dans l’ordre.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => window.location.reload()} className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-6 py-3 font-bold text-white shadow-lg">
            Recharger la page
          </button>
          <a href="/" className="rounded-full border border-ink-900/15 bg-white px-6 py-3 font-bold text-ink-900">Retour à l’accueil</a>
        </div>
      </div>
    );
  }
}
