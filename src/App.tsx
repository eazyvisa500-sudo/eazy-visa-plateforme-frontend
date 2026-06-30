import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployerLayout from './layouts/EmployerLayout';

import LoginSuperAdmin from './pages/auth/LoginSuperAdmin';
import LoginCommon from './pages/auth/LoginCommon';

import SAVueEnsemble from './pages/superadmin/VueEnsemble';
import Entreprises from './pages/superadmin/Entreprises';
import Utilisateurs from './pages/superadmin/Utilisateurs';
import SAAnalytiques from './pages/superadmin/Analytiques';
import SAReservation from './pages/superadmin/Reservation';
import Politiques from './pages/superadmin/Politiques';

import AVueEnsemble from './pages/admin/VueEnsemble';
import Employers from './pages/admin/Employers';
import Demandes from './pages/admin/Demandes';
import AAnalytiques from './pages/admin/Analytiques';
import AReservation from './pages/admin/Reservation';
import ABudgets from './pages/admin/Budgets';

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
          <Route index element={<AVueEnsemble />} />
          <Route path="employers" element={<Employers />} />
          <Route path="demandes" element={<Demandes />} />
          <Route path="analytiques" element={<AAnalytiques />} />
          <Route path="reservation" element={<AReservation />} />
          <Route path="budgets" element={<ABudgets />} />
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
