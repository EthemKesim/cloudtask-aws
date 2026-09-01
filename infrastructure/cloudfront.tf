resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "oac-cloudtask-frontend-ethem.s3.amazonaws.com-mtfma71u1or"
  description                       = "Created by CloudFront"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2"
  price_class     = "PriceClass_All"

  default_root_object = "index.html"

  tags = {
    Name = "cloudtask-frontend-ethem"
  }

  origin {
    domain_name              = "cloudtask-frontend-ethem.s3.amazonaws.com"
    origin_id                = "cloudtask-frontend-ethem.s3.amazonaws.com-mtfm7hhhx11"
    origin_path              = "/frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    target_origin_id       = "cloudtask-frontend-ethem.s3.amazonaws.com-mtfm7hhhx11"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}