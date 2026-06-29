-- learning: point_rule (PointRule)
-- Per-tenant gamification point rules, shown on the admin gamification screen.
-- -----------------------------------------------------------------------------
CREATE TABLE point_rule (
    id        uuid         PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    action    varchar(64)  NOT NULL,
    label     varchar(255) NOT NULL,
    points    integer      NOT NULL
);
CREATE INDEX idx_point_rule_tenant ON point_rule (tenant_id);

-- Row-level security: isolate by tenant, matching the other module tables.
ALTER TABLE point_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rule FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON point_rule
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
