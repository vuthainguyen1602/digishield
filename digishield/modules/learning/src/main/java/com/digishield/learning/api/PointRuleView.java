package com.digishield.learning.api;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * View of a gamification point rule for the admin gamification screen.
 *
 * @param action stable action key (e.g. {@code "lesson_completed"})
 * @param label  human-readable label
 * @param points points awarded (positive) or deducted (negative)
 */
public record PointRuleView(
        @JsonProperty("action") String action,
        @JsonProperty("label") String label,
        @JsonProperty("points") int points) {
}
