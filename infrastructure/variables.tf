locals {
  environment = lookup(var.environments, terraform.workspace, "dev")
  uri_prefix  = contains(keys(var.environments), terraform.workspace) ? "" : "-${terraform.workspace}"
}

# ----------------------------------------------------------------------------------------------------------------------
# Terraform
# ----------------------------------------------------------------------------------------------------------------------
variable "terraform_state" {
  type = map(string)
  default = {
    bucket = "arn:aws:s3:::terraform-state-mediacodex"
    dynamo = "arn:aws:dynamodb:eu-central-1:939514526661:table/terraform-state-lock"
  }
}

variable "environments" {
  type = map(string)
  default = {
    dev  = "dev"
    prod = "prod"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# AWS
# ----------------------------------------------------------------------------------------------------------------------
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "default_tags" {
  type        = map(string)
  description = "Common resource tags for all resources"
  default = {
    Service = "companies"
  }
}

variable "aws_accounts" {
  type = map(string)
  default = {
    dev  = "000000000000"
    prod = "000000000000"
  }
}

variable "aws_role" {
  type    = string
  default = "deploy-companies"
}


# ----------------------------------------------------------------------------------------------------------------------
# CORS
# ----------------------------------------------------------------------------------------------------------------------
variable "cors_origins" {
  type = map(list(string))
  default = {
    dev  = ["*"]
    prod = ["https://mediacodex.net"]
  }
}

variable "cors_expose" {
  type = map(list(string))
  default = {
    dev  = ["*"]
    prod = []
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Toggles
# ----------------------------------------------------------------------------------------------------------------------
variable "first_deploy" {
  type        = bool
  description = "Disables some resources that depend on other services being deployed"
  default     = false
}

# ----------------------------------------------------------------------------------------------------------------------
# SSM Params
# ----------------------------------------------------------------------------------------------------------------------
data "aws_ssm_parameter" "core_gateway_domain" {
  name = "/core/gateway-domain"
}

data "aws_ssm_parameter" "core_cognito_endpoint" {
  name = "/core/cognito-endpoint"
}

data "aws_ssm_parameter" "core_cognito_audiences" {
  name = "/core/cognito-audiences"
}
