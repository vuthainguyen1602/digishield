/**
 * Bridge between the React AuthContext and the non-React axios layer.
 *
 * The axios request interceptor cannot use React hooks, so the AuthProvider
 * registers a read-only accessor here. The interceptor calls `getAuth()` to
 * obtain the current token + tenantId at request time. An optional
 * unauthorized handler lets the axios 401 interceptor trigger a logout/redirect
 * without importing React.
 */

export interface AuthSnapshot {
  token: string | null;
  tenantId: string | null;
}

type AuthAccessor = () => AuthSnapshot;
type UnauthorizedHandler = () => void;

let accessor: AuthAccessor = () => ({ token: null, tenantId: null });
let onUnauthorized: UnauthorizedHandler | null = null;

/** Registered by AuthProvider. */
export function setAuthAccessor(next: AuthAccessor): void {
  accessor = next;
}

/** Read the current auth snapshot (used by the axios request interceptor). */
export function getAuth(): AuthSnapshot {
  return accessor();
}

/** Registered by the app to handle a 401 (e.g. clear state + redirect). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

/** Invoked by the axios response interceptor on 401. */
export function handleUnauthorized(): void {
  onUnauthorized?.();
}
