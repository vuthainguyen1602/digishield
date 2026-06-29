package com.digishield.analytics.domain;

/**
 * A behavioural signal that contributes to a user's risk score. Each type
 * carries a default weight (higher = riskier); the score is the capped sum of a
 * user's recent signal weights.
 */
public enum RiskSignalType {

    /** The user clicked a simulated phishing link (risky → raises the score). */
    SIMULATION_CLICK(25),

    /** The user reported an email later confirmed as a real threat (vigilant → lowers the score). */
    PHISHING_REPORT_CONFIRMED(-15);

    private final int defaultWeight;

    RiskSignalType(int defaultWeight) {
        this.defaultWeight = defaultWeight;
    }

    public int getDefaultWeight() {
        return defaultWeight;
    }
}
