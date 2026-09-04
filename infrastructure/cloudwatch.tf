resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name        = "cloudtask-lambda-errors"
  alarm_description = "Triggers when CloudTask Lambda reports errors."

  namespace   = "AWS/Lambda"
  metric_name = "Errors"
  statistic   = "Sum"

  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }

  treat_missing_data = "notBreaching"
}