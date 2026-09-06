import json
import unittest
from unittest.mock import MagicMock, patch


with patch("boto3.resource") as mock_resource:
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table

    from backend.lambda_function import lambda_handler


class TestLambdaHandler(unittest.TestCase):

    def setUp(self):
        mock_table.reset_mock()

    def test_get_tasks_success(self):
        mock_table.query.return_value = {
            "Items": [
                {
                    "userId": "test-user-123",
                    "taskId": "1",
                    "text": "Test task",
                    "completed": False
                }
            ]
        }

        event = {
            "requestContext": {
                "http": {
                    "method": "GET"
                },
                "authorizer": {
                    "jwt": {
                        "claims": {
                            "sub": "test-user-123"
                        }
                    }
                }
            }
        }

        response = lambda_handler(event, None)

        self.assertEqual(response["statusCode"], 200)

        body = json.loads(response["body"])

        self.assertEqual(len(body), 1)
        self.assertEqual(body[0]["text"], "Test task")

        mock_table.query.assert_called_once_with(
            KeyConditionExpression="userId = :userId",
            ExpressionAttributeValues={
                ":userId": "test-user-123"
            }
        )

    def test_post_missing_fields_returns_400(self):
        event = {
            "requestContext": {
                "http": {
                    "method": "POST"
                },
                "authorizer": {
                    "jwt": {
                        "claims": {
                            "sub": "test-user-123"
                        }
                    }
                }
            },
            "body": json.dumps({
                "taskId": "1",
                "text": "Test task"
            })
        }

        response = lambda_handler(event, None)

        self.assertEqual(response["statusCode"], 400)

        body = json.loads(response["body"])

        self.assertEqual(
            body["message"],
            "taskId, text and completed are required"
        )

        mock_table.put_item.assert_not_called()

    def test_post_empty_text_returns_400(self):
        event = {
            "requestContext": {
                "http": {
                    "method": "POST"
                },
                "authorizer": {
                    "jwt": {
                        "claims": {
                            "sub": "test-user-123"
                        }
                    }
                }
            },
            "body": json.dumps({
                "taskId": "1",
                "text": "   ",
                "completed": False
            })
        }

        response = lambda_handler(event, None)

        self.assertEqual(response["statusCode"], 400)

        body = json.loads(response["body"])

        self.assertEqual(
            body["message"],
            "Task text cannot be empty"
        )

        mock_table.put_item.assert_not_called()

    def test_post_task_success(self):
        event = {
            "requestContext": {
                "http": {
                    "method": "POST"
                },
                "authorizer": {
                    "jwt": {
                        "claims": {
                            "sub": "test-user-123"
                        }
                    }
                }
            },
            "body": json.dumps({
                "taskId": "1",
                "text": "  Learn AWS  ",
                "completed": False
            })
        }

        response = lambda_handler(event, None)

        self.assertEqual(response["statusCode"], 201)

        body = json.loads(response["body"])

        self.assertEqual(body["taskId"], "1")
        self.assertEqual(body["text"], "Learn AWS")
        self.assertEqual(body["completed"], False)
        self.assertEqual(body["userId"], "test-user-123")

        mock_table.put_item.assert_called_once_with(
            Item={
                "userId": "test-user-123",
                "taskId": "1",
                "text": "Learn AWS",
                "completed": False
            }
        )


if __name__ == "__main__":
    unittest.main()