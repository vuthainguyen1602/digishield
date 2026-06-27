package com.digishield.contracts.events;

import java.util.UUID;

/**
 * Emitted when a user is assigned to a course.
 */
public record EnrollmentAssignedEvent(UUID tenantId, UUID userId, UUID courseId) {
}
