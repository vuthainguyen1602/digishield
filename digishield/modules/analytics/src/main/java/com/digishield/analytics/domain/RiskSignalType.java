package com.digishield.analytics.domain;

/**
 * A behavioural signal that contributes to a user's risk score. Each type
 * carries a default weight (higher = riskier); the score is the capped sum of a
 * user's recent signal weights.
 */
public enum RiskSignalType {

    /** The user clicked a simulated phishing link. */
    SIMULATION_CLICK(25);

    private final int defaultWeight;

    RiskSignalType(int defaultWeight) {
        this.defaultWeight = defaultWeight;
    }

    public int getDefaultWeight() {
        return defaultWeight;
    }
}
