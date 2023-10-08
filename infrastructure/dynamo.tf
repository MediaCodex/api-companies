resource "aws_dynamodb_table" "companies" {
  name                        = "${terraform.workspace}-companies"
  deletion_protection_enabled = true
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "slug"
    type = "S"
  }

  global_secondary_index {
    name               = "slug"
    hash_key           = "slug"
    projection_type    = "INCLUDE"
    non_key_attributes = ["id"]
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  point_in_time_recovery {
    enabled = true
  }
}
