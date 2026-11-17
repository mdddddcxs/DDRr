import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Logo from '../../components/Logo';
import { Button, Notice } from '../../components/ui';
import { adminSignIn } from '../../services/db';
import { isBackendReady } from '../../lib/supabase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminSignIn(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(/droits/.test(msg) ? msg : /rate|too many/i.test(msg) ? 'Trop de tentatives. Patientez quelques minutes.' : 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-night-950 px-4">
      <div className="absolute inset-0 bg-pattern opacity-[0.04]" aria-hidden />
      <form onSubmit={submit} className="card relative w-full max-w-sm space-y-5 bg-night-900 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo showArabic={false} />
          <p className="flex items-center gap-2 text-sm font-bold text-sand-400"><Lock className="h-4 w-4" /> Espace administrateur</p>
        </div>
        {!isBackendReady() && <Notice tone="info">La base de données n’est pas encore configurée (variables Supabase manquantes).</Notice>}
        <div>
          <label htmlFor="a-email" className="label">Email</label>
          <input id="a-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="a-pass" className="label">Mot de passe</label>
          <input id="a-pass" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" className="w-full" disabled={loading || !isBackendReady()}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
        <Link to="/" className="block text-center text-xs text-sand-500 hover:text-cream-100">← Retour au site</Link>
      </form>
    </div>
  );
};

export default AdminLogin;
