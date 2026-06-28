# AWS Load Balancer Controller IRSA role + the Elastic IPs for the ingress NLB.
# The controller itself is installed via Helm (infra/bootstrap-addons.sh); it
# provisions the internet-facing NLB that fronts ingress-nginx and binds the
# static EIPs below (so DuckDNS / the CloudFront origin have a stable address).

module "lb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"

  role_name                              = "${local.name}-aws-lbc"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
}

# One static EIP per public-subnet AZ for the internet-facing NLB.
resource "aws_eip" "nlb" {
  count  = var.az_count
  domain = "vpc"
  tags   = { Name = "${local.name}-nlb-${count.index}" }
}

output "lb_controller_role_arn" {
  description = "Annotate the aws-load-balancer-controller ServiceAccount with this role."
  value       = module.lb_controller_irsa.iam_role_arn
}

output "nlb_eip_allocation_ids" {
  description = "EIP allocation ids for the ingress-nginx NLB (aws-load-balancer-eip-allocations)."
  value       = aws_eip.nlb[*].allocation_id
}

output "public_subnet_ids" {
  description = "Public subnets for the internet-facing NLB (aws-load-balancer-subnets)."
  value       = module.vpc.public_subnets
}
