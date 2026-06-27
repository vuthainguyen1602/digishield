package com.digishield.shared.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Puts the tenant id into the MDC so that every log line within the request scope
 * is tagged with {@code tenant_id}. Reads the tenant from the {@code X-Tenant-Id}
 * header (simulated); with full integration it can be obtained from TenantContext/JWT.
 */
@Component
public class TenantMdcFilter extends OncePerRequestFilter {

    public static final String MDC_KEY = "tenant_id";
    public static final String TENANT_HEADER = "X-Tenant-Id";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String tenantId = request.getHeader(TENANT_HEADER);
        try {
            if (tenantId != null && !tenantId.isBlank()) {
                MDC.put(MDC_KEY, tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
