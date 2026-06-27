package com.digishield.shared.security;

/**
 * Shared role-name constants used across the entire DigiShield system.
 * Used for {@code @PreAuthorize("hasRole(Roles.ORG_ADMIN)")} or URL-based
 * authorization configuration.
 */
public final class Roles {

    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String ORG_ADMIN = "ORG_ADMIN";
    public static final String MANAGER = "MANAGER";
    public static final String CONTENT_EDITOR = "CONTENT_EDITOR";
    public static final String ANALYST = "ANALYST";
    public static final String LEARNER = "LEARNER";

    private Roles() {
    }
}
