package com.digishield.shared.persistence;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Shared persistence-layer configuration: enables JPA repositories and
 * AspectJ auto-proxy so {@link RlsTenantAspect} works.
 * <p>
 * Business modules can override {@code basePackages} if they need to scan
 * repositories in their own package.
 */
@Configuration
@EnableAspectJAutoProxy
@EnableJpaRepositories(basePackages = "com.digishield")
public class PersistenceConfig {
}
