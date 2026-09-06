# CloudTask AWS ☁️

CloudTask is a serverless task management web application built as a hands-on project to learn and apply AWS cloud architecture, serverless development, authentication, monitoring, security, CI/CD, and Infrastructure as Code.

The application allows authenticated users to create, view, update, complete, and delete their own tasks through a fully serverless AWS architecture.

## Architecture

```text
                         User
                           │
                           ▼
                      CloudFront
                           │
                           ▼
                    Private S3 Bucket
                    (Static Frontend)
                           │
                           │
                           ▼
                      API Gateway
                           │
                    JWT Authentication
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
                 Cognito        Lambda
                                  │
                                  ▼
                              DynamoDB


Monitoring & Alerting
──────────────────────────────────────

Lambda
   │
   ├──────────► CloudWatch Logs
   │
   └──────────► CloudWatch Alarm
                       │
                       ▼
                      SNS
                       │
                       ▼
                 Email Alert


Infrastructure & CI/CD
──────────────────────────────────────

GitHub
   │
   ├────────► Terraform CI
   │              │
   │              ├── fmt
   │              ├── init
   │              ├── validate
   │              └── plan
   │
   └────────► Terraform Apply
                  │
                  ▼
             GitHub OIDC
                  │
                  ▼
                 AWS
```

## AWS Services

- **Amazon S3** — Hosts the static frontend in a private bucket
- **Amazon CloudFront** — Delivers the frontend securely over HTTPS
- **Amazon Cognito** — Handles user authentication
- **Amazon API Gateway** — Exposes and protects the backend HTTP API
- **AWS Lambda** — Runs the serverless backend logic
- **Amazon DynamoDB** — Stores user-specific tasks
- **Amazon CloudWatch** — Provides Lambda logging and error monitoring
- **Amazon SNS** — Sends email notifications when alarms are triggered
- **AWS IAM** — Controls permissions between AWS services and CI/CD roles
- **AWS IAM OIDC** — Allows GitHub Actions to authenticate to AWS without long-lived AWS credentials
- **Terraform** — Provisions and manages AWS infrastructure
- **GitHub Actions** — Performs Terraform CI validation and infrastructure deployment

## Features

- User sign-up and login with Amazon Cognito
- OAuth 2.0 Authorization Code Flow with PKCE
- JWT-protected API endpoints
- Create, read, update, complete, and delete tasks
- User-specific task isolation
- Persistent task storage with DynamoDB
- Private S3 frontend accessible through CloudFront
- Serverless backend architecture
- CloudWatch logging for Lambda requests
- Automated monitoring of Lambda errors
- SNS email notifications for infrastructure alarms
- Infrastructure managed with Terraform
- Terraform validation and planning with GitHub Actions
- AWS authentication from GitHub Actions using OIDC
- Separate IAM roles for CI and infrastructure deployment

## Infrastructure as Code

The AWS infrastructure is managed using Terraform.

Terraform manages:

- DynamoDB table
- Lambda function
- Lambda IAM execution role and permissions
- API Gateway API
- API Gateway routes and Lambda integrations
- JWT authorizer
- Cognito User Pool
- Cognito application client
- Cognito domain
- S3 frontend bucket
- S3 access policies
- CloudFront distribution
- CloudFront Origin Access Control
- CloudWatch log group
- CloudWatch Lambda error alarm
- SNS alert topic
- SNS email subscription

For local infrastructure validation:

```bash
cd infrastructure

terraform fmt
terraform init
terraform validate
terraform plan
```

Infrastructure changes should always be reviewed through a Terraform plan before they are applied.

## CI/CD

The project uses GitHub Actions to validate and deploy Terraform infrastructure.

Two separate workflows are used to separate infrastructure validation from deployment.

### Terraform CI

The Terraform CI workflow runs:

```text
Checkout Repository
        │
        ▼
Setup Terraform
        │
        ▼
Configure AWS Credentials
        │
        ▼
terraform fmt
        │
        ▼
terraform init
        │
        ▼
terraform validate
        │
        ▼
terraform plan
```

The workflow verifies that Terraform configuration is correctly formatted, valid, and synchronized with the AWS infrastructure.

### Terraform Apply

Infrastructure deployment is handled through a separate manually triggered GitHub Actions workflow.

The deployment process performs:

```text
Checkout Repository
        │
        ▼
Setup Terraform
        │
        ▼
GitHub OIDC Authentication
        │
        ▼
Terraform Init
        │
        ▼
Terraform Validate
        │
        ▼
Terraform Plan
        │
        ▼
Terraform Apply
        │
        ▼
AWS Infrastructure
```

Using a manually triggered deployment workflow provides an additional safety layer before infrastructure changes are applied.

## GitHub Actions and AWS OIDC

GitHub Actions authenticates to AWS using OpenID Connect (OIDC).

This avoids storing permanent AWS access keys inside GitHub repository secrets.

The authentication flow is:

```text
GitHub Actions
      │
      │ OIDC Token
      ▼
AWS IAM OIDC Provider
      │
      ▼
IAM Role
      │
      ▼
Temporary AWS Credentials
      │
      ▼
Terraform
```

Separate IAM roles are used for different responsibilities:

- **Terraform CI Role** — Used for Terraform validation and planning
- **Terraform Apply Role** — Used for infrastructure deployment

The Apply role trust policy is restricted to the project's GitHub repository and the `main` branch.

## Monitoring and Alerting

CloudTask includes monitoring and alerting for the serverless backend.

### CloudWatch Logs

AWS Lambda sends application logs to:

```text
/aws/lambda/cloudtask-api
```

The logs include information such as:

- Lambda request execution
- HTTP request methods
- Authenticated user IDs
- Task operations
- Task counts
- Execution duration
- Lambda runtime information

### CloudWatch Alarm

A CloudWatch alarm monitors Lambda execution errors.

```text
Lambda
   │
   ▼
CloudWatch Metrics
   │
   ▼
Lambda Error Alarm
```

When the configured error threshold is reached, the alarm can trigger the SNS notification system.

### SNS Notifications

Amazon SNS is connected to the CloudWatch alarm.

```text
Lambda Error
     │
     ▼
CloudWatch Alarm
     │
     ▼
SNS Topic
     │
     ▼
Email Notification
```

The email subscription is confirmed and ready to receive infrastructure alerts.

## Project Structure

```text
cloudtask-aws/
│
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
│   ├── cloudfront.tf
│   └── monitoring.tf
│
├── .github/
│   └── workflows/
│       ├── terraform-ci.yml
│       └── terraform-apply.yml
│
├── docs/
│
├── .gitignore
└── README.md
```

## Security

The project applies several cloud security practices:

- The S3 frontend bucket blocks public access
- Frontend content is delivered through CloudFront
- CloudFront accesses S3 using Origin Access Control (OAC)
- API endpoints are protected using Cognito JWT authentication
- OAuth 2.0 Authorization Code Flow with PKCE is used for authentication
- Lambda uses an IAM execution role to access DynamoDB
- Application users can only access their own tasks
- GitHub Actions uses OIDC instead of permanent AWS access keys
- CI and deployment use separate IAM roles
- The Terraform Apply role is restricted to the repository's `main` branch
- Terraform state and local environment files are excluded from Git

## End-to-End Flow

A typical authenticated request follows this path:

```text
1. User opens CloudFront URL
             │
             ▼
2. CloudFront serves frontend from private S3
             │
             ▼
3. User authenticates with Cognito
             │
             ▼
4. Cognito returns authentication tokens
             │
             ▼
5. Frontend sends JWT with API request
             │
             ▼
6. API Gateway validates JWT
             │
             ▼
7. API Gateway invokes Lambda
             │
             ▼
8. Lambda processes the request
             │
             ▼
9. Lambda reads/writes tasks in DynamoDB
             │
             ▼
10. Response is returned to the frontend
```

## Verified Functionality

The deployed environment has been tested end-to-end.

Verified components include:

- CloudFront frontend delivery
- Private S3 frontend hosting
- Cognito authentication
- Successful login and redirect flow
- API Gateway JWT authorization
- Lambda backend execution
- DynamoDB task persistence
- Creating tasks
- Reading tasks
- Updating task completion status
- Deleting tasks
- User-specific task access
- CloudWatch Lambda logs
- CloudWatch Lambda error alarm
- Confirmed SNS email subscription
- Terraform CI workflow
- Terraform Apply workflow
- GitHub Actions authentication through AWS OIDC

## What I Learned

This project provided hands-on experience with:

- Designing a serverless AWS architecture
- Connecting multiple AWS managed services
- Building serverless APIs with API Gateway and Lambda
- IAM roles and service permissions
- Authentication with Amazon Cognito
- JWT authorization
- OAuth 2.0 Authorization Code Flow with PKCE
- DynamoDB data modeling
- User-specific data isolation
- CloudFront and private S3 hosting
- CloudWatch logging and monitoring
- SNS-based infrastructure alerting
- Infrastructure as Code with Terraform
- Importing existing AWS resources into Terraform state
- Terraform state synchronization
- Reviewing Terraform plans before infrastructure changes
- Building CI/CD workflows with GitHub Actions
- Authenticating GitHub Actions to AWS using OIDC
- Separating CI and deployment permissions

## Future Improvements

Potential improvements include:

- Automated frontend deployment to S3
- CloudFront cache invalidation during frontend deployments
- Custom domain configuration with Route 53
- HTTPS certificate management with AWS Certificate Manager
- Additional CloudWatch dashboards and metrics
- Automated integration testing
- More restrictive resource-level IAM policies
- Improved frontend design and user experience

## Purpose

CloudTask was created as a practical AWS learning project focused on understanding how production-style cloud components work together.

Rather than using a single managed application platform, the project connects individual AWS services to gain hands-on experience with serverless architecture, authentication, security, monitoring, Infrastructure as Code, and CI/CD.