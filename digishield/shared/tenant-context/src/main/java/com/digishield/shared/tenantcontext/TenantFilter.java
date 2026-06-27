package com.digishield.shared.tenantcontext;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that reads the tenant id and sets it into {@link TenantContext} for each request.
 * <p>
 * In a real environment, the tenant id is obtained from the JWT "tid" claim.
 * So the skeleton can run without a JWT, the filter falls back to reading the
 * {@code X-Tenant-Id} header.
 *
 * <p>Disabled in the {@code dev} profile, where {@code DevTenantFilter} (in
 * {@code boot:app}) takes over and falls back to the fixed demo tenant so the
 * frontend works without sending any tenant header.
 */
@Component
@Profile("!dev")
public class TenantFilter extends OncePerRequestFilter {

    /** Name of the JWT claim that holds the tenant id. */
    public static final String TENANT_CLAIM = "tid";

    /** Fallback header used for the skeleton/dev when there is no JWT yet. */
    public static final String TENANT_HEADER = "X-Tenant-Id";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String tenantId = resolveTenantId(request);
            if (tenantId != null && !tenantId.isBlank()) {
                TenantContext.set(tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Resolves the tenant id: prefers the JWT "tid" claim, otherwise reads the X-Tenant-Id header.
     */
    private String resolveTenantId(HttpServletRequest request) {
        // TODO: when integrating a resource-server, read the "tid" claim from
        // SecurityContextHolder -> JwtAuthenticationToken -> getToken().getClaimAsString(TENANT_CLAIM).
        // For now, fall back to the header so the skeleton can run without depending on security.
        return request.getHeader(TENANT_HEADER);
    }
}
