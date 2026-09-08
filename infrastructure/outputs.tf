output "api_url" {
  description = "CloudTask API endpoint"
  value       = "${aws_apigatewayv2_api.cloudtask.api_endpoint}/tasks"
}

output "cognito_domain" {
  description = "Cognito hosted UI domain"
  value       = "https://${aws_cognito_user_pool_domain.cloudtask.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_client_id" {
  description = "Cognito SPA client ID"
  value       = aws_cognito_user_pool_client.spa.id
}

output "cloudfront_url" {
  description = "CloudFront frontend URL"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "frontend_bucket" {
  description = "Frontend S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}
