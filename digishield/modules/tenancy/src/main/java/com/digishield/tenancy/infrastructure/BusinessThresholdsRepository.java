package com.digishield.tenancy.infrastructure;

import com.digishield.tenancy.domain.BusinessThresholds;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link BusinessThresholds}.
 */
public interface BusinessThresholdsRepository extends JpaRepository<BusinessThresholds, UUID> {

    Optional<BusinessThresholds> findByTenantId(UUID tenantId);
}
