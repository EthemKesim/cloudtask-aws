terraform {
  backend "s3" {
  bucket       = "cloudtask-terraform-state-ethem"
  key          = "cloudtask/terraform.tfstate"
  region       = "us-east-1"
  encrypt      = true
  use_lockfile = true
}
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}