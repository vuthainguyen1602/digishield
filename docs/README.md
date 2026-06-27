# DigiShield (Digital Shield) — Project Dossier

A platform for prevention, training, and alerting against cyber fraud — for Enterprises, Government Agencies, and Schools.

Updated: 27/06/2026

## Document Index

### 1. Background & Research
- **Scam_Awareness_Training_Vietnam.docx** — Awareness & training material: common fraud scenarios in Vietnam, warning signs, and prevention methods (sources: Ministry of Public Security / NCSC).

### 2. Product Proposal
- **DigiShield_Product_Technical_Spec_v2.docx** — Consolidated document (primary): overview, features, technical specification, roadmap, business, and backlog.
- **DigiShield_Product_Proposal.docx** — Initial product proposal (for reference).
- **DigiShield_Feature_Enhancements.docx** — Advanced features referenced from KnowBe4 & Proofpoint (for reference).

### 3. Technical Design (for development)
- **DigiShield_Technical_Design.md** — Design document (19 chapters, ~29 Mermaid diagrams): architecture, ER, sequence, state, flowchart, use case, BPMN, DFD, and **Chapter 19 — Multi-tenant SaaS Architecture** (Pool/Bridge/Silo isolation models, Row-Level Security, tenant lifecycle, billing). Includes a description of each diagram.
- **DigiShield_openapi.yaml** — OpenAPI 3.0 API specification (**56 endpoints, 30 schemas**, including Auth/MFA, business operations, and Tenancy/Billing) — import into Swagger/Postman or generate an SDK.
- **DigiShield_bpmn_incident_response.bpmn** — Report handling & alert dispatch process.
- **DigiShield_bpmn_content_approval.bpmn** — AI content approval process.
- **DigiShield_bpmn_sim_campaign.bpmn** — Simulation campaign process.
  > Open the .bpmn files with demo.bpmn.io or Camunda Modeler.
- **DigiShield_MultiTenant_Implementation_Guide.md** — Multi-tenant **implementation** guide (engineering + infrastructure + runbook): PostgreSQL RLS, tenant context middleware, provisioning, per-tier deployment (Pool/Bridge/Silo/on-prem), multi-tenant CI/CD migration, BYOK, isolation testing, and provision/suspend/offboard runbooks.
- **DigiShield_ADR.md** — Architecture decision log. **ADR-001:** Modular Monolith oriented toward gradual extraction (instead of full microservices/serverless). **ADR-002:** backend **Java 21 (LTS) + Spring Boot + Spring Modulith** — rationale, trade-offs, and alternatives considered. **ADR-003:** choosing **Flyway** (not Liquibase) for database migration.
- **DigiShield_Architecture_Deploy_CICD.md** — Realization of ADR-001 & ADR-002 (Java/Spring): Gradle multi-module + Spring Modulith directory architecture, tenant context in Spring, container packaging (1 image · api/worker/scheduler profiles), Helm (cloud & on-prem/air-gapped), CI/CD (Modulith verify + tenant isolation testing, GitOps, offline bundle).

### 4. Interface Design
- **DigiShield_UIUX_Spec.md** — UI/UX specification: design system, app shell, complete wireframes for 6 roles (Admin, Manager, Analyst, Content Editor, Super Admin, Learner) plus auth, mobile, intervention SDK, and error states.

### 5. Code Skeleton
- **digishield-skeleton/** — Backend: Gradle multi-module + Spring Modulith skeleton (Java 21, Spring Boot 3.5) realizing ADR-001 & ADR-002: 16 subprojects (boot/app, contracts, 5 shared, 9 business modules), convention plugin in buildSrc, tenant-context + RLS aspect, inter-module events (Modulith events), Dockerfile/Helm/CI, JaCoCo, Checkstyle, UT (`*Test`) + IT (`*IT`, Testcontainers), sample Flyway migrations. See `digishield-skeleton/README.md`. Build: `gradle wrapper --gradle-version 8.11` then `./gradlew build`.
- **frontend/** — Frontend: monorepo-lite skeleton (Vite + React 18 + TypeScript) per ADR-004: design tokens from the UI/UX spec, App Shell with role-based navigation, RBAC routing for 6 roles, shared UI components, sample pages (Login, Admin Dashboard, Learner Portal, Quiz, SOC Inbox), and a typed API client generated from `DigiShield_openapi.yaml` (orval / TanStack Query). Separate pnpm toolchain & CI — NOT a Gradle subproject. Run: `pnpm install && pnpm dev`.

## Suggested Next Steps
- Generate the server code skeleton (NestJS) + client SDK from `DigiShield_openapi.yaml`.
- Build an HTML/Figma prototype from `DigiShield_UIUX_Spec.md`.
- Plan sprints from the backlog section in the consolidated document v2.

---
*The .md documents are best viewed with a Markdown viewer (VS Code, Obsidian) to render tables & Mermaid diagrams.*
