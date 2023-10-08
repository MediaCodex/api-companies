locals {
  policy = {
    Version = jsondecode(data.aws_iam_policy_document.read.json).Version
    Statement = concat(
      jsondecode(var.read == true ? data.aws_iam_policy_document.read.json : "{ \"Statement\": [] }").Statement,
      jsondecode(var.write == true ? data.aws_iam_policy_document.write.json : "{ \"Statement\": [] }").Statement,
      jsondecode(var.delete == true ? data.aws_iam_policy_document.delete.json : "{ \"Statement\": [] }").Statement,
      jsondecode(var.stream == true ? data.aws_iam_policy_document.stream.json : "{ \"Statement\": [] }").Statement
    )
  }
}

resource "aws_iam_role_policy" "dynamodb" {
  name   = "DynamoDB"
  role   = var.role
  policy = jsonencode(local.policy)
}

data "aws_iam_policy_document" "read" {
  statement {
    sid = "Read"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:BatchGetItem"
    ]
    resources = [
      var.table,
      "${var.table}/index/*"
    ]
  }
}

data "aws_iam_policy_document" "write" {
  statement {
    sid = "Write"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:UpdateTimeToLive"
    ]
    resources = [var.table]
  }
}

data "aws_iam_policy_document" "delete" {
  statement {
    sid = "Delete"
    actions = [
      "dynamodb:Deleteitem"
    ]
    resources = [var.table]
  }
}

data "aws_iam_policy_document" "stream" {
  statement {
    sid = "Stream"
    actions = [
      "dynamodb:ListStreams",
      "dynamodb:DescribeStream",
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator"
    ]
    resources = [
      "${var.table}/stream/*"
    ]
  }
}