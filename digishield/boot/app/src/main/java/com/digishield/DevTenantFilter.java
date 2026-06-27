package com.digishield;

import com.digishield.shared.tenantcontext.DemoTenants;
import com.digishield.shared.tenantcontext.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Profile;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Dev-only tenant filter.
 *
 * <p>There is no JWT in dev, so this filter establishes the {@link TenantContext}
 * for every request from the {@code X-Tenant-Id} header when present, otherwise
 * from the fixed {@link DemoTenants#DEMO_TENANT_ID}. This makes
 * {@code TenantContext.requireUuid()} work everywhere without authentication.
 * The context is always cleared in a {@code finally} block.
 *
 * <p>Replaces the production {@code TenantFilter} (which is {@code @Profile("!dev")}).
 */
@Component
@Profile("dev")
public class DevTenantFilter extends OncePerRequestFilter {

    /** Fallback header so the frontend can target a specific tenant if needed. */
    public static final String TENANT_HEADER = "X-Tenant-Id";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String headerTenant = request.getHeader(TENANT_HEADER);
            String tenantId = (headerTenant != null && !headerTenant.isBlank())
                    ? headerTenant
                    : DemoTenants.DEMO_TENANT_ID.toString();
            TenantContext.set(tenantId);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
