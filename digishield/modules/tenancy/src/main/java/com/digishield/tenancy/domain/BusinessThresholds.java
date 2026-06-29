package com.digishield.tenancy.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Per-tenant business thresholds configured on the org-settings screen
 * (risk-alert score, pass score, minimum campaign cadence). One row per tenant.
 */
@Entity
@Table(name = "business_thresholds")
public class BusinessThresholds {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    /** Risk score above which an admin alert is raised (0..100). */
    @Column(name = "risk_alert_score", nullable = false)
    private int riskAlertScore;

    /** Minimum quiz score required to issue a certificate (percent). */
    @Column(name = "pass_score_pct", nullable = false)
    private int passScorePct;

    /** Minimum number of simulation campaigns per quarter. */
    @Column(name = "min_campaigns_per_quarter", nullable = false)
    private int minCampaignsPerQuarter;

    protected BusinessThresholds() {
        // Required by JPA.
    }

    public BusinessThresholds(UUID id, UUID tenantId, int riskAlertScore,
                              int passScorePct, int minCampaignsPerQuarter) {
        this.id = id;
        this.tenantId = tenantId;
        this.riskAlertScore = riskAlertScore;
        this.passScorePct = passScorePct;
        this.minCampaignsPerQuarter = minCampaignsPerQuarter;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public int getRiskAlertScore() {
        return riskAlertScore;
    }

    public void setRiskAlertScore(int riskAlertScore) {
        this.riskAlertScore = riskAlertScore;
    }

    public int getPassScorePct() {
        return passScorePct;
    }

    public void setPassScorePct(int passScorePct) {
        this.passScorePct = passScorePct;
    }

    public int getMinCampaignsPerQuarter() {
        return minCampaignsPerQuarter;
    }

    public void setMinCampaignsPerQuarter(int minCampaignsPerQuarter) {
        this.minCampaignsPerQuarter = minCampaignsPerQuarter;
    }
}
