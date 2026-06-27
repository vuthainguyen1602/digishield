# DigiShield Schema Audit — V001 vs JPA entities

Audit of every JPA `@Entity` under `modules/**` against the tables created in
`V2026.06.27.001__init.sql`. Naming follows Hibernate's snake_case strategy;
`@Column(name=...)` and `@Enumerated(EnumType.STRING)` (→ varchar) are respected.
This is the basis for the corrective migration `V2026.06.27.002__fe_alignment.sql`.

## Summary

- **24 `@Entity` classes** found. 4 of them are enums-or-supporting and already
  covered; 20 are persisted entities mapped in V001, **plus 3 entities that V001
  never created a table for**.
- **3 missing tables**: `department_risk`, `sim_campaign_funnel`, `sim_result`.
- **3 existing tables missing columns**: `app_user` (3), `sim_campaign` (1),
  `phishing_report` (6).
- All other 17 entities match V001 closely enough for Hibernate `validate`
  (see "Non-blocking notes").

## Missing tables (created in V002)

### `department_risk` (analytics — `DepartmentRisk`)
| column | type | notes |
|---|---|---|
| id | uuid | @Id, PK |
| tenant_id | uuid NOT NULL | |
| name | varchar(255) NOT NULL | |
| risk_score | integer NOT NULL | `int riskScore` |
| phish_prone_pct | double precision NOT NULL | `double phishPronePct` |
| headcount | integer NOT NULL | `int` |

### `sim_campaign_funnel` (simulation — `SimCampaignFunnel`)
| column | type | notes |
|---|---|---|
| campaign_id | uuid | @Id, PK |
| tenant_id | uuid NOT NULL | |
| delivered | bigint NOT NULL | `long` |
| opened | bigint NOT NULL | `long` |
| clicked | bigint NOT NULL | `long` |
| submitted | bigint NOT NULL | `long` |
| reported | bigint NOT NULL | `long` |

### `sim_result` (simulation — `SimResult`)
| column | type | notes |
|---|---|---|
| id | uuid | @Id, PK |
| tenant_id | uuid NOT NULL | |
| campaign_id | uuid NOT NULL | |
| user_id | uuid | nullable |
| user_name | varchar(255) NOT NULL | |
| department | varchar(255) | nullable |
| action | varchar(40) NOT NULL | `SimAction` enum (STRING) |
| learning_status | varchar(40) NOT NULL | `LearningStatus` enum (STRING) |

## Missing columns on existing tables (added in V002)

### `app_user` (auth — `AppUser`)
V001 had: id, tenant_id, email, role, status. Entity adds:
| column | type | notes |
|---|---|---|
| name | varchar(255) | nullable display name |
| department | varchar(255) | nullable |
| risk_score | integer | nullable cached score |

### `sim_campaign` (simulation — `SimCampaign`)
| column | type | notes |
|---|---|---|
| name | varchar(255) | nullable campaign name |

### `phishing_report` (reporting — `PhishingReport`)
V001 had: id, tenant_id, user_id, payload, ai_label, ai_confidence, status.
Entity adds:
| column | type | notes |
|---|---|---|
| reporter | varchar(255) | denormalized reporter name |
| subject | varchar(255) | reported message subject |
| sender | varchar(255) | reported sender address |
| ai_reason | text | `@Lob` String |
| blacklist_match | boolean NOT NULL | added with `DEFAULT false` for existing rows |
| reported_at | timestamptz | `Instant` |

## Non-blocking notes (no migration change needed)

Hibernate `validate` checks table/column **presence and type category**, not
varchar length, so the following are NOT validation failures and are left as-is
to avoid touching V001:

- `audit_log.ip`: V001 `varchar(64)` vs entity default `varchar(255)`.
- Various length-annotated strings (e.g. interception/notification `length=32`,
  `account_watch_entry.value` `length=128`) already match V001.
- `feature_flag`: Java field `key` correctly maps to column `flag_key` in both
  the entity and V001.

## ddl-auto decision

With V002 applied, every entity column has a matching table/column of the
correct type. Therefore the `pgdemo` profile uses **`ddl-auto: validate`**.
