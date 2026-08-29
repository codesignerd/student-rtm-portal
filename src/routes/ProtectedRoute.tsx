import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'admin' | 'student'>;
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading session...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!userRole) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
