/**
 * Demo / dev tenant.
 *
 * The backend dev profile (`--spring.profiles.active=dev`) seeds all sample data
 * under this fixed tenant UUID. The FE must send it as `X-Tenant-Id` so the
 * seeded data is visible. The demo login sets the current user's `tenantId` to
 * this value, and the axios client falls back to it in dev when no user is set.
 */
export const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111';
