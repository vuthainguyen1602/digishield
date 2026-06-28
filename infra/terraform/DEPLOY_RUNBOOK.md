# DigiShield — Dev Deploy Runbook (GHCR-only)

Step-by-step to bring up the **dev** environment on AWS and deploy the app via
the CD pipeline. Values are pre-filled for this account/region.

> **Scope:** dev only. Production is intentionally deferred to save AWS cost — do
> not run the prod apply or set `PROD_DEPLOY_ENABLED` unless that changes.
>
> **Prerequisite:** PR #25 (GHCR-only pipeline) must be **merged to `main`**.
> This runbook assumes the merged state: the app image lives in GHCR and EKS
> pulls it via an in-cluster `ghcr-pull` secret. There is no ECR.

## Fixed values for this setup

| Thing | Value |
|---|---|
| AWS account | `743337585084` |
| AWS region | `ap-southeast-1` |
| Terraform state bucket | `digishield-tfstate-743337585084` |
| Terraform lock table | `digishield-tflock` |
| GHCR image | `ghcr.io/vuthainguyen1602/digishield/app` |
| GitHub repo | `vuthainguyen1602/digishield` |
| EKS cluster (dev) | `digishield-dev` |
| Namespace (dev) | `digishield-dev` |

## Cost warning

A dev bring-up provisions paid resources: EKS control plane (~$73/mo), a
NAT Gateway (~$32/mo + data), RDS `db.t3.medium`, ElastiCache `cache.t3.micro`,
plus ALB/CloudFront. Tear down with `./destroy-dev.sh` when not in use (state
bucket + lock table are kept, ~$0).

---

## 0. One-time prerequisites (manual, do these first)

These cannot be automated from here:

1. **Create the GHCR pull PAT.** GitHub → Settings → Developer settings →
   Personal access tokens → generate a token with **`read:packages`**. It must be
   able to read the `digishield/app` package. Keep the value for step 3.
2. **Confirm GHCR package visibility.** If `ghcr.io/vuthainguyen1602/digishield/app`
   is private (default), the PAT above is required. (Making it public would
   remove the need for the secret, but we keep it private.)
3. **Code-owner approval for `main`.** Merges to `main` require a review from the
   `nvuthai1602` code owner — needed to merge PR #25 and any later changes.

## 1. Bootstrap Terraform remote state (once per account)

```bash
ACCOUNT_ID=743337585084
REGION=ap-southeast-1

aws s3api create-bucket --bucket "digishield-tfstate-$ACCOUNT_ID" \
  --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"
aws s3api put-bucket-versioning --bucket "digishield-tfstate-$ACCOUNT_ID" \
  --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name digishield-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region "$REGION"
```

Then set the bucket name in `envs/backend-dev.hcl` (replace `<ACCOUNT_ID>` with
`743337585084`).

## 2. Provision dev infrastructure

```bash
cd infra/terraform
terraform init -backend-config=envs/backend-dev.hcl
terraform plan  -var-file=envs/dev.tfvars   # review — free, creates nothing
terraform apply -var-file=envs/dev.tfvars   # ~15–20 min; STARTS BILLING
```

Creates EKS, RDS, ElastiCache, VPC/NAT, S3+CloudFront, the GitHub OIDC deploy
role, and Secrets Manager entries (`digishield/dev/db`, `/redis`, auto-filled).

## 3. Wire Terraform outputs → GitHub Actions

`terraform output` gives the values. Set them with `gh` (run from repo root):

```bash
cd infra/terraform
gh variable set AWS_REGION              -b "$(terraform output -raw region)"
gh variable set EKS_CLUSTER_NAME        -b "$(terraform output -raw eks_cluster_name)"
gh secret   set AWS_DEPLOY_ROLE_ARN     -b "$(terraform output -raw github_deploy_role_arn)"
gh variable set FRONTEND_BUCKET         -b "$(terraform output -raw frontend_bucket)" --env dev
gh variable set FRONTEND_DISTRIBUTION_ID -b "$(terraform output -raw frontend_distribution_id)" --env dev

# GHCR pull PAT from step 0 (paste the token value):
gh secret set GHCR_PULL_TOKEN -b "<paste-PAT-with-read:packages>"
```

Leave `DEPLOY_ENABLED` **unset** until you've finished step 4–5.

## 4. Cluster add-ons (after EKS exists)

```bash
aws eks update-kubeconfig --name digishield-dev --region ap-southeast-1

# External Secrets Operator (pulls DB/Redis creds from Secrets Manager)
helm repo add external-secrets https://charts.external-secrets.io
helm upgrade --install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace
kubectl -n external-secrets annotate serviceaccount external-secrets \
  eks.amazonaws.com/role-arn="$(terraform output -raw external_secrets_irsa_role_arn)" --overwrite

# AWS Load Balancer Controller (required for the API Ingress/ALB)
helm repo add eks https://aws.github.io/eks-charts
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system --set clusterName=digishield-dev
```

Then create the `ClusterSecretStore` named `aws-secretsmanager` (see
`README.md` for the manifest).

## 5. Fill dev values placeholders

In `digishield/deploy/helm/digishield/values-dev.yaml` replace the `<...>`:

- `database.url` ← `terraform output -raw rds_endpoint`
  (`jdbc:postgresql://<host>:5432/digishield`)
- `redis.host` ← `terraform output -raw redis_endpoint`
- `ingress.annotations` ACM cert ARN ← your `<acm-cert-arn>` for HTTPS on the ALB

`imagePullSecrets: [- name: ghcr-pull]` is already set — CD creates that secret
from `GHCR_PULL_TOKEN` before each deploy.

## 6. Enable and trigger the deploy

```bash
gh variable set DEPLOY_ENABLED -b "true"
```

Push to `main` (or re-run the `cd` workflow). The pipeline will:
build & push the image to GHCR → create the `ghcr-pull` secret in
`digishield-dev` → `helm upgrade --install` → smoke-test
`/actuator/health/readiness`. The frontend CD syncs the SPA to S3 + CloudFront.

If the `Helm deploy to EKS (dev)` step fails fast with
`GHCR_PULL_TOKEN is not set`, you missed step 3's last command.

## 7. Verify

```bash
kubectl -n digishield-dev get pods,ingress
kubectl -n digishield-dev rollout status deploy/digishield-api
terraform output -raw frontend_url   # open the SPA
```

## Teardown (stop cost)

```bash
cd infra/terraform
./destroy-dev.sh    # prompts: type "destroy dev"
```

Removes all dev infra (~$0 after). The state bucket + lock table are kept;
recreate anytime by re-running from step 2.
