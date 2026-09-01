resource "aws_dynamodb_table" "tasks" {
  name         = "CloudTaskTasksV2"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "userId"
  range_key = "taskId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "taskId"
    type = "S"
  }
}