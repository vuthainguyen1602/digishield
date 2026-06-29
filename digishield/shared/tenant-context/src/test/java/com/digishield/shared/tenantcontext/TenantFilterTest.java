package com.digishield.shared.tenantcontext;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link TenantFilter}: the tenant is taken from the JWT
 * {@code tid} claim, never from a client-supplied value.
 */
class TenantFilterTest {

    private final TenantFilter filter = new TenantFilter();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolvesTenantFromJwtTidClaim() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(TenantFilter.TENANT_CLAIM, "11111111-1111-1111-1111-111111111111")
                .build();
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(jwt, null));

        assertThat(filter.resolveTenantId()).isEqualTo("11111111-1111-1111-1111-111111111111");
    }

    @Test
    void returnsNullWhenNoAuthentication() {
        SecurityContextHolder.clearContext();

        assertThat(filter.resolveTenantId()).isNull();
    }

    @Test
    void returnsNullWhenPrincipalIsNotAJwt() {
        // A non-JWT principal (e.g. a forged username) must not yield a tenant.
        SecurityContextHolder.getContext()
                .setAuthentication(new TestingAuthenticationToken("someone", "creds"));

        assertThat(filter.resolveTenantId()).isNull();
    }

    @Test
    void returnsNullWhenJwtHasNoTidClaim() {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").claim("sub", "user-1").build();
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(jwt, null));

        assertThat(filter.resolveTenantId()).isNull();
    }
}
