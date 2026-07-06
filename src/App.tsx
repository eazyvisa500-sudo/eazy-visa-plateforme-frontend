import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployerLayout from './layouts/EmployerLayout';

import LoginSuperAdmin from './pages/auth/LoginSuperAdmin';
import LoginCommon from './pages/auth/LoginCommon';

import SAVueEnsemble from './pages/superadmin/VueEnsemble';
import Entreprises from './pages/superadmin/Entreprises';
import SEntrepriseDetail from './pages/superadmin/EntrepriseDetailPage';
import Utilisateurs from './pages/superadmin/Utilisateurs';
import SAAnalytiques from './pages/superadmin/Analytiques';
import SAReservation from './pages/superadmin/Reservation';
import Politiques from './pages/superadmin/Politiques';

import Dashboard from './pages/admin/Dashboard';
import Employers from './pages/admin/Employers';
import Demandes from './pages/admin/Demandes';
import AAnalytiques from './pages/admin/Analytiques';
import Reservations from './pages/admin/Reservations';
import ABudgets from './pages/admin/Budgets';
import APolitiques from './pages/admin/Politiques';

import EVueEnsemble from './pages/employer/VueEnsemble';
import MesReservations from './pages/employer/MesReservations';
import MesDemandes from './pages/employer/MesDemandes';
import EBudgets from './pages/employer/Budgets';
import Historique from './pages/employer/Historique';

function App() {
  return (
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
          <Route index element={<SAVueEnsemble />} />
          <Route path="entreprises" element={<Entreprises />} />
          <Route path="entreprises/:id" element={<SEntrepriseDetail />} />
          <Route path="utilisateurs" element={<Utilisateurs />} />
          <Route path="analytiques" element={<SAAnalytiques />} />
          <Route path="reservation" element={<SAReservation />} />
          <Route path="politiques" element={<Politiques />} />
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
          <Route index element={<Dashboard />} />
          <Route path="employers" element={<Employers />} />
          <Route path="demandes" element={<Demandes />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="analytiques" element={<AAnalytiques />} />
          <Route path="budgets" element={<ABudgets />} />
          <Route path="politiques" element={<APolitiques />} />
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
          <Route index element={<EVueEnsemble />} />
          <Route path="mes-reservations" element={<MesReservations />} />
          <Route path="mes-demandes" element={<MesDemandes />} />
          <Route path="budgets" element={<EBudgets />} />
          <Route path="historique" element={<Historique />} />
        </Route>

        {/* Redirect root to common login */}
        <Route path="/" element={<Navigate to="/connexion" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
