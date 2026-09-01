resource "aws_apigatewayv2_api" "cloudtask" {
  name          = "cloudtask-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false

    allow_headers = [
      "*"
    ]

    allow_methods = [
      "GET",
      "POST",
      "PATCH",
      "DELETE"
    ]

    allow_origins = [
      "*"
    ]

    max_age = 0
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.cloudtask.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cloudtask-cognito-authorizer"

  jwt_configuration {
    audience = ["6l2ghaere82ejr5e3cu9o0qvtd"]
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_zDWwiQewg"
  }
}

resource "aws_apigatewayv2_integration" "tasks_read_write" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.api.arn

  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "tasks_update_delete" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.api.arn

  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_route" "get_tasks" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  route_key = "GET /tasks"
  target    = "integrations/${aws_apigatewayv2_integration.tasks_read_write.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "post_tasks" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  route_key = "POST /tasks"
  target    = "integrations/${aws_apigatewayv2_integration.tasks_read_write.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "patch_task" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  route_key = "PATCH /tasks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.tasks_update_delete.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "delete_task" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  route_key = "DELETE /tasks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.tasks_update_delete.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.cloudtask.id

  name        = "$default"
  auto_deploy = true

  default_route_settings {
    detailed_metrics_enabled = false
  }
}

resource "aws_lambda_permission" "api_tasks" {
  statement_id  = "df389d97-2a98-5af7-af40-09ef39ca400e"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.cloudtask.execution_arn}/*/*/tasks"
}

resource "aws_lambda_permission" "api_task_by_id" {
  statement_id  = "a6c9fc93-9283-50be-838c-502c049bfaac"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.cloudtask.execution_arn}/*/*/tasks/{id}"
}