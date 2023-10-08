terraform {
  # backend "s3" {
  #   bucket               = "terraform-state-0000000000"
  #   key                  = "companies.tfstate"
  #   region               = "us-east-1"
  #   encrypt              = true
  #   dynamodb_table       = "terraform-lock"
  #   workspace_key_prefix = "state"
  # }
}

variable "deploy_aws_roles" {
  type = map(string)
  default = {
    dev  = "arn:aws:iam::072188420758:role/deploy-companies"
    prod = "arn:aws:iam::394074848505:role/deploy-companies"
  }
}

variable "deploy_aws_accounts" {
  type = map(list(string))
  default = {
    dev  = ["072188420758"]
    prod = ["394074848505"]
  }
}

provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = var.deploy_aws_accounts[local.environment]

  assume_role {
    role_arn = var.deploy_aws_roles[local.environment]
  }

  default_tags {
    tags = var.default_tags
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
