package com.digishield.shared.persistence;

import com.digishield.shared.tenantcontext.TenantContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Aspect that enforces PostgreSQL Row-Level Security (RLS).
 * <p>
 * Before each {@code @Transactional} method, it sets the session variable
 * {@code app.tenant_id} via {@code SET LOCAL} so that RLS policies filter data
 * by the current tenant. {@code SET LOCAL} only takes effect within the current
 * transaction, so it must run inside an open transaction.
 *
 * <p>Disabled in the {@code dev} profile: it issues PostgreSQL-only
 * {@code set_config} calls that the in-memory H2 database does not support.
 */
@Aspect
@Component
@Profile("!dev")
public class RlsTenantAspect
        implements org.springframework.context.ApplicationListener<org.springframework.context.event.ContextRefreshedEvent> {

    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(RlsTenantAspect.class);
    private static volatile boolean contextRefreshed = false;
    private final JdbcTemplate jdbcTemplate;

    public RlsTenantAspect(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void onApplicationEvent(org.springframework.context.event.ContextRefreshedEvent event) {
        contextRefreshed = true;
    }

    /**
     * Applies to all Spring Data repository calls.
     */
    @Before("this(org.springframework.data.repository.Repository)")
    public void setTenantForTransaction() {
        String tenantId = TenantContext.get();
        if (tenantId == null || tenantId.isBlank()) {
            if (contextRefreshed) {
                throw new IllegalStateException("Tenant context has not been set for the current request");
            }
            return;
        }
        LOGGER.debug("Setting tenant_id GUC to: {}", tenantId);
        // Use set_config to avoid parameterization issues with SET LOCAL.
        // The 3rd parameter = true => local scope (only within the current transaction).
        jdbcTemplate.queryForObject("SELECT set_config('app.tenant_id', ?, true)", String.class, tenantId);
    }
}
