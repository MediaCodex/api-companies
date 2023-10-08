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
variable "default_tags" {
  type        = map(string)
  description = "Common resource tags for all resources"
  default = {
    Service = "companies"
  }
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
data "aws_ssm_parameter" "gateway_public_domain" {
  name = "/gateway-public/domain"
}

data "aws_ssm_parameter" "gateway_public_cognito_endpoint" {
  name = "/gateway-public/cognito-endpoint"
}

data "aws_ssm_parameter" "gateway_public_cognito_audience" {
  name = "/gateway-public/cognito-audience"
}
