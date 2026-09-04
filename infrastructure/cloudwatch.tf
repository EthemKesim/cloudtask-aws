resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/cloudtask-api"
  retention_in_days = 14
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name        = "cloudtask-lambda-errors"
  alarm_description = "Triggers when CloudTask Lambda reports errors."

  namespace   = "AWS/Lambda"
  metric_name = "Errors"
  statistic   = "Sum"

  period             = 300
  evaluation_periods = 1
  threshold          = 1

  comparison_operator = "GreaterThanOrEqualToThreshold"

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }

  treat_missing_data = "notBreaching"

  alarm_actions = [
    aws_sns_topic.cloudtask_alerts.arn
  ]

  ok_actions = [
    aws_sns_topic.cloudtask_alerts.arn
  ]
}

resource "aws_sns_topic" "cloudtask_alerts" {
  name = "cloudtask-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.cloudtask_alerts.arn
  protocol  = "email"
  endpoint  = "kesimethem@gmail.com"
}