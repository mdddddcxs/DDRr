import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Logo from '../../components/Logo';
import { Button, Notice } from '../../components/ui';
import { adminSignIn, checkIsAdmin } from '../../services/db';
import { isBackendReady, supabase } from '../../lib/supabase';

/**
 * Connexion admin. Gère aussi les liens reçus par email :
 * - invitation d'un nouvel administrateur (#type=invite)
 * - mot de passe oublié (#type=recovery)
 * Dans ces deux cas, la personne choisit elle-même son mot de passe ici.
 */
const linkType = () => {
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const t = h.get('type');
  return t === 'invite' || t === 'recovery' ? t : null;
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'set-password' | 'forgot'>(() => (linkType() ? 'set-password' : 'login'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Le lien d'email ouvre une session temporaire : on attend que Supabase l'ait lue.
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('set-password');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (e: React.FormEvent) => {
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

  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 10) return setError('Le mot de passe doit faire au moins 10 caractères.');
    if (password !== password2) return setError('Les deux mots de passe ne sont pas identiques.');
    if (!supabase) return;
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Lien expiré. Demandez un nouveau lien avec « Mot de passe oublié ».');
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      window.history.replaceState(null, '', window.location.pathname);
      if (await checkIsAdmin()) navigate('/admin/dashboard', { replace: true });
      else {
        await supabase.auth.signOut();
        setMode('login');
        setInfo("Mot de passe enregistré. Votre compte doit encore recevoir les droits d'administration.");
      }
    } catch (x) {
      setError(x instanceof Error ? x.message : 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  const forgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/login` }).catch(() => {});
    setLoading(false);
    setMode('login');
    setInfo('Si cet email correspond à un administrateur, un lien pour choisir un nouveau mot de passe vient d’être envoyé.');
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-ivory-100 px-4">
      <div className="absolute inset-0 bg-pattern opacity-[0.04]" aria-hidden />
      <form onSubmit={mode === 'login' ? login : mode === 'forgot' ? forgot : setNewPassword} className="card relative w-full max-w-sm space-y-5 bg-ivory-50 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo showArabic={false} />
          <p className="flex items-center gap-2 text-sm font-bold text-ink-500">
            <Lock className="h-4 w-4" /> {mode === 'set-password' ? 'Choisissez votre mot de passe' : mode === 'forgot' ? 'Mot de passe oublié' : 'Espace administrateur'}
          </p>
        </div>
        {!isBackendReady() && <Notice tone="info">La base de données n’est pas encore configurée (variables Supabase manquantes).</Notice>}
        {info && <Notice tone="success">{info}</Notice>}

        {mode !== 'set-password' && (
          <div>
            <label htmlFor="a-email" className="label">Email</label>
            <input id="a-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
        )}
        {mode === 'login' && (
          <div>
            <label htmlFor="a-pass" className="label">Mot de passe</label>
            <input id="a-pass" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </div>
        )}
        {mode === 'set-password' && (
          <>
            <div>
              <label htmlFor="n-pass" className="label">Nouveau mot de passe (10 caractères minimum)</label>
              <input id="n-pass" type="password" autoComplete="new-password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="n-pass2" className="label">Confirmer le mot de passe</label>
              <input id="n-pass2" type="password" autoComplete="new-password" required value={password2} onChange={(e) => setPassword2(e.target.value)} className="input" />
            </div>
          </>
        )}

        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" className="w-full" disabled={loading || !isBackendReady()}>
          {loading ? 'Patientez…' : mode === 'login' ? 'Se connecter' : mode === 'forgot' ? 'Recevoir un lien' : 'Enregistrer mon mot de passe'}
        </Button>
        {mode === 'login' ? (
          <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }} className="block w-full text-center text-xs text-ink-500 hover:text-ink-800">
            Mot de passe oublié ?
          </button>
        ) : (
          <button type="button" onClick={() => { setMode('login'); setError(''); }} className="block w-full text-center text-xs text-ink-500 hover:text-ink-800">
            ← Retour à la connexion
          </button>
        )}
        <Link to="/" className="block text-center text-xs text-ink-400 hover:text-ink-800">← Retour au site</Link>
      </form>
    </div>
  );
};

export default AdminLogin;
