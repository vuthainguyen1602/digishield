import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Role } from './roles';

interface RequireRoleProps {
  /** Roles permitted to view the wrapped content. */
  allow: Role[];
  children: ReactNode;
}

/**
 * Route guard:
 *  - Unauthenticated  -> redirect to /login (preserving the attempted path).
 *  - Authenticated but role not in `allow` -> redirect to /403.
 *  - Otherwise render children.
 */
export function RequireRole({ allow, children }: RequireRoleProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
