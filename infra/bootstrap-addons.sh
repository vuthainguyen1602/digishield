#!/usr/bin/env bash
# Bootstrap the in-cluster add-ons that Helm/kubectl (not Terraform) own, after
# `terraform apply`. Idempotent — safe to re-run. Reads Terraform outputs, so run
# it from a checkout where `terraform output` works (infra/terraform applied).
#
#   ./infra/bootstrap-addons.sh
#
# Installs: External Secrets Operator (+ ClusterSecretStore), AWS Load Balancer
# Controller, and ingress-nginx fronted by an NLB on the static EIPs. After this,
# issue the TLS cert + point DNS (see infra/RUNBOOK-dev.md), then deploy the app.
set -euo pipefail

TF_DIR="$(cd "$(dirname "$0")/terraform" && pwd)"
tf() { terraform -chdir="$TF_DIR" output -raw "$1"; }

REGION="$(tf region)"
CLUSTER="$(tf eks_cluster_name)"
ESO_ROLE="$(tf external_secrets_irsa_role_arn)"
LBC_ROLE="$(tf lb_controller_role_arn)"
VPC_ID="$(aws eks describe-cluster --name "$CLUSTER" --region "$REGION" --query 'cluster.resourcesVpcConfig.vpcId' --output text)"
SUBNETS="$(terraform -chdir="$TF_DIR" output -json public_subnet_ids | tr -d '[]"' | tr -s ' \n' ',')"
EIPS="$(terraform -chdir="$TF_DIR" output -json nlb_eip_allocation_ids | tr -d '[]"' | tr -s ' \n' ',')"

echo "==> kubeconfig"
aws eks update-kubeconfig --name "$CLUSTER" --region "$REGION"

echo "==> External Secrets Operator"
helm repo add external-secrets https://charts.external-secrets.io >/dev/null
helm repo add eks https://aws.github.io/eks-charts >/dev/null
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null
helm repo update >/dev/null
helm upgrade --install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace --wait
kubectl -n external-secrets annotate serviceaccount external-secrets \
  "eks.amazonaws.com/role-arn=${ESO_ROLE}" --overwrite
kubectl -n external-secrets rollout restart deploy/external-secrets

echo "==> ClusterSecretStore (AWS Secrets Manager)"
kubectl apply -f - <<YAML
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: aws-secretsmanager
spec:
  provider:
    aws:
      service: SecretsManager
      region: ${REGION}
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: external-secrets
YAML

echo "==> AWS Load Balancer Controller"
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="$CLUSTER" \
  --set region="$REGION" \
  --set vpcId="$VPC_ID" \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --wait
# helm --set mangles the ':role/' in the ARN, so set the SA annotation directly.
kubectl -n kube-system annotate serviceaccount aws-load-balancer-controller \
  "eks.amazonaws.com/role-arn=${LBC_ROLE}" --overwrite
kubectl -n kube-system rollout restart deploy/aws-load-balancer-controller
kubectl -n kube-system rollout status deploy/aws-load-balancer-controller --timeout=180s

echo "==> ingress-nginx (NLB across all AZs on the static EIPs)"
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx --create-namespace \
  --set controller.service.type=LoadBalancer \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=external \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-nlb-target-type"=ip \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-scheme"=internet-facing \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"=true \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-subnets"="$SUBNETS" \
  --set-string controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-eip-allocations"="$EIPS" \
  --wait --timeout 6m

echo
echo "Done. NLB EIPs: $EIPS"
echo "Next: issue the TLS cert + point DNS, then enable CD — see infra/RUNBOOK-dev.md"
