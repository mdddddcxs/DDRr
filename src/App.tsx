import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LiveAssistant from './components/LiveAssistant';
import Home from './pages/Home';
import Maintenance from './pages/Maintenance';
import { checkIsAdmin, getMaintenance } from './services/db';
import { supabase } from './lib/supabase';
import { Spinner } from './components/ui';
import { SiteProvider } from './lib/site';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Chargement d'une page à la demande, avec une relance automatique :
 * après une mise à jour du site, un ancien onglet peut réclamer un fichier qui n'existe plus.
 * On recharge alors la page une seule fois pour récupérer la nouvelle version.
 */
function lazyPage<T extends React.ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await load();
      sessionStorage.removeItem('ddr_chunk_reload');
      return mod;
    } catch (err) {
      const last = Number(sessionStorage.getItem('ddr_chunk_reload') || 0);
      if (Date.now() - last > 30000) {
        sessionStorage.setItem('ddr_chunk_reload', String(Date.now()));
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}

// Les pages sont chargées à la demande : le site s'ouvre plus vite, surtout sur mobile.
const Chat = lazyPage(() => import('./pages/Chat'));
const Shahada = lazyPage(() => import('./pages/Shahada'));
const LearningCenter = lazyPage(() => import('./pages/LearningCenter'));
const Kids = lazyPage(() => import('./pages/Kids'));
const Tools = lazyPage(() => import('./pages/Tools'));
const Khatma = lazyPage(() => import('./pages/Khatma'));
const Donations = lazyPage(() => import('./pages/Donations'));
const News = lazyPage(() => import('./pages/News'));
const NewsDetail = lazyPage(() => import('./pages/NewsDetail'));
const Debates = lazyPage(() => import('./pages/Debates'));
const Conversions = lazyPage(() => import('./pages/Conversions'));
const Appointments = lazyPage(() => import('./pages/Appointments'));
const Legal = lazyPage(() => import('./pages/Legal'));
const NotFound = lazyPage(() => import('./pages/NotFound'));
const LaDDR = lazyPage(() => import('./pages/Rubriques').then((m) => ({ default: m.LaDDR })));
const Decouvrir = lazyPage(() => import('./pages/Rubriques').then((m) => ({ default: m.Decouvrir })));
const Agenda = lazyPage(() => import('./pages/Rubriques').then((m) => ({ default: m.Agenda })));
const Apprendre = lazyPage(() => import('./pages/Rubriques').then((m) => ({ default: m.Apprendre })));
const QuizInfini = lazyPage(() => import('./pages/QuizInfini'));
const Rejoindre = lazyPage(() => import('./pages/Rubriques').then((m) => ({ default: m.Rejoindre })));

const AdminLogin = lazyPage(() => import('./pages/Admin/AdminLogin'));
const AdminLayout = lazyPage(() => import('./components/AdminLayout'));
const Dashboard = lazyPage(() => import('./pages/Admin/Dashboard'));
const AdminMailbox = lazyPage(() => import('./pages/Admin/AdminMailbox'));
const AdminCampaigns = lazyPage(() => import('./pages/Admin/AdminCampaigns'));
const AdminDonations = lazyPage(() => import('./pages/Admin/AdminDonations'));
const AdminContent = lazyPage(() => import('./pages/Admin/AdminContent'));
const AdminAppointments = lazyPage(() => import('./pages/Admin/AdminAppointments'));
const AdminConversions = lazyPage(() => import('./pages/Admin/AdminConversions'));
const AdminSettings = lazyPage(() => import('./pages/Admin/AdminSettings'));
const AdminSite = lazyPage(() => import('./pages/Admin/AdminSite'));

const PageLoader = () => (
  <div className="grid min-h-[50vh] place-items-center text-brand-600">
    <Spinner className="h-8 w-8" />
  </div>
);

/** Accès admin : session Supabase + présence dans la table "admins" (vérifiée par la base). */
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<'checking' | 'ok' | 'no'>('checking');
  useEffect(() => {
    let alive = true;
    const check = () => checkIsAdmin().then((ok) => alive && setState(ok ? 'ok' : 'no'));
    check();
    const sub = supabase?.auth.onAuthStateChange(() => check());
    return () => {
      alive = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);
  if (state === 'checking') return <PageLoader />;
  return state === 'ok' ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const AppRoutes = () => {
  const location = useLocation();
  const [maintenance, setMaintenance] = useState(false);
  useEffect(() => {
    getMaintenance().then(setMaintenance).catch(() => {});
  }, []);

  if (maintenance && !location.pathname.startsWith('/admin')) return <Maintenance />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout>
                <ErrorBoundary resetKey={location.pathname}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="mailbox" element={<AdminMailbox />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="conversions" element={<AdminConversions />} />
                    <Route path="donations" element={<AdminDonations />} />
                    <Route path="campaigns" element={<AdminCampaigns />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="site" element={<AdminSite />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Suspense>
                </ErrorBoundary>
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/*"
          element={
            <Layout>
              <ErrorBoundary resetKey={location.pathname}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/shahada" element={<Shahada />} />
                  <Route path="/learning" element={<LearningCenter />} />
                  <Route path="/enfants" element={<Kids />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/khatma" element={<Khatma />} />
                  <Route path="/donations" element={<Donations />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/la-ddr/*" element={<LaDDR />} />
                  <Route path="/decouvrir" element={<Decouvrir />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/rejoindre" element={<Rejoindre />} />
                  <Route path="/apprendre" element={<Apprendre />} />
                  <Route path="/apprendre/quiz" element={<QuizInfini />} />
                  <Route path="/quiz" element={<QuizInfini />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/debates" element={<Debates />} />
                  <Route path="/conversions" element={<Conversions />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/legal/mentions" element={<Legal />} />
                  <Route path="/legal/privacy" element={<Legal />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </ErrorBoundary>
              {!['/chat', '/apprendre/quiz', '/quiz'].includes(location.pathname) && <LiveAssistant />}
            </Layout>
          }
        />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <BrowserRouter>
    <SiteProvider>
      <AppRoutes />
    </SiteProvider>
  </BrowserRouter>
);

export default App;
