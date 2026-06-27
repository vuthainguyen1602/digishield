package com.digishield.contracts.events;

import java.util.UUID;

/**
 * Emitted when a user clicks a link in a phishing simulation campaign.
 */
public record UserClickedSimulationEvent(UUID tenantId, UUID userId, UUID campaignId) {
}
