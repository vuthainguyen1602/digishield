package com.digishield.shared.tenantcontext;

import java.util.UUID;

/**
 * Well-known tenant identifiers used by the {@code dev} profile.
 * <p>
 * In dev there is no real JWT, so requests are scoped to a single fixed demo
 * tenant. The {@code DevTenantFilter} sets this id into {@link TenantContext}
 * (unless an {@code X-Tenant-Id} header overrides it), and the dev seeders use
 * it to attach all seeded demo data to the same tenant.
 */
public final class DemoTenants {

    /** The fixed demo tenant id used across all dev seeders and requests. */
    public static final UUID DEMO_TENANT_ID =
            UUID.fromString("11111111-1111-1111-1111-111111111111");

    private DemoTenants() {
    }
}
