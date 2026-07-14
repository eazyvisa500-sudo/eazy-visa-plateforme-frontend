import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';

import ProtectedRoute from './components/ProtectedRoute';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployerLayout from './layouts/EmployerLayout';

import LoginSuperAdmin from './pages/auth/LoginSuperAdmin';
import LoginCommon from './pages/auth/LoginCommon';
import Landing from './pages/Landing';

const SAVueEnsemble = lazy(() => import('./pages/superadmin/VueEnsemble'));
const Entreprises = lazy(() => import('./pages/superadmin/Entreprises'));
const SEntrepriseDetail = lazy(() => import('./pages/superadmin/EntrepriseDetailPage'));
const Utilisateurs = lazy(() => import('./pages/superadmin/Utilisateurs'));
const SAAnalytiques = lazy(() => import('./pages/superadmin/Analytiques'));
const SAReservation = lazy(() => import('./pages/superadmin/Reservation'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Employers = lazy(() => import('./pages/admin/Employers'));
const Demandes = lazy(() => import('./pages/admin/Demandes'));
const AAnalytiques = lazy(() => import('./pages/admin/Analytiques'));
const Reservations = lazy(() => import('./pages/admin/Reservations'));
const ABudgets = lazy(() => import('./pages/admin/Budgets'));
const APolitiques = lazy(() => import('./pages/admin/Politiques'));

const EVueEnsemble = lazy(() => import('./pages/employer/VueEnsemble'));
const MesReservations = lazy(() => import('./pages/employer/MesReservations'));
const MesDemandes = lazy(() => import('./pages/employer/MesDemandes'));
const EBudgets = lazy(() => import('./pages/employer/Budgets'));
const Historique = lazy(() => import('./pages/employer/Historique'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
        {/* Auth */}
        <Route path="/connexion-superadmin" element={<LoginSuperAdmin />} />
        <Route path="/connexion" element={<LoginCommon />} />

        {/* Superadmin */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} fallback="/connexion-superadmin">
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><SAVueEnsemble /></Suspense>} />
          <Route path="entreprises" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Entreprises /></Suspense>} />
          <Route path="entreprises/:id" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><SEntrepriseDetail /></Suspense>} />
          <Route path="utilisateurs" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Utilisateurs /></Suspense>} />
          <Route path="analytiques" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><SAAnalytiques /></Suspense>} />
          <Route path="reservation" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><SAReservation /></Suspense>} />
        </Route>

        {/* Admin (MANAGER) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'SUPERADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Dashboard /></Suspense>} />
          <Route path="employers" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Employers /></Suspense>} />
          <Route path="demandes" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Demandes /></Suspense>} />
          <Route path="reservations" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Reservations /></Suspense>} />
          <Route path="analytiques" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><AAnalytiques /></Suspense>} />
          <Route path="budgets" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><ABudgets /></Suspense>} />
          <Route path="politiques" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><APolitiques /></Suspense>} />
        </Route>

        {/* Employer */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYE', 'CONSULTANT', 'MANAGER', 'SUPERADMIN']}>
              <EmployerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><EVueEnsemble /></Suspense>} />
          <Route path="mes-reservations" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><MesReservations /></Suspense>} />
          <Route path="mes-demandes" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><MesDemandes /></Suspense>} />
          <Route path="budgets" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><EBudgets /></Suspense>} />
          <Route path="historique" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#A11B1B] border-t-transparent rounded-full animate-spin" /></div>}><Historique /></Suspense>} />
        </Route>

        {/* Landing page */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App
