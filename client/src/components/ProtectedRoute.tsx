import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: UserRole;
}) {
  const { currentUser, initializing } = useAuth();

  // Still checking a stored token against the server — render nothing rather
  // than bounce to /login and immediately bounce back once auth resolves.
  if (initializing) return null;

  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
