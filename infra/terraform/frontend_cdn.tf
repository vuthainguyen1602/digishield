# Frontend hosting: private S3 bucket + CloudFront (OAC) for the React/Vite SPA.
#
# Per ADR-004 the SPA builds to static assets; on cloud it is served via CDN.
# The CD pipeline runs `aws s3 sync frontend/dist s3://<bucket>` then a
# CloudFront invalidation. The bucket is PRIVATE — only CloudFront reaches it
# through an Origin Access Control (OAC); there is no public bucket access.
#
# SPA routing: 403/404 from S3 are rewritten to /index.html (200) so client-side
# routes (react-router) resolve on deep links / refresh.
#
# Custom domain is optional: leave frontend_domain_aliases empty to serve on the
# default *.cloudfront.net domain. To use a custom domain, pass the aliases AND
# an ACM cert ARN that MUST live in us-east-1 (CloudFront requirement).

# Bucket names are globally unique -> add a short random suffix.
resource "random_id" "frontend_bucket" {
  byte_length = 4
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name}-frontend-${random_id.frontend_bucket.hex}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# OAC lets CloudFront sign requests to the private bucket (replaces legacy OAI).
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.name}-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals {
  frontend_origin_id = "s3-${aws_s3_bucket.frontend.id}"
  frontend_use_acm   = var.frontend_acm_certificate_arn != ""
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  comment             = "${local.name} frontend SPA"
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class
  aliases             = var.frontend_domain_aliases

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = local.frontend_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    target_origin_id       = local.frontend_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # AWS managed "CachingOptimized" policy.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # SPA fallback: serve index.html for unknown paths so client-side routing works.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = local.frontend_use_acm ? null : true
    acm_certificate_arn            = local.frontend_use_acm ? var.frontend_acm_certificate_arn : null
    ssl_support_method             = local.frontend_use_acm ? "sni-only" : null
    minimum_protocol_version       = local.frontend_use_acm ? "TLSv1.2_2021" : "TLSv1"
  }
}

# Allow ONLY this CloudFront distribution to read the bucket (OAC + SourceArn).
data "aws_iam_policy_document" "frontend_bucket" {
  statement {
    sid       = "AllowCloudFrontOACRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket.json
}
