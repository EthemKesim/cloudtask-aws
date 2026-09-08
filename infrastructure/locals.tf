locals {
  is_prod = var.environment == "prod"

  api_name             = local.is_prod ? "cloudtask-api" : "cloudtask-api-${var.environment}"
  lambda_function_name = local.is_prod ? "cloudtask-api" : "cloudtask-api-${var.environment}"
  dynamodb_table_name  = local.is_prod ? "CloudTaskTasksV2" : "CloudTaskTasksV2-${var.environment}"
  frontend_bucket_name = local.is_prod ? "cloudtask-frontend-ethem" : "cloudtask-frontend-ethem-${var.environment}"
  lambda_role_name     = local.is_prod ? "cloudtask-api-role-owbsia84" : "cloudtask-api-role-${var.environment}"

  cognito_user_pool_name = local.is_prod ? "User pool - yednl7" : "CloudTask ${var.environment} user pool"
  cognito_client_name    = local.is_prod ? "My SPA app - 5rhpga" : "CloudTask ${var.environment} SPA"
  cognito_domain_prefix  = local.is_prod ? "us-east-1zdwwiqewg" : "cloudtask-${var.environment}-ethem"

  sns_topic_name = local.is_prod ? "cloudtask-alerts" : "cloudtask-alerts-${var.environment}"
  dashboard_name = local.is_prod ? "CloudTask-Monitoring" : "CloudTask-Monitoring-${var.environment}"

  security_headers_policy_name = local.is_prod ? "cloudtask-security-headers" : "cloudtask-security-headers-${var.environment}"

  lambda_errors_alarm_name    = local.is_prod ? "cloudtask-lambda-errors" : "cloudtask-lambda-errors-${var.environment}"
  lambda_duration_alarm_name  = local.is_prod ? "cloudtask-lambda-duration" : "cloudtask-lambda-duration-${var.environment}"
  lambda_throttles_alarm_name = local.is_prod ? "cloudtask-lambda-throttles" : "cloudtask-lambda-throttles-${var.environment}"
  api_gateway_5xx_alarm_name  = local.is_prod ? "cloudtask-api-gateway-5xx" : "cloudtask-api-gateway-5xx-${var.environment}"

  cloudfront_oac_name = local.is_prod ? "oac-cloudtask-frontend-ethem.s3.amazonaws.com-mtfma71u1or" : "oac-cloudtask-frontend-ethem-${var.environment}"

  cloudfront_origin_id = local.is_prod ? "cloudtask-frontend-ethem.s3.amazonaws.com-mtfm7hhhx11" : "cloudtask-frontend-ethem-${var.environment}"

  csp_connect_sources = local.is_prod ? "https://ivg0e0r24h.execute-api.us-east-1.amazonaws.com https://us-east-1zdwwiqewg.auth.us-east-1.amazoncognito.com" : "https://*.execute-api.${var.aws_region}.amazonaws.com https://*.auth.${var.aws_region}.amazoncognito.com"

  csp_form_action = local.is_prod ? "https://us-east-1zdwwiqewg.auth.us-east-1.amazoncognito.com" : "https://*.auth.${var.aws_region}.amazoncognito.com"

}

