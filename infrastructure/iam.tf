resource "aws_iam_role" "lambda_role" {
  name = "cloudtask-api-role-owbsia84"
  path = "/service-role/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "lambda.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "dynamodb_access" {
  name = "CloudTaskDynamoDBReadPolicy"
  role = aws_iam_role.lambda_role.name

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]

        Resource = aws_dynamodb_table.tasks.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role = aws_iam_role.lambda_role.name

  policy_arn = "arn:aws:iam::833090513321:policy/service-role/AWSLambdaBasicExecutionRole-7758edd9-0c4a-4830-b7e1-d59fc345ab81"
}