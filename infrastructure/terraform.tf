terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.41"
    }
  }

  backend "s3" {
    # bucket         = "terraform-state-000000000000"
    key            = "companies.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    workspace_key_prefix = "state"
  }

}

provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = [var.aws_accounts[local.environment]]
  default_tags { tags = var.default_tags }

  assume_role {
    # role_arn = "arn:aws:iam::${local.aws_account}:role/${var.aws_role}"
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
