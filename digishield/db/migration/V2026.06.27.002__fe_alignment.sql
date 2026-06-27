-- =============================================================================
-- DigiShield - Frontend-alignment migration (V2026.06.27.002)
--
-- V001 created one table per JPA entity, but three entities were added later to
-- back frontend screens and never received a table, and a handful of existing
-- tables gained new columns when the backend was extended to match the React UI.
-- This migration closes that drift so the app can boot with
-- `spring.jpa.hibernate.ddl-auto: validate` against PostgreSQL.
--
-- It mirrors the V001 conventions exactly:
--   * every table carries `tenant_id uuid NOT NULL`
--   * a primary key on the entity @Id column
--   * an index idx_<table>_tenant ON <table>(tenant_id)
--   * ENABLE + FORCE ROW LEVEL SECURITY
--   * a `tenant_isolation` policy comparing tenant_id against the
--     `app.tenant_id` GUC, cast from text to uuid (::uuid).
--
-- Column names/types match the Hibernate-mapped entities (snake_case fields,
-- @Enumerated(STRING) -> varchar, long -> bigint, double -> double precision,
-- Instant -> timestamptz, UUID -> uuid).
--
-- NOTE: in the `dev,pgdemo` demo the app connects as the `digishield` superuser,
-- which BYPASSES RLS, so these policies are inert there (single-tenant demo).
-- They are included so the schema is correct for real (non-superuser) prod use.
-- Keep this file IDENTICAL to the repo-root copy at db/migration/.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- analytics: department_risk (DepartmentRisk) -- NEW TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS department_risk (
    id              uuid PRIMARY KEY,
    tenant_id       uuid             NOT NULL,
    name            varchar(255)     NOT NULL,
    risk_score      integer          NOT NULL,
    phish_prone_pct double precision NOT NULL,
    headcount       integer          NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_department_risk_tenant ON department_risk (tenant_id);

-- -----------------------------------------------------------------------------
-- simulation: sim_campaign_funnel (SimCampaignFunnel) -- NEW TABLE
-- @Id is campaign_id (bigint counters: delivered/opened/clicked/submitted/reported)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sim_campaign_funnel (
    campaign_id uuid PRIMARY KEY,
    tenant_id   uuid   NOT NULL,
    delivered   bigint NOT NULL,
    opened      bigint NOT NULL,
    clicked     bigint NOT NULL,
    submitted   bigint NOT NULL,
    reported    bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sim_campaign_funnel_tenant ON sim_campaign_funnel (tenant_id);

-- -----------------------------------------------------------------------------
-- simulation: sim_result (SimResult) -- NEW TABLE
-- action -> SimAction (STRING enum); learning_status -> LearningStatus (STRING enum)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sim_result (
    id              uuid PRIMARY KEY,
    tenant_id       uuid         NOT NULL,
    campaign_id     uuid         NOT NULL,
    user_id         uuid,
    user_name       varchar(255) NOT NULL,
    department      varchar(255),
    action          varchar(40)  NOT NULL,
    learning_status varchar(40)  NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sim_result_tenant ON sim_result (tenant_id);

-- =============================================================================
-- Missing columns on existing tables (ADD COLUMN IF NOT EXISTS, idempotent)
-- =============================================================================

-- auth: app_user gained display name / department / cached risk score
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS name       varchar(255);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS department varchar(255);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS risk_score integer;

-- simulation: sim_campaign gained a human-readable campaign name
ALTER TABLE sim_campaign ADD COLUMN IF NOT EXISTS name varchar(255);

-- reporting: phishing_report gained SOC-inbox / SOC-drawer fields
ALTER TABLE phishing_report ADD COLUMN IF NOT EXISTS reporter        varchar(255);
ALTER TABLE phishing_report ADD COLUMN IF NOT EXISTS subject         varchar(255);
ALTER TABLE phishing_report ADD COLUMN IF NOT EXISTS sender          varchar(255);
ALTER TABLE phishing_report ADD COLUMN IF NOT EXISTS ai_reason       text;
ALTER TABLE phishing_report ADD COLUMN IF NOT EXISTS blacklist_match boolean NOT NULL DEFAULT false;
ALTER TABLE phishing_report ADD COLUMN IF NOT EXISTS reported_at     timestamptz;

-- =============================================================================
-- Row-Level Security for the three new tables (mirrors V001 form).
-- =============================================================================

ALTER TABLE department_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_risk FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON department_risk;
CREATE POLICY tenant_isolation ON department_risk
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE sim_campaign_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_campaign_funnel FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON sim_campaign_funnel;
CREATE POLICY tenant_isolation ON sim_campaign_funnel
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE sim_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_result FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON sim_result;
CREATE POLICY tenant_isolation ON sim_result
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
