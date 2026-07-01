package com.digishield.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * A single behavioural signal for a user (e.g. clicking a simulated phishing
 * link). Signals are the raw input to risk-score computation. Each record
 * belongs to a tenant.
 */
@Entity
@Table(name = "risk_signal")
public class RiskSignal {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private RiskSignalType type;

    @Column(name = "weight", nullable = false)
    private int weight;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected RiskSignal() {
        // Required by JPA.
    }

    public RiskSignal(UUID id, UUID tenantId, UUID userId, RiskSignalType type, int weight, Instant occurredAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.userId = userId;
        this.type = type;
        this.weight = weight;
        this.occurredAt = occurredAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public UUID getUserId() {
        return userId;
    }

    public RiskSignalType getType() {
        return type;
    }

    public int getWeight() {
        return weight;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }
}
