/**
 * Risk analytics and benchmarking module.
 * <p>
 * Computes risk scores by scope (user / department / organization) from
 * behavioural signals and emits {@code RiskRecomputedEvent}. Listens for
 * {@code UserClickedSimulationEvent} (risk-raising) and
 * {@code PhishingReportConfirmedEvent} (risk-lowering), recording each as a
 * signal and recomputing the affected user's score.
 */
@org.springframework.modulith.ApplicationModule(
        displayName = "Analytics",
        allowedDependencies = {
                "contracts :: events",
                "contracts :: dto",
                "shared :: tenant-context",
                "shared :: messaging"
        }
)
package com.digishield.analytics;
