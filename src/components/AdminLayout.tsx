import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, ExternalLink, HandHeart, Inbox, LayoutDashboard, LogOut, Menu, Newspaper, PenSquare, Settings, Sparkles, Target, X } from 'lucide-react';
import Logo from './Logo';
import { adminSignOut, getAdminCounts } from '../services/db';

const LINKS = [
  { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/mailbox', label: 'Témoignages', icon: Inbox, count: 'messages' as const },
  { to: '/admin/appointments', label: 'Rendez-vous', icon: CalendarCheck, count: 'appointments' as const },
  { to: '/admin/conversions', label: 'Conversions', icon: Sparkles, count: 'conversions' as const },
  { to: '/admin/donations', label: 'Dons', icon: HandHeart },
  { to: '/admin/campaigns', label: 'Campagne', icon: Target },
  { to: '/admin/content', label: 'Actualités', icon: Newspaper },
  { to: '/admin/site', label: 'Contenu du site', icon: PenSquare },
  { to: '/admin/settings', label: 'Réglages', icon: Settings },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ appointments: 0, messages: 0, conversions: 0 });

  useEffect(() => {
    setOpen(false);
    getAdminCounts().then(setCounts).catch(() => {});
  }, [location.pathname]);

  const logout = async () => {
    await adminSignOut();
    navigate('/admin/login', { replace: true });
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="p-5"><Logo showArabic={false} /></div>
      <ul className="flex-1 space-y-1 px-3">
        {LINKS.map(({ to, label, icon: Icon, count }) => {
          const active = location.pathname.startsWith(to);
          const n = count ? counts[count] : 0;
          return (
            <li key={to}>
              <Link to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-brand-500/15 text-brand-200' : 'text-sand-400 hover:bg-white/5 hover:text-cream-50'}`}>
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{label}</span>
                {n > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">{n}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/5 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sand-400 hover:bg-white/5 hover:text-cream-50">
          <ExternalLink className="h-[18px] w-[18px]" /> Voir le site
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10">
          <LogOut className="h-[18px] w-[18px]" /> Se déconnecter
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-night-950 text-cream-100">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-night-900 lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-night-900">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-full p-2 text-sand-400" aria-label="Fermer"><X className="h-5 w-5" /></button>
            {nav}
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-night-950/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-full p-2 text-cream-100 hover:bg-white/5" aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <span className="font-bold">Administration DDR</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

/** En-tête de page admin */
export const AdminTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="font-serif text-3xl font-semibold text-cream-50">{title}</h1>
      {subtitle && <p className="mt-1 text-sand-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Empty = ({ children }: { children: React.ReactNode }) => <div className="card p-10 text-center text-sand-400">{children}</div>;

export const fmtDateTime = (d: string | number) =>
  new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Petit hook de chargement avec gestion d'erreur pour les pages admin. */
export function useAdminData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setError('');
    load()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.message || 'Erreur de chargement'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  return { data, error, reload: () => setTick((t) => t + 1), setData };
}
