# CloudTask AWS Architecture

```mermaid
flowchart TD

    U[User] --> CF[Amazon CloudFront]
    CF --> S3[Private Amazon S3 Bucket]

    U --> COG[Amazon Cognito]
    COG -->|JWT Token| API[Amazon API Gateway]

    API --> L[AWS Lambda]
    L --> DB[Amazon DynamoDB]

    L --> CWL[Amazon CloudWatch Logs]
    L --> CWA[CloudWatch Error Alarm]
    CWA --> SNS[Amazon SNS]
    SNS --> EMAIL[Email Notification]

    GH[GitHub] --> CI[GitHub Actions - Terraform CI]
    GH --> APPLY[GitHub Actions - Terraform Apply]

    CI --> OIDC[AWS IAM OIDC]
    APPLY --> OIDC

    OIDC --> TF[Terraform]
    TF --> AWS[AWS Infrastructure]
