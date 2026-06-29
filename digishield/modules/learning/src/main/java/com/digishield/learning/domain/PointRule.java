package com.digishield.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * A gamification point rule: how many points a given user action awards (or
 * deducts). Configured per tenant and shown on the admin gamification screen.
 */
@Entity
@Table(name = "point_rule")
public class PointRule {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    /** Stable action key, e.g. {@code "lesson_completed"}. */
    @Column(name = "action", nullable = false)
    private String action;

    /** Human-readable label for the action. */
    @Column(name = "label", nullable = false)
    private String label;

    /** Points awarded (positive) or deducted (negative) for the action. */
    @Column(name = "points", nullable = false)
    private int points;

    protected PointRule() {
        // Required by JPA.
    }

    public PointRule(UUID id, UUID tenantId, String action, String label, int points) {
        this.id = id;
        this.tenantId = tenantId;
        this.action = action;
        this.label = label;
        this.points = points;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public String getAction() {
        return action;
    }

    public String getLabel() {
        return label;
    }

    public int getPoints() {
        return points;
    }
}
