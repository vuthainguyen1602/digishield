-- =============================================================================
-- DigiShield - Initial schema (V2026.06.27.001)
--
-- This is the INITIAL schema for the DigiShield platform. It creates one table
-- per JPA entity across all business modules. Columns, names and types are
-- generated to FULLY match the Hibernate-mapped entities so that the app can
-- boot with `spring.jpa.hibernate.ddl-auto: validate`.
--
-- Naming: Hibernate's default Spring physical naming strategy maps class names
-- and camelCase fields to snake_case (e.g. SimCampaign -> sim_campaign,
-- aiConfidence -> ai_confidence, computedAt -> computed_at).
--
-- Multi-tenancy: every table carries `tenant_id uuid NOT NULL`
-- (the entities map tenantId as a UUID). Tenants are isolated at the database
-- layer via PostgreSQL Row-Level Security (RLS). Each table has a
-- `tenant_isolation` policy that filters rows by the session GUC
-- `app.tenant_id`, which the application sets per transaction through
-- RlsTenantAspect (set_config('app.tenant_id', <tenant>, true)). The GUC is a
-- text string, so the policy casts it to uuid (::uuid) to compare it against
-- the uuid tenant_id column.
-- FORCE ROW LEVEL SECURITY is applied so the policy is enforced even for the
-- table owner / superuser (important for tests running as the owning role).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- auth: app_user (AppUser)
-- -----------------------------------------------------------------------------
CREATE TABLE app_user (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    email     varchar(255) NOT NULL,
    role      varchar(40)  NOT NULL,
    status    varchar(40)  NOT NULL
);
CREATE INDEX idx_app_user_tenant ON app_user (tenant_id);

-- -----------------------------------------------------------------------------
-- tenancy: tenant (Tenant)
-- -----------------------------------------------------------------------------
CREATE TABLE tenant (
    id          uuid PRIMARY KEY,
    tenant_id   uuid         NOT NULL,
    name        varchar(255) NOT NULL,
    tier        varchar(40)  NOT NULL,
    data_region varchar(255) NOT NULL,
    status      varchar(40)  NOT NULL,
    user_count  integer,
    domain      varchar(255)
);
CREATE INDEX idx_tenant_tenant ON tenant (tenant_id);

-- -----------------------------------------------------------------------------
-- tenancy: audit_log (AuditLog)
-- -----------------------------------------------------------------------------
CREATE TABLE audit_log (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    ts        timestamptz  NOT NULL,
    actor     varchar(255) NOT NULL,
    action    varchar(255) NOT NULL,
    target    varchar(255),
    ip        varchar(64),
    severity  varchar(40)  NOT NULL
);
CREATE INDEX idx_audit_log_tenant ON audit_log (tenant_id);

-- -----------------------------------------------------------------------------
-- tenancy: scim_config (ScimConfig)
-- -----------------------------------------------------------------------------
CREATE TABLE scim_config (
    id                uuid PRIMARY KEY,
    tenant_id         uuid         NOT NULL,
    idp_name          varchar(255) NOT NULL,
    connected         boolean      NOT NULL,
    idp_tenant_id     varchar(255),
    client_id         varchar(255),
    scim_endpoint     varchar(255),
    last_sync_at      timestamptz,
    synced_user_count integer,
    sync_error_count  integer
);
CREATE INDEX idx_scim_config_tenant ON scim_config (tenant_id);

-- -----------------------------------------------------------------------------
-- tenancy: feature_flag (FeatureFlag) -- field `key` maps to column flag_key
-- -----------------------------------------------------------------------------
CREATE TABLE feature_flag (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    flag_key  varchar(255) NOT NULL,
    enabled   boolean      NOT NULL
);
CREATE INDEX idx_feature_flag_tenant ON feature_flag (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: course (Course)
-- -----------------------------------------------------------------------------
CREATE TABLE course (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    title     varchar(255) NOT NULL,
    level     varchar(40)  NOT NULL,
    lang      varchar(255) NOT NULL
);
CREATE INDEX idx_course_tenant ON course (tenant_id);

-- learning: course extra columns (catalog meta + ordering)
ALTER TABLE course ADD COLUMN duration_min integer;
ALTER TABLE course ADD COLUMN lesson_count integer;
ALTER TABLE course ADD COLUMN sort_order   integer;

-- -----------------------------------------------------------------------------
-- learning: enrollment (Enrollment)
-- -----------------------------------------------------------------------------
CREATE TABLE enrollment (
    id        uuid PRIMARY KEY,
    tenant_id uuid        NOT NULL,
    user_id   uuid        NOT NULL,
    course_id uuid        NOT NULL,
    status    varchar(40) NOT NULL,
    score     integer,
    progress  integer
);
CREATE INDEX idx_enrollment_tenant ON enrollment (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: lesson (Lesson)
-- -----------------------------------------------------------------------------
CREATE TABLE lesson (
    id            uuid PRIMARY KEY,
    tenant_id     uuid          NOT NULL,
    course_id     uuid          NOT NULL,
    title         varchar(255)  NOT NULL,
    body          varchar(4000),
    example_title varchar(255),
    example_body  varchar(2000),
    closing       varchar(2000),
    checkpoints   varchar(1000),
    duration_min  integer,
    sort_order    integer
);
CREATE INDEX idx_lesson_tenant ON lesson (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: quiz_question (QuizQuestion)
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_question (
    id            uuid PRIMARY KEY,
    tenant_id     uuid          NOT NULL,
    lesson_id     uuid          NOT NULL,
    prompt        varchar(1000) NOT NULL,
    option_a      varchar(1000) NOT NULL,
    option_b      varchar(1000) NOT NULL,
    option_c      varchar(1000) NOT NULL,
    option_d      varchar(1000) NOT NULL,
    correct_index integer       NOT NULL,
    explanation   varchar(1000),
    sort_order    integer
);
CREATE INDEX idx_quiz_question_tenant ON quiz_question (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: certificate (Certificate)
-- -----------------------------------------------------------------------------
CREATE TABLE certificate (
    id           uuid PRIMARY KEY,
    tenant_id    uuid         NOT NULL,
    user_id      uuid         NOT NULL,
    course_id    uuid         NOT NULL,
    serial       varchar(255) NOT NULL,
    course_title varchar(255) NOT NULL,
    recipient    varchar(255) NOT NULL,
    score        integer,
    issued_at    timestamptz  NOT NULL,
    valid_until  timestamptz,
    verify_url   varchar(255)
);
CREATE INDEX idx_certificate_tenant ON certificate (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: badge (Badge)
-- -----------------------------------------------------------------------------
CREATE TABLE badge (
    id          uuid PRIMARY KEY,
    tenant_id   uuid         NOT NULL,
    user_id     uuid         NOT NULL,
    name        varchar(255) NOT NULL,
    description varchar(255),
    icon_ref    varchar(255),
    earned      boolean      NOT NULL,
    awarded_at  timestamptz
);
CREATE INDEX idx_badge_tenant ON badge (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: gamification_profile (GamificationProfile)
-- -----------------------------------------------------------------------------
CREATE TABLE gamification_profile (
    id           uuid PRIMARY KEY,
    tenant_id    uuid         NOT NULL,
    user_id      uuid         NOT NULL,
    display_name varchar(255) NOT NULL,
    department   varchar(255),
    points       integer      NOT NULL
);
CREATE INDEX idx_gamification_profile_tenant ON gamification_profile (tenant_id);

-- -----------------------------------------------------------------------------
-- learning: compliance_policy (CompliancePolicy)
-- -----------------------------------------------------------------------------
CREATE TABLE compliance_policy (
    id             uuid PRIMARY KEY,
    tenant_id      uuid         NOT NULL,
    name           varchar(255) NOT NULL,
    framework      varchar(255),
    due_rule       varchar(255),
    mandatory      boolean      NOT NULL,
    completion_pct integer      NOT NULL
);
CREATE INDEX idx_compliance_policy_tenant ON compliance_policy (tenant_id);

-- -----------------------------------------------------------------------------
-- simulation: sim_campaign (SimCampaign)
-- -----------------------------------------------------------------------------
CREATE TABLE sim_campaign (
    id          uuid PRIMARY KEY,
    tenant_id   uuid        NOT NULL,
    channel     varchar(40) NOT NULL,
    status      varchar(40) NOT NULL,
    template_id uuid
);
CREATE INDEX idx_sim_campaign_tenant ON sim_campaign (tenant_id);

-- -----------------------------------------------------------------------------
-- simulation: sim_event (SimEvent)
-- -----------------------------------------------------------------------------
CREATE TABLE sim_event (
    id          uuid PRIMARY KEY,
    tenant_id   uuid        NOT NULL,
    campaign_id uuid        NOT NULL,
    user_id     uuid        NOT NULL,
    action      varchar(40) NOT NULL,
    ts          timestamptz NOT NULL
);
CREATE INDEX idx_sim_event_tenant ON sim_event (tenant_id);

-- -----------------------------------------------------------------------------
-- reporting: phishing_report (PhishingReport)
-- -----------------------------------------------------------------------------
CREATE TABLE phishing_report (
    id            uuid PRIMARY KEY,
    tenant_id     uuid             NOT NULL,
    user_id       uuid             NOT NULL,
    payload       text,
    ai_label      varchar(40),
    ai_confidence double precision NOT NULL,
    status        varchar(40)      NOT NULL
);
CREATE INDEX idx_phishing_report_tenant ON phishing_report (tenant_id);

-- -----------------------------------------------------------------------------
-- reporting: blacklist_entry (BlacklistEntry)
-- -----------------------------------------------------------------------------
CREATE TABLE blacklist_entry (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    type      varchar(40)  NOT NULL,
    value     varchar(255) NOT NULL,
    source    varchar(255)
);
CREATE INDEX idx_blacklist_entry_tenant ON blacklist_entry (tenant_id);

-- -----------------------------------------------------------------------------
-- analytics: risk_score (RiskScore)
-- -----------------------------------------------------------------------------
CREATE TABLE risk_score (
    id          uuid PRIMARY KEY,
    tenant_id   uuid        NOT NULL,
    scope       varchar(40) NOT NULL,
    scope_id    uuid        NOT NULL,
    value       integer     NOT NULL,
    computed_at timestamptz NOT NULL
);
CREATE INDEX idx_risk_score_tenant ON risk_score (tenant_id);

-- -----------------------------------------------------------------------------
-- notification: notification (Notification)
-- -----------------------------------------------------------------------------
CREATE TABLE notification (
    id         uuid PRIMARY KEY,
    tenant_id  uuid          NOT NULL,
    user_id    uuid          NOT NULL,
    type       varchar(32)   NOT NULL,
    channel    varchar(32)   NOT NULL,
    status     varchar(32)   NOT NULL,
    title      varchar(255),
    body       varchar(2000),
    created_at timestamptz   NOT NULL
);
CREATE INDEX idx_notification_tenant ON notification (tenant_id);

-- -----------------------------------------------------------------------------
-- interception: account_watch_entry (AccountWatchEntry)
-- -----------------------------------------------------------------------------
CREATE TABLE account_watch_entry (
    id         uuid PRIMARY KEY,
    tenant_id  uuid         NOT NULL,
    type       varchar(32)  NOT NULL,
    value      varchar(128) NOT NULL,
    risk_level varchar(32)  NOT NULL,
    source     varchar(128)
);
CREATE INDEX idx_account_watch_entry_tenant ON account_watch_entry (tenant_id);

-- -----------------------------------------------------------------------------
-- interception: intervention_event (InterventionEvent)
-- -----------------------------------------------------------------------------
CREATE TABLE intervention_event (
    id        uuid PRIMARY KEY,
    tenant_id uuid          NOT NULL,
    user_id   uuid          NOT NULL,
    signals   varchar(1000),
    decision  varchar(32)   NOT NULL,
    ts        timestamptz   NOT NULL
);
CREATE INDEX idx_intervention_event_tenant ON intervention_event (tenant_id);

-- =============================================================================
-- Row-Level Security: enable + FORCE on every table, and a tenant_isolation
-- policy comparing the uuid tenant_id against the app.tenant_id GUC, which is
-- cast from text to uuid (::uuid).
-- =============================================================================

ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_user FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app_user
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE feature_flag ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON feature_flag
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE course FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON course
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON enrollment
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE sim_campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_campaign FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sim_campaign
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE sim_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_event FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sim_event
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE phishing_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_report FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON phishing_report
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE blacklist_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist_entry FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON blacklist_entry
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE risk_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_score FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON risk_score
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notification
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE account_watch_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_watch_entry FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON account_watch_entry
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE intervention_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_event FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON intervention_event
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE lesson ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON lesson
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE quiz_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON quiz_question
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE certificate ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON certificate
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE badge ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON badge
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE gamification_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_profile FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON gamification_profile
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE compliance_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_policy FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON compliance_policy
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_log
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE scim_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_config FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scim_config
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
