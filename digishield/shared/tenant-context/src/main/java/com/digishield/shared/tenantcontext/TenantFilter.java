package com.digishield.shared.tenantcontext;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that derives the tenant id from the validated JWT and sets it into
 * {@link TenantContext} for each request.
 * <p>
 * The tenant comes from the {@code tid} claim of the JWT that the resource
 * server (see {@code SecurityConfig}) has already validated and placed in the
 * {@link SecurityContextHolder}. The tenant is therefore taken from a signed,
 * trusted token — never from a client-supplied header, which a caller could
 * forge to read another tenant's data. Requests without a {@code tid} claim
 * leave {@link TenantContext} unset, so RLS / {@code requireUuid()} fail closed.
 *
 * <p>This filter runs after Spring Security's filter chain (it is an unordered
 * {@code @Component} filter, which the servlet container places after the
 * security {@code FilterChainProxy}), so the authentication is available.
 *
 * <p>Disabled in the {@code dev} profile, where {@code DevTenantFilter} (in
 * {@code boot:app}) takes over and falls back to the fixed demo tenant so the
 * frontend works without a JWT.
 *
 * <p>Cognito must emit the {@code tid} claim (e.g. via a pre-token-generation
 * trigger or attribute mapping) for this to resolve a tenant in production.
 */
@Component
@Profile("!dev")
public class TenantFilter extends OncePerRequestFilter {

    /** Name of the JWT claim that holds the tenant id. */
    public static final String TENANT_CLAIM = "tid";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String tenantId = resolveTenantId();
            if (tenantId != null && !tenantId.isBlank()) {
                TenantContext.set(tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Resolves the tenant id from the {@code tid} claim of the authenticated
     * JWT, or {@code null} when there is no JWT or no claim.
     */
    String resolveTenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString(TENANT_CLAIM);
        }
        return null;
    }
}
