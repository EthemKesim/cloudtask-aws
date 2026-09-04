import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("CloudTaskTasksV2")


def lambda_handler(event, context):

    # TEMPORARY: CloudWatch alarm test
    # Lambda Console'dan {"forceError": true} gönderildiğinde
    # intentionally unhandled exception oluşturur.
    if event.get("forceError") is True:
        raise Exception("Forced CloudWatch test error")

    try:
        # HTTP method bilgisini al
        method = event["requestContext"]["http"]["method"]

        # Cognito JWT'den giriş yapan kullanıcının ID'sini al
        claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
        user_id = claims["sub"]

        print("Request method:", method)
        print("User ID:", user_id)

        # GET - Sadece giriş yapan kullanıcının tasklarını getir
        if method == "GET":
            print("Fetching tasks for user:", user_id)

            response = table.query(
                KeyConditionExpression="userId = :userId",
                ExpressionAttributeValues={
                    ":userId": user_id
                }
            )

            items = response.get("Items", [])

            print("Task count:", len(items))

            return {
                "statusCode": 200,
                "body": json.dumps(items)
            }

        # POST - Yeni task oluştur
        if method == "POST":
            body = json.loads(event["body"])

            # Gerekli alanları kontrol et
            if (
                "taskId" not in body
                or "text" not in body
                or "completed" not in body
            ):
                print("Invalid POST body:", body)

                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "message": "taskId, text and completed are required"
                    })
                }

            # Task text boş olamaz
            if not isinstance(body["text"], str) or not body["text"].strip():
                print("Invalid task text")

                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "message": "Task text cannot be empty"
                    })
                }

            task = {
                "userId": user_id,
                "taskId": body["taskId"],
                "text": body["text"].strip(),
                "completed": body["completed"]
            }

            print("Creating task:", task)

            table.put_item(Item=task)

            return {
                "statusCode": 201,
                "body": json.dumps(task)
            }

        # PATCH - Task durumunu güncelle
        if method == "PATCH":
            task_id = event["pathParameters"]["id"]
            body = json.loads(event["body"])

            # completed alanı gönderilmiş mi?
            if "completed" not in body:
                print("Invalid PATCH body:", body)

                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "message": "completed is required"
                    })
                }

            # completed boolean olmalı
            if not isinstance(body["completed"], bool):
                print("Invalid completed value:", body["completed"])

                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "message": "completed must be true or false"
                    })
                }

            print("Updating task:", task_id)

            response = table.update_item(
                Key={
                    "userId": user_id,
                    "taskId": task_id
                },
                UpdateExpression="SET completed = :completed",
                ExpressionAttributeValues={
                    ":completed": body["completed"]
                },
                ReturnValues="ALL_NEW"
            )

            updated_task = response["Attributes"]

            print("Updated task:", updated_task)

            return {
                "statusCode": 200,
                "body": json.dumps(updated_task)
            }

        # DELETE - Task sil
        if method == "DELETE":
            task_id = event["pathParameters"]["id"]

            print("Deleting task:", task_id)

            table.delete_item(
                Key={
                    "userId": user_id,
                    "taskId": task_id
                }
            )

            print("Task deleted:", task_id)

            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "Task deleted"
                })
            }

        # Desteklenmeyen HTTP method
        print("Unsupported method:", method)

        return {
            "statusCode": 405,
            "body": json.dumps({
                "message": "Method not allowed"
            })
        }

    except json.JSONDecodeError:
        print("Invalid JSON body")

        return {
            "statusCode": 400,
            "body": json.dumps({
                "message": "Invalid JSON body"
            })
        }

    except Exception as error:
        print("Unexpected error:", str(error))

        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Internal server error"
            })
        }


# CloudTask backend deployed with GitHub Actions