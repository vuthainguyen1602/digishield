package com.digishield.ai.infrastructure;

import com.digishield.ai.domain.AidaRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for {@link AidaRun} history records.
 */
public interface AidaRunRepository extends JpaRepository<AidaRun, UUID> {

    /** Runs for a tenant, most recent first. */
    List<AidaRun> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
