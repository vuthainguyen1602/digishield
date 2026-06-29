-- analytics: risk_signal (RiskSignal)
-- Behavioural signals per user (e.g. simulation clicks) that feed risk scoring.
-- -----------------------------------------------------------------------------
CREATE TABLE risk_signal (
    id          uuid PRIMARY KEY,
    tenant_id   uuid        NOT NULL,
    user_id     uuid        NOT NULL,
    type        varchar(40) NOT NULL,
    weight      integer     NOT NULL,
    occurred_at timestamptz NOT NULL
);
CREATE INDEX idx_risk_signal_tenant_user ON risk_signal (tenant_id, user_id);

-- Row-level security: isolate by tenant, matching the other module tables.
ALTER TABLE risk_signal ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_signal FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON risk_signal
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
