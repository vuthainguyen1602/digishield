package com.digishield.tenancy.api;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * View / patch command for a tenant's business thresholds. On a PATCH any null
 * field is left unchanged. Fields are emitted/accepted as snake_case.
 *
 * @param riskAlertScore         risk score above which an admin alert is raised
 * @param passScorePct           minimum quiz score (percent) to issue a certificate
 * @param minCampaignsPerQuarter minimum simulation campaigns per quarter
 */
public record BusinessThresholdsView(
        @JsonProperty("risk_alert_score") Integer riskAlertScore,
        @JsonProperty("pass_score_pct") Integer passScorePct,
        @JsonProperty("min_campaigns_per_quarter") Integer minCampaignsPerQuarter) {
}
