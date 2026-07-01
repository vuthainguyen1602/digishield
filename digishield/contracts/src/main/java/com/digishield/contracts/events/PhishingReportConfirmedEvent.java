package com.digishield.contracts.events;

import java.util.UUID;

/**
 * Emitted when a phishing report is confirmed as valid.
 *
 * @param tenantId the tenant the report belongs to
 * @param userId   the user who submitted the report (the reporter)
 * @param reportId the confirmed report
 */
public record PhishingReportConfirmedEvent(UUID tenantId, UUID userId, UUID reportId) {
}
