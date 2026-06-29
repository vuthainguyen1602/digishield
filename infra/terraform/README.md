# DigiShield infrastructure (Terraform)

Provisions the AWS infrastructure the Helm chart + CD pipeline expect, per
environment (`dev`, `prod`):

- **VPC** (public/private subnets, NAT) — `network.tf`
- **EKS** cluster + managed node group + IRSA OIDC — `eks.tf`
- **RDS PostgreSQL** (+ SG, private) — `rds.tf`
- **ElastiCache Redis** (TLS + auth token, private) — `redis.tf`
- **Secrets Manager** `digishield/<env>/db` and `/redis` — `secrets.tf`
- **Cognito** user pool + SPA client + role groups (`super_admin`, `org_admin`,
  `analyst`, `learner`) — `cognito.tf`. Drives the app's auth/RBAC.
- **IAM IRSA roles**: External Secrets Operator (`iam_irsa.tf`) **and** AWS Load
  Balancer Controller (`lb_controller.tf`), plus the GitHub Actions OIDC deploy
  role (`iam_github_oidc.tf`).
- **NLB Elastic IPs**: static EIPs the ingress-nginx NLB binds to, so the public
  IPs survive add-on reinstalls — `lb_controller.tf`.
- **Frontend CDN**: private S3 bucket + CloudFront (OAC, SPA fallback) for the
  React/Vite SPA — `frontend_cdn.tf`. CloudFront also routes `/api/*` to the
  backend (same-origin) via `backend_api_origin_domain`. Set custom SPA domains
  via `frontend_domain_aliases` + `frontend_acm_certificate_arn` (ACM in
  us-east-1).

> Placeholders (`<ACCOUNT_ID>`, sizes, region, CIDRs) live in `envs/*.tfvars`
> and `envs/*.hcl`. Review and run `terraform plan` before `apply`.

## How this fits together (read first)

**The CD pipelines do NOT run Terraform.** `cd.yml` / `frontend-cd.yml` only
deploy the app (build image → `helm upgrade`, `s3 sync` → CloudFront
invalidation) and assume the infrastructure already exists — that is why they are
gated by `DEPLOY_ENABLED`. Provisioning is a **deliberate, manual** step
(infra changes are high-risk and want a reviewed `plan`), so you run Terraform
yourself the first time and whenever infra changes.

This README is the per-resource reference. For the **canonical end-to-end dev
bring-up** (Terraform → add-ons → TLS cert → DNS → Cognito users → CD), follow
[`../RUNBOOK-dev.md`](../RUNBOOK-dev.md). The shape of a dev-only setup (prod
stays off, see the prod gate):

1. **Bootstrap** the remote-state bucket + lock table (once per account).
2. **Provision** dev infra with Terraform (`apply`).
3. **Install cluster add-ons** with [`../bootstrap-addons.sh`](../bootstrap-addons.sh):
   External Secrets Operator (+ ClusterSecretStore), the AWS Load Balancer
   Controller, and ingress-nginx fronted by an NLB on the static EIPs.
4. **Issue the TLS cert** (Let's Encrypt via DuckDNS DNS-01) and **point DNS** at
   an NLB EIP — operator steps, see the runbook.
5. **Add Cognito users** to role groups (the user pool is Terraform-managed).
6. **Wire `terraform output` → GitHub** variables/secret (table below), set
   `DEPLOY_ENABLED=true`, push to `main` → CD deploys backend + frontend.

Prerequisites on your machine: AWS CLI (logged in), `terraform`, `kubectl`,
`helm`, plus an acme.sh checkout for the TLS step. Get the account id with
`aws sts get-caller-identity`.

## 1. Bootstrap remote state (once per account)

The S3 state bucket + DynamoDB lock table referenced in `envs/backend-*.hcl`
must exist before `terraform init`. Replace `<ACCOUNT_ID>` in
`envs/backend-dev.hcl` to match, then:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=ap-southeast-1

aws s3 mb "s3://digishield-tfstate-$ACCOUNT_ID" --region "$REGION"
aws s3api put-bucket-versioning \
  --bucket "digishield-tfstate-$ACCOUNT_ID" \
  --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name digishield-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region "$REGION"
```

## 2. Provision infrastructure

```bash
cd infra/terraform

# --- dev (also creates the account-global GitHub OIDC provider) ---
terraform init -backend-config=envs/backend-dev.hcl
terraform plan  -var-file=envs/dev.tfvars   # review first
terraform apply -var-file=envs/dev.tfvars

# --- prod (separate state; only when you actually ship prod) ---
terraform init -reconfigure -backend-config=envs/backend-prod.hcl
terraform apply -var-file=envs/prod.tfvars
```

EKS + RDS take ~15–20 min. Secrets Manager `digishield/<env>/db` and `/redis`
are populated automatically (generated passwords) — no manual secret creation.
`apply` also grants the apply-er cluster-admin
(`enable_cluster_creator_admin_permissions`), so no manual EKS access entry is
needed before `kubectl`.

> **Free-plan note (dev):** `dev.tfvars` pins free-tier-eligible classes —
> `m7i-flex.large` for the node (t3.large is blocked) and `db.t3.micro` for RDS.
> The RDS engine is pinned to an available `16.x`. The CloudFront `/api/*` origin
> is the NLB's stable AWS DNS name over HTTP (no ACM cert exists for an
> `*.elb.amazonaws.com` name; viewer→CloudFront stays HTTPS).

## 3. Cluster add-ons (after EKS exists)

Run the bootstrap script — it reads Terraform outputs and is idempotent:

```bash
./infra/bootstrap-addons.sh
```

It installs:

- **External Secrets Operator** (+ the `aws-secretsmanager` ClusterSecretStore),
  annotated with the ESO IRSA role so it can read Secrets Manager.
- **AWS Load Balancer Controller** (IRSA role from `lb_controller.tf`).
- **ingress-nginx**, fronted by an internet-facing **NLB pinned to the static
  EIPs**, cross-zone across the public subnets.

It prints the EIP allocation ids. There is **no ALB** — the API is served through
the ingress-nginx NLB.

## 4. Wire outputs to GitHub Actions

After `apply`, `terraform output` gives everything the app side needs:

| Output | Where it goes |
|--------|---------------|
| `eks_cluster_name` | GitHub Actions **variable** `EKS_CLUSTER_NAME` |
| `region` | GitHub Actions **variable** `AWS_REGION` |
| `github_deploy_role_arn` | GitHub Actions **secret** `AWS_DEPLOY_ROLE_ARN` (repo-level + per Environment) |
| `frontend_bucket` | GitHub Actions **variable** `FRONTEND_BUCKET` (FE CD runs `aws s3 sync frontend/dist s3://<this>`) |
| `frontend_distribution_id` | GitHub Actions **variable** `FRONTEND_DISTRIBUTION_ID` (FE CD invalidates this after sync) |
| `cognito_issuer_uri` | GH var `VITE_COGNITO_AUTHORITY` **and** Helm `auth.issuerUri` (`values-dev.yaml`) |
| `cognito_spa_client_id` | GitHub Actions **variable** `VITE_COGNITO_CLIENT_ID` |
| `cognito_user_pool_id` | used by the Cognito-user admin commands (runbook step 5) |
| `rds_endpoint` | `deploy/helm/digishield/values-<env>.yaml` → `database.url` |
| `redis_endpoint` | `values-<env>.yaml` → `redis.host` |
| `external_secrets_irsa_role_arn` | consumed by `bootstrap-addons.sh` (ESO SA annotation) |
| `lb_controller_role_arn` | consumed by `bootstrap-addons.sh` (LBC SA annotation) |
| `nlb_eip_allocation_ids` / `public_subnet_ids` | consumed by `bootstrap-addons.sh` (NLB binding) |
| `secrets_manager_prefix` | matches Helm `externalSecrets.remotePrefix` (`digishield/<env>`) |
| `frontend_url` | public SPA URL (custom domain if set, else `*.cloudfront.net`) |

Also set the API base path: GH var `VITE_API_BASE_URL=/api/v1` (same-origin).
`frontend_bucket` / `frontend_distribution_id` should be set as **per-Environment**
variables (`dev` / `production`), since each env has its own bucket and
distribution.

The app image lives in **GHCR** (`ghcr.io/<owner>/digishield/app`), not ECR.
Since the package is private, add a GitHub Actions **secret** `GHCR_PULL_TOKEN` =
a PAT with `read:packages`. `cd.yml` uses it to create the in-cluster
`ghcr-pull` `docker-registry` secret (referenced by the Helm chart's
`imagePullSecrets`) so EKS can pull the image.

## 5. Enable and trigger deploys

Set the repo variable **`DEPLOY_ENABLED=true`** so `cd.yml` runs the real
`helm upgrade` instead of the placeholder, then push to `main` (or re-run the CD
workflows). Backend deploys to EKS and the SPA syncs to S3 + CloudFront.

**Production is double-gated.** The `deploy-prod` jobs (in `cd.yml` and
`frontend-cd.yml`) are skipped entirely unless **`PROD_DEPLOY_ENABLED=true`**,
on top of the `production` GitHub Environment's required-reviewer approval. Leave
`PROD_DEPLOY_ENABLED` unset to run dev only (prod incurs no cost); set it to
`true` **and** approve the gate when you actually want to ship production.

## 6. API routing (SPA → backend, same-origin)

The SPA calls the API same-origin via `VITE_API_BASE_URL=/api/v1`: CloudFront
routes `/api/*` to the backend, so there is no CORS and one URL per env. For dev
this is **already wired** in `envs/dev.tfvars`:

- `backend_api_origin_domain` = the ingress-nginx **NLB DNS name**.
- `backend_api_origin_protocol_policy = "http-only"` — there is no ACM cert for
  an `*.elb.amazonaws.com` name, and viewer→CloudFront stays HTTPS.

The nginx ingress matches `/api` on **any** Host (`ingress.host=""`), so
CloudFront's forwarded Host (the NLB name) routes correctly. Direct HTTPS on
`digishield.duckdns.org` (TLS terminated at nginx) also works. If the NLB is
recreated with a new DNS name, update `backend_api_origin_domain` and re-apply.

Leave `backend_api_origin_domain` empty to skip the `/api/*` behavior; the SPA
must then target a full cross-origin API URL and the backend must send CORS
headers.

## Teardown — destroy dev to stop cost

Infra is codified, so the cheapest "pause" is to destroy dev and re-`apply`
later. **Delete the NLB-creating add-ons FIRST** so the LB Controller removes the
NLB and frees the ENIs/EIPs before the VPC is destroyed:

```bash
helm -n ingress-nginx uninstall ingress-nginx   # LBC deletes the NLB
helm -n digishield-dev uninstall digishield
aws s3 rm s3://$(terraform -chdir=infra/terraform output -raw frontend_bucket) --recursive

cd infra/terraform
./destroy-dev.sh        # prompts: type "destroy dev" to confirm
```

`destroy-dev.sh` shows the destroy plan, asks for confirmation, empties the S3
bucket that has no `force_destroy`, then destroys. The EIPs are Terraform-managed,
so `destroy` releases them. Or manually:

```bash
terraform plan -destroy -var-file=envs/dev.tfvars   # review first
terraform destroy -var-file=envs/dev.tfvars
```

To decommission **production** use `./destroy-prod.sh` (for teardown only, not
cost-pausing). It additionally disables the RDS `deletion_protection` first,
takes a **final DB snapshot** (`digishield-prod-db-final`, restorable), and
**never** deletes the shared GitHub OIDC provider (owned by dev). Confirm by
typing `destroy production`.

Notes:

- **Irreversible.** Dev RDS uses `skip_final_snapshot=true` → no snapshot, data
  is lost. (Prod has `deletion_protection` + a final snapshot.)
- The S3 frontend bucket has no `force_destroy`; the script empties it first so
  `destroy` doesn't fail.
- The **state bucket + DynamoDB lock table** (bootstrap, outside Terraform) are
  kept. Delete them by hand only if you're abandoning the account.
- Dev sets `create_github_oidc_provider` = true, so destroying dev also removes
  the shared OIDC provider — fine while prod doesn't exist; do **not** destroy
  dev once prod references it.
- Recreate anytime: `terraform apply -var-file=envs/dev.tfvars` then re-run
  `bootstrap-addons.sh`.
