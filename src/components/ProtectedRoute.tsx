import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../services/auth/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallback = '/connexion',
}: ProtectedRouteProps) {
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to={fallback} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
