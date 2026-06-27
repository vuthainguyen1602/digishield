package com.digishield.contracts.events;

import java.util.UUID;

/**
 * Emitted when a user's risk score is recomputed.
 */
public record RiskRecomputedEvent(UUID tenantId, UUID userId, int score) {
}
