# CloudTask AWS

CloudTask is a serverless task management web application built as a hands-on project to learn AWS cloud architecture, security, authentication, and Infrastructure as Code.

## Architecture

```text
User
 │
 ▼
CloudFront
 │
 ▼
Private S3 Bucket
 │
 │
 ▼
API Gateway
 │
 │ JWT Authentication
 │◄──────── Cognito
 ▼
Lambda
 │
 ▼
DynamoDB
```

## AWS Services

- **Amazon S3** — Hosts the frontend in a private bucket
- **Amazon CloudFront** — Delivers the frontend securely over HTTPS
- **Amazon Cognito** — Handles user authentication
- **Amazon API Gateway** — Exposes the backend HTTP API
- **AWS Lambda** — Runs the serverless backend
- **Amazon DynamoDB** — Stores user tasks
- **AWS IAM** — Controls permissions between AWS services

## Features

- User sign-up and login with Amazon Cognito
- OAuth 2.0 Authorization Code Flow with PKCE
- JWT-protected API endpoints
- Create, read, update, and delete tasks
- User-specific task isolation
- Private S3 frontend accessible through CloudFront
- Serverless backend architecture
- Infrastructure managed with Terraform

## Infrastructure as Code

The AWS infrastructure is managed using Terraform.

Terraform currently manages:

- DynamoDB table
- Lambda function and IAM permissions
- API Gateway API, routes, integrations, and JWT authorizer
- Cognito User Pool, application client, and domain
- S3 bucket and access policies
- CloudFront distribution and Origin Access Control

Before applying infrastructure changes:

```bash
cd infrastructure

terraform fmt
terraform validate
terraform plan
```

Infrastructure changes should only be applied after reviewing the Terraform plan.

## Project Structure

```text
cloudtask-aws/
├── frontend/
│   ├── index.html
│   └── app.js
│
├── backend/
│   └── lambda_function.py
│
├── infrastructure/
│   ├── provider.tf
│   ├── dynamodb.tf
│   ├── iam.tf
│   ├── lambda.tf
│   ├── api_gateway.tf
│   ├── cognito.tf
│   ├── s3.tf
│   └── cloudfront.tf
│
├── docs/
├── .gitignore
└── README.md
```

## Security

The project follows several AWS security practices:

- The S3 frontend bucket blocks public access
- CloudFront accesses S3 using Origin Access Control (OAC)
- API endpoints are protected using Cognito JWT authentication
- Lambda uses an IAM execution role to access DynamoDB
- Application users can only access their own tasks
- Terraform state and local environment files are excluded from Git

## What I Learned

This project provided hands-on experience with:

- Designing a serverless AWS architecture
- Connecting multiple AWS services
- IAM roles and service permissions
- REST-style serverless APIs
- JWT authentication and OAuth 2.0 with PKCE
- DynamoDB partition and sort keys
- CloudFront and private S3 hosting
- Infrastructure as Code with Terraform
- Importing existing AWS resources into Terraform state
- Reviewing Terraform plans before infrastructure changes

## Next Steps

- Automate frontend deployment
- Add CI/CD with GitHub Actions
- Configure GitHub Actions authentication to AWS using OIDC
- Add application monitoring with Amazon CloudWatch