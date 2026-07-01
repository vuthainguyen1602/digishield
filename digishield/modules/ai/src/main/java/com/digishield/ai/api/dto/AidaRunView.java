package com.digishield.ai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

/**
 * View of an AIDA orchestration run for the admin console's recent-runs panel.
 *
 * @param id        run identifier
 * @param scope     target scope (e.g. {@code "org"})
 * @param scopeId   optional id the scope refers to (emitted as {@code scope_id})
 * @param status    outcome (e.g. {@code "success"})
 * @param summary   human-readable summary of what the run did
 * @param createdAt when the run executed (emitted as {@code created_at})
 */
public record AidaRunView(
        @JsonProperty("id") UUID id,
        @JsonProperty("scope") String scope,
        @JsonProperty("scope_id") UUID scopeId,
        @JsonProperty("status") String status,
        @JsonProperty("summary") String summary,
        @JsonProperty("created_at") Instant createdAt) {
}
