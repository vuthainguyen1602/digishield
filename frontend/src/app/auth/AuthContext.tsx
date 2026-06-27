import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Role } from './roles';
import { setAuthAccessor } from '@/shared/api/authBridge';

/** Authenticated principal derived from the JWT (org-scoped). */
export interface CurrentUser {
  id: string;
  /** Tenant / organization id — sent as X-Tenant-Id and embedded in the JWT. */
  tenantId: string;
  role: Role;
  /** Optional display fields populated from /auth/me. */
  name?: string;
  email?: string;
}

export interface AuthState {
  user: CurrentUser | null;
  /** Access token kept in memory only (never persisted to localStorage). */
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  /** Store the principal + token after a successful login. */
  login: (user: CurrentUser, token: string) => void;
  /** Clear all auth state. */
  logout: () => void;
  /** Replace just the token (e.g. after a silent refresh). */
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  /** Optional initial state, useful for tests. */
  initialState?: Partial<AuthState>;
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(initialState?.user ?? null);
  const [token, setTokenState] = useState<string | null>(initialState?.token ?? null);

  const login = useCallback((nextUser: CurrentUser, nextToken: string) => {
    setUser(nextUser);
    setTokenState(nextToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTokenState(null);
  }, []);

  const setToken = useCallback((nextToken: string | null) => {
    setTokenState(nextToken);
  }, []);

  // Expose a read-only accessor to the (non-React) axios layer so request
  // interceptors can attach Authorization / X-Tenant-Id without prop drilling.
  setAuthAccessor(() => ({ token, tenantId: user?.tenantId ?? null }));

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      setToken,
    }),
    [user, token, login, logout, setToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
