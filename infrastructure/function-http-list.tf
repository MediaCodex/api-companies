resource "aws_lambda_function" "http_list" {
  function_name = "companies-http-list"
  role          = aws_iam_role.lambda_http_list.arn

  // handler
  source_code_hash = filebase64sha256("../dist/http-list.zip")
  filename         = "../dist/http-list.zip"
  handler          = "index.default"

  // runtime
  runtime = "nodejs20.x"
  timeout = "15"
}

resource "aws_iam_role" "lambda_http_list" {
  name               = "companies-http-list"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

module "lambda_http_list_gateway" {
  source = "./modules/lambda"
  method = "GET"
  path   = "/companies"

  function_name       = "companies-http-list"
  function_invoke_arn = aws_lambda_function.http_list.invoke_arn

  gateway_id            = aws_apigatewayv2_api.public.id
  gateway_execution_arn = aws_apigatewayv2_api.public.execution_arn

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id
}

# ----------------------------------------------------------------------------------------------------------------------
# Permissions
# ----------------------------------------------------------------------------------------------------------------------
module "lambda_http_list_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_http_list.id
  table  = aws_dynamodb_table.companies.arn
  write  = true
  read   = true
}

module "lambda_http_list_cloudwatch" {
  source = "./modules/iam-cloudwatch"
  role   = aws_iam_role.lambda_http_list.id
  name   = "companies-http-list"
}
