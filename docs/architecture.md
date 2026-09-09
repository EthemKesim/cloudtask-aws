# CloudTask AWS Architecture

CloudTask uses a serverless AWS architecture with separate development and production environments, secure authentication, Infrastructure as Code, CI/CD, and integrated monitoring.

## Application Architecture

```mermaid
flowchart LR
    USER["User / Browser"]

    subgraph FRONTEND["Frontend"]
        CF["Amazon CloudFront"]
        S3["Private Amazon S3"]
    end

    subgraph AUTH["Authentication"]
        COG["Amazon Cognito"]
    end

    subgraph BACKEND["Serverless Backend"]
        API["Amazon API Gateway"]
        LAMBDA["AWS Lambda"]
        DB["Amazon DynamoDB"]
    end

    USER --> CF
    CF --> S3

    USER -->|"Sign in"| COG
    COG -->|"JWT"| USER

    USER -->|"HTTPS + JWT"| API
    API -->|"JWT Authorizer"| COG
    API --> LAMBDA
    LAMBDA --> DB
```

### Request Flow

```text
Browser
   │
   ├── Authentication ──► Cognito
   │                         │
   │◄──────── JWT ───────────┘
   │
   ▼
CloudFront
   │
   ▼
Private S3
   │
   │  Frontend sends authenticated API requests
   ▼
API Gateway
   │
   │  JWT validation
   ▼
Lambda
   │
   ▼
DynamoDB
```

The frontend is stored in a private S3 bucket and delivered through CloudFront. Users authenticate through Amazon Cognito, and API Gateway validates JWTs before requests reach the Lambda backend.

Lambda performs task operations against DynamoDB while keeping task data isolated by authenticated user.

---

## DEV and PROD Environments

CloudTask maintains separate development and production environments.

```mermaid
flowchart TD
    CODE["Application / Infrastructure Code"]

    CODE --> DEV["DEV Environment"]
    DEV --> TEST["Validation & Testing"]

    TEST -->|"Verified"| PRODDEPLOY["Production Deployment"]
    PRODDEPLOY --> APPROVAL["GitHub Environment Approval"]
    APPROVAL --> PROD["PROD Environment"]

    subgraph DEVELOPMENT["Development"]
        DEV
        TEST
    end

    subgraph PRODUCTION["Production"]
        PRODDEPLOY
        APPROVAL
        PROD
    end
```

Each environment has its own application resources, including:

```text
DEV
├── CloudFront
├── S3
├── Cognito
├── API Gateway
├── Lambda
├── DynamoDB
├── CloudWatch
└── SNS

PROD
├── CloudFront
├── S3
├── Cognito
├── API Gateway
├── Lambda
├── DynamoDB
├── CloudWatch
└── SNS
```

Changes are deployed to DEV first and tested before being promoted to production.

Production deployment is protected through a GitHub Environment approval gate.

---

## CI/CD Architecture

GitHub Actions handles infrastructure validation and application deployments.

AWS authentication is performed through OpenID Connect rather than long-lived AWS access keys.

```mermaid
flowchart LR
    DEV["Developer"] --> GH["GitHub"]

    GH --> TCI["Terraform CI"]
    GH --> TA["Terraform Apply"]
    GH --> FD["Frontend Deploy"]
    GH --> BD["Backend Deploy"]

    TCI --> OIDC["GitHub OIDC"]
    TA --> OIDC
    FD --> OIDC
    BD --> OIDC

    OIDC --> IAM["Dedicated AWS IAM Roles"]
    IAM --> AWS["AWS"]
```

### Terraform Flow

```text
Code Change
    │
    ▼
GitHub
    │
    ▼
Terraform CI
    │
    ├── terraform fmt
    ├── terraform init
    ├── terraform validate
    └── terraform plan
            │
            ▼
      Reviewed Change
            │
            ▼
      Terraform Apply
            │
            ▼
     AWS Infrastructure
```

Terraform uses remote state stored in Amazon S3.

DEV and PROD use separate Terraform state paths to prevent environment state from being mixed.

---

## Application Deployment Flow

Frontend and backend application deployments are handled independently.

### Frontend

```mermaid
flowchart LR
    GH["GitHub Actions"] --> OIDC["AWS OIDC"]
    OIDC --> ROLE["Frontend Deploy Role"]
    ROLE --> S3["Amazon S3"]
    S3 --> INV["CloudFront Invalidation"]
    INV --> CF["Amazon CloudFront"]
```

The frontend deployment workflow:

```text
Validate JavaScript
        │
        ▼
Upload Frontend to S3
        │
        ▼
Invalidate CloudFront Cache
        │
        ▼
Updated Application
```

### Backend

```mermaid
flowchart LR
    GH["GitHub Actions"] --> TEST["Backend Tests"]
    TEST --> OIDC["AWS OIDC"]
    OIDC --> ROLE["Backend Deploy Role"]
    ROLE --> LAMBDA["AWS Lambda"]
```

The backend workflow validates and tests the Python application before packaging and deploying the Lambda function.

---

## OIDC and IAM Security

GitHub Actions does not rely on permanent AWS access keys.

```mermaid
sequenceDiagram
    participant GH as GitHub Actions
    participant OIDC as GitHub OIDC
    participant IAM as AWS IAM
    participant AWS as AWS Services

    GH->>OIDC: Request OIDC token
    OIDC-->>GH: Short-lived identity token
    GH->>IAM: Assume deployment role
    IAM-->>GH: Temporary AWS credentials
    GH->>AWS: Authorized deployment
```

Dedicated IAM roles separate responsibilities between:

- Terraform CI
- Terraform Apply
- DEV frontend deployment
- DEV backend deployment
- PROD frontend deployment
- PROD backend deployment

Production roles are tied to the protected production environment, while development deployments use the development environment.

This reduces credential exposure and separates deployment responsibilities.

---

## Monitoring and Alerting

CloudTask uses CloudWatch and SNS to monitor the serverless backend.

```mermaid
flowchart LR
    API["API Gateway"] --> METRICS["CloudWatch Metrics"]
    LAMBDA["AWS Lambda"] --> LOGS["CloudWatch Logs"]
    LAMBDA --> METRICS

    METRICS --> ALARMS["CloudWatch Alarms"]
    ALARMS --> SNS["Amazon SNS"]
    SNS --> EMAIL["Email Notification"]

    METRICS --> DASH["CloudWatch Dashboard"]
```

Monitoring includes:

- Lambda errors
- Lambda duration
- Lambda throttles
- API Gateway 5XX responses
- Lambda application logs
- CloudWatch dashboard
- SNS alert notifications

---

## Security Layers

```text
Internet
   │
   ▼
CloudFront
   │
   ├── HTTPS delivery
   │
   ▼
Private S3
   │
   └── Origin Access Control
   

User
   │
   ▼
Cognito
   │
   └── OAuth 2.0 + PKCE
           │
           ▼
          JWT
           │
           ▼
      API Gateway
           │
           └── JWT Authorization
                   │
                   ▼
                 Lambda
                   │
                   └── IAM Role
                          │
                          ▼
                       DynamoDB
```

Key security decisions include:

- Private S3 frontend bucket
- CloudFront Origin Access Control
- Cognito authentication
- OAuth 2.0 Authorization Code Flow with PKCE
- JWT-protected API routes
- User-specific task isolation
- IAM-based Lambda permissions
- GitHub Actions OIDC authentication
- Separate deployment roles
- Protected production environment
- Remote Terraform state

---

## Complete Architecture

```mermaid
flowchart TB
    USER["User / Browser"]

    subgraph APP["CloudTask Application"]
        CF["CloudFront"]
        S3["Private S3"]
        COG["Cognito"]
        API["API Gateway"]
        LAMBDA["Lambda"]
        DB["DynamoDB"]

        CF --> S3
        API --> LAMBDA
        LAMBDA --> DB
    end

    USER --> CF
    USER -->|"Authenticate"| COG
    COG -->|"JWT"| USER
    USER -->|"HTTPS + JWT"| API
    API -.->|"Validate JWT"| COG

    subgraph OBS["Observability"]
        CW["CloudWatch"]
        SNS["SNS"]
        DASH["Dashboard"]

        CW --> SNS
        CW --> DASH
    end

    LAMBDA --> CW
    API --> CW

    subgraph CICD["CI/CD & Infrastructure"]
        GH["GitHub Actions"]
        OIDC["GitHub OIDC"]
        IAM["AWS IAM Roles"]
        TF["Terraform"]

        GH --> OIDC
        OIDC --> IAM
        GH --> TF
        TF --> IAM
    end

    IAM --> APP
```

---

## Design Principles

CloudTask was built around a few core principles:

**Serverless first**  
Managed AWS services reduce infrastructure management and keep the architecture focused on application logic.

**Infrastructure as Code**  
Terraform makes the infrastructure reproducible, reviewable, and version controlled.

**Short-lived credentials**  
GitHub Actions uses OIDC and temporary AWS credentials instead of permanent access keys.

**Environment isolation**  
DEV and PROD resources and Terraform state are kept separate.

**Protected production**  
Production deployments require explicit approval.

**Observability**  
CloudWatch logs, metrics, alarms, dashboards, and SNS notifications provide visibility into the application.

---

[Back to main README](../README.md)