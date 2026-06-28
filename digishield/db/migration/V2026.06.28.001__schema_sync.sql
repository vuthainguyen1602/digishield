-- Sync the schema with the JPA entity model. The earlier migrations drifted from
-- the entities, so `spring.jpa.hibernate.ddl-auto: validate` failed on the dev
-- deploy (missing tables/columns). Column types match Hibernate's expectations.

-- -----------------------------------------------------------------------------
-- Missing columns on existing tables
-- -----------------------------------------------------------------------------
ALTER TABLE account_watch_entry ADD COLUMN added_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE app_user            ADD COLUMN department_id uuid;
ALTER TABLE app_user            ADD COLUMN locale        varchar(255);
ALTER TABLE phishing_report     ADD COLUMN converted_to_training boolean;

-- -----------------------------------------------------------------------------
-- Missing tables (present as entities, absent from the schema)
-- -----------------------------------------------------------------------------
CREATE TABLE ai_template (
    id         uuid PRIMARY KEY,
    tenant_id  uuid         NOT NULL,
    subject    varchar(255) NOT NULL,
    body_ref   varchar(255) NOT NULL,
    channel    varchar(255) NOT NULL,
    difficulty varchar(255) NOT NULL,
    status     varchar(255) NOT NULL
);
CREATE INDEX idx_ai_template_tenant ON ai_template (tenant_id);

CREATE TABLE assessment (
    id             uuid PRIMARY KEY,
    tenant_id      uuid         NOT NULL,
    type           varchar(255) NOT NULL,
    period         varchar(255),
    questions_json varchar(8000),
    response_count integer      NOT NULL,
    anonymous      boolean      NOT NULL
);
CREATE INDEX idx_assessment_tenant ON assessment (tenant_id);

CREATE TABLE coaching_page (
    id           uuid PRIMARY KEY,
    tenant_id    uuid NOT NULL,
    template_id  uuid,
    content_ref  varchar(255),
    signals_json varchar(8000)
);
CREATE INDEX idx_coaching_page_tenant ON coaching_page (tenant_id);

CREATE TABLE plan (
    id           uuid PRIMARY KEY,
    name         varchar(255) NOT NULL,
    features_json varchar(4000),
    limits_json   varchar(4000)
);

CREATE TABLE subscription (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    plan_id   uuid         NOT NULL,
    status    varchar(255) NOT NULL,
    renews_at date
);
CREATE INDEX idx_subscription_tenant ON subscription (tenant_id);

CREATE TABLE tenant_group (
    id           uuid PRIMARY KEY,
    tenant_id    uuid         NOT NULL,
    name         varchar(255) NOT NULL,
    rule_json    varchar(4000),
    member_count integer
);
CREATE INDEX idx_tenant_group_tenant ON tenant_group (tenant_id);

CREATE TABLE tenant_settings (
    id             uuid PRIMARY KEY,
    tenant_id      uuid NOT NULL,
    default_locale varchar(255),
    branding_json  varchar(4000),
    policy_json    varchar(4000)
);
CREATE INDEX idx_tenant_settings_tenant ON tenant_settings (tenant_id);

CREATE TABLE threat_intel (
    id                    uuid PRIMARY KEY,
    tenant_id             uuid NOT NULL,
    source                varchar(255),
    raw_payload           oid,
    collected_at          timestamptz,
    converted_template_id uuid
);
CREATE INDEX idx_threat_intel_tenant ON threat_intel (tenant_id);

CREATE TABLE usage_metering (
    id        uuid PRIMARY KEY,
    tenant_id uuid         NOT NULL,
    metric    varchar(255) NOT NULL,
    period    varchar(255) NOT NULL,
    value     bigint       NOT NULL
);
CREATE INDEX idx_usage_metering_tenant ON usage_metering (tenant_id);
