-- ai: aida_run (AidaRun)
-- History of AIDA orchestration runs, surfaced in the admin console.
-- -----------------------------------------------------------------------------
CREATE TABLE aida_run (
    id         uuid PRIMARY KEY,
    tenant_id  uuid         NOT NULL,
    scope      varchar(40)  NOT NULL,
    scope_id   uuid,
    status     varchar(40)  NOT NULL,
    summary    varchar(500),
    created_at timestamptz  NOT NULL
);
CREATE INDEX idx_aida_run_tenant ON aida_run (tenant_id);

-- Row-level security: isolate by tenant, matching the other module tables.
ALTER TABLE aida_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE aida_run FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON aida_run
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
