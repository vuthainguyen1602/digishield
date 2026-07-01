-- tenancy: business_thresholds (BusinessThresholds)
-- Per-tenant business thresholds edited on the org-settings screen.
-- -----------------------------------------------------------------------------
CREATE TABLE business_thresholds (
    id                        uuid    PRIMARY KEY,
    tenant_id                 uuid    NOT NULL,
    risk_alert_score          integer NOT NULL,
    pass_score_pct            integer NOT NULL,
    min_campaigns_per_quarter integer NOT NULL
);
CREATE INDEX idx_business_thresholds_tenant ON business_thresholds (tenant_id);

-- Row-level security: isolate by tenant, matching the other module tables.
ALTER TABLE business_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_thresholds FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON business_thresholds
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
