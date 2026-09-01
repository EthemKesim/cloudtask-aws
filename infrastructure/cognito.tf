resource "aws_cognito_user_pool" "cloudtask" {
  name = "User pool - yednl7"

  deletion_protection = "ACTIVE"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  username_configuration {
    case_sensitive = false
  }

  password_policy {
    minimum_length                   = 8
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  sign_in_policy {
    allowed_first_auth_factors = ["PASSWORD"]
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }

    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  mfa_configuration = "OFF"
}

resource "aws_cognito_user_pool_client" "spa" {
  name         = "My SPA app - 5rhpga"
  user_pool_id = aws_cognito_user_pool.cloudtask.id


  refresh_token_validity = 5
  access_token_validity  = 60
  id_token_validity      = 60
  auth_session_validity  = 3

  token_validity_units {
    refresh_token = "days"
    access_token  = "minutes"
    id_token      = "minutes"
  }

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  supported_identity_providers = [
    "COGNITO"
  ]

  callback_urls = [
    "https://d3uuyg0mq27sk6.cloudfront.net"
  ]

  logout_urls = [
    "https://d3uuyg0mq27sk6.cloudfront.net"
  ]

  allowed_oauth_flows = [
    "code"
  ]

  allowed_oauth_scopes = [
    "email",
    "openid",
    "phone"
  ]

  allowed_oauth_flows_user_pool_client = true

  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

resource "aws_cognito_user_pool_domain" "cloudtask" {
  domain       = "us-east-1zdwwiqewg"
  user_pool_id = aws_cognito_user_pool.cloudtask.id
}