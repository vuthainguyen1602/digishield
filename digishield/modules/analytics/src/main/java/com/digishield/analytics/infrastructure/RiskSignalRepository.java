package com.digishield.analytics.infrastructure;

import com.digishield.analytics.domain.RiskSignal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for {@link RiskSignal}.
 */
public interface RiskSignalRepository extends JpaRepository<RiskSignal, UUID> {

    /**
     * Signals for a user within the scoring window (those at or after
     * {@code since}).
     */
    List<RiskSignal> findByTenantIdAndUserIdAndOccurredAtAfter(UUID tenantId, UUID userId, Instant since);
}
