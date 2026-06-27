package com.digishield.contracts.events;

import java.util.UUID;

/**
 * Emitted when a phishing report is confirmed as valid.
 */
public record PhishingReportConfirmedEvent(UUID tenantId, UUID reportId) {
}
