# DigiShield Frontend

Web frontend for **DigiShield (Digital Shield)** — prevention, training and
alerting against online scams. Built with **React 18 + TypeScript (strict) +
Vite 5**, data fetching via **TanStack Query v5**, routing via
**react-router-dom v6**, HTTP via **axios**.

> **Monorepo-lite.** This frontend is a self-contained toolchain (pnpm + Vite),
> **not** a Gradle subproject. It can be built and shipped independently, or its
> `dist/` bundled into the backend (`boot/app`) static resources for an on-prem,
> single-artifact deployment — see **ADR-004**.

---

## Prerequisites

- Node.js **>= 20**
- **pnpm >= 9** (`corepack enable` then `corepack prepare pnpm@latest --activate`)

## Getting started

```bash
pnpm install            # install dependencies
cp .env.example .env    # set VITE_API_BASE_URL
pnpm gen:api            # generate the typed API client from the OpenAPI spec
pnpm dev                # start the dev server (http://localhost:5173)
```

### Scripts

| Script            | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `pnpm dev`        | Vite dev server with HMR                             |
| `pnpm build`      | Type-check + production build to `dist/`             |
| `pnpm preview`    | Preview the production build locally                 |
| `pnpm lint`       | ESLint (typescript-eslint + react-hooks + prettier)  |
| `pnpm typecheck`  | `tsc` strict type-check, no emit                     |
| `pnpm test`       | Run the Vitest suite once                            |
| `pnpm format`     | Format source with Prettier                          |
| `pnpm gen:api`    | Generate the API client from the OpenAPI spec        |

---

## Project structure

```
frontend/
├─ index.html
├─ orval.config.ts            # OpenAPI -> typed react-query client config
├─ vite.config.ts             # Vite + Vitest (jsdom), '@' -> src alias
├─ src/
│  ├─ main.tsx                # entry: mounts <AppProviders><App/></AppProviders>
│  ├─ app/
│  │  ├─ App.tsx              # wires the axios 401 handler, renders the router
│  │  ├─ providers.tsx        # QueryClientProvider > BrowserRouter > AuthProvider
│  │  ├─ router.tsx           # routes + lazy feature pages + RBAC guards
│  │  └─ auth/                # AuthContext, useAuth, RequireRole, roles
│  ├─ shared/
│  │  ├─ api/                 # axios client (mutator), queryClient, auth bridge
│  │  ├─ styles/              # tokens.css (design tokens) + globals.css
│  │  └─ ui/                  # Button, Card, KpiTile, StatusPill, DataTable, AppShell…
│  ├─ features/               # feature pages (owned by the feature workstream)
│  │  ├─ auth/LoginPage.tsx
│  │  ├─ dashboard/AdminDashboardPage.tsx
│  │  ├─ learning/LearnerPortalPage.tsx
│  │  ├─ learning/QuizPage.tsx
│  │  └─ reporting/SocInboxPage.tsx
│  ├─ api/generated/          # orval output (git-ignored; see its README)
│  └─ test/setup.ts           # Vitest + Testing Library setup
└─ .github/workflows/frontend-ci.yml
```

The `@` path alias maps to `src/` (configured in both `tsconfig.json` and
`vite.config.ts`).

---

## API client generation (orval)

The HTTP client is **generated**, never hand-written:

```bash
pnpm gen:api
```

This reads the contract at `../docs/DigiShield_openapi.yaml` and emits typed
TanStack Query hooks into `src/api/generated/` (split per OpenAPI tag), with
models under `src/api/generated/model/`. Every request is routed through our
hand-written axios instance `src/shared/api/client.ts` (the orval **mutator**),
which applies:

- `baseURL` from `VITE_API_BASE_URL`,
- `Authorization: Bearer <token>` and `X-Tenant-Id` request headers,
- centralized **401** handling (clears auth + redirects to `/login`).

The generated folder is git-ignored (a build artifact). Regenerate it after
`pnpm install` or wire `gen:api` into CI / a `postinstall` hook. See
`src/api/generated/README.md`.

---

## Connect to the live backend (dev)

Four main screens read **real data** from the backend dev profile via
hand-written typed fetchers + TanStack Query hooks (no orval codegen required for
these):

1. **Run the backend** (H2, `permitAll`, CORS for `:5173`, seeded demo tenant):

   ```bash
   ./gradlew bootRun --args='--spring.profiles.active=dev'   # serves http://localhost:8080
   ```

2. **Point the frontend at it** — in `frontend/.env`:

   ```
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

   then `pnpm dev`.

3. **Tenant alignment.** The dev data is seeded under the demo tenant
   `11111111-1111-1111-1111-111111111111`. The demo login sets the current user's
   `tenantId` to this UUID, and the axios client falls back to it in dev when no
   user is set, so every request carries the correct `X-Tenant-Id`
   (`src/shared/api/tenant.ts`).

These screens now use live data (with loading / error / empty states):

| Screen                | Hook                  | Endpoint                  |
| --------------------- | --------------------- | ------------------------- |
| Admin Dashboard       | `useDashboard()`      | `GET /analytics/dashboard`|
| SOC Inbox             | `usePhishingReports()`| `GET /reports/phishing`   |
| Course Catalog        | `useCourses()`        | `GET /courses`            |
| Alert Center + bell   | `useNotifications()`  | `GET /notifications`      |

Other screens still render local mock data (out of scope for now).

---

## Design-token system

All colors, spacing, typography and radii live as CSS custom properties in
`src/shared/styles/tokens.css`. Components **never** hard-code hex values — they
reference semantic tokens (e.g. `var(--color-primary)`, `var(--risk-high)`), so a
future dark theme only needs to redefine the variables.

Key tokens:

| Token             | Value     | Use                          |
| ----------------- | --------- | ---------------------------- |
| `--color-navy`    | `#12284B` | Sidebar, headings            |
| `--color-blue`    | `#2E75B6` | Primary actions / links      |
| `--color-teal`    | `#0E7C66` | Accent / avatars             |
| `--color-red`     | `#C00000` | Danger / threats             |
| `--color-amber`   | `#B26A00` | Warnings                     |
| `--color-bg`      | `#F7F9FC` | App background               |
| `--color-surface` | `#FFFFFF` | Cards / panels               |
| `--color-border`  | `#E2E8F0` | Dividers                     |
| `--color-text`    | `#1F2937` | Body text                    |
| `--color-muted`   | `#6B7280` | Secondary text               |

**Risk scale (0–100):** `0–39` green `#2E7D32`, `40–69` amber, `70–100` red —
implemented by `riskToVariant()` and `StatusPill` (`safe` / `warning` / `threat`
/ `neutral`). Font: **Inter**.

---

## RBAC & routing

Roles (org-scoped JWT): `super_admin`, `org_admin`, `manager`,
`content_editor`, `analyst`, `learner` (see `src/app/auth/roles.ts`).

Auth state (current user `{ id, tenantId, role }` + in-memory token) lives in
`AuthContext`. The `<RequireRole allow={[...]}>` guard:

- redirects unauthenticated users to `/login` (preserving the attempted path),
- redirects authenticated users without the role to `/403`.

| Route             | Allowed roles                          | Page                    |
| ----------------- | -------------------------------------- | ----------------------- |
| `/login`          | public                                 | `LoginPage`             |
| `/admin`          | `org_admin`, `manager`, `super_admin`  | `AdminDashboardPage`    |
| `/learn`          | `learner`                              | `LearnerPortalPage`     |
| `/learn/quiz/:id` | `learner`                              | `QuizPage`              |
| `/soc`            | `analyst`                              | `SocInboxPage`          |
| `/`               | redirect to the role's landing page    | —                       |

The sidebar navigation is filtered from a single permission map
(`NAV_ITEMS` in `roles.ts`).

---

## Testing

Vitest (jsdom) + Testing Library. Setup in `src/test/setup.ts`; see
`src/shared/ui/Button.test.tsx` for a sample. Run with `pnpm test`.
