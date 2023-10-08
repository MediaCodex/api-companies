resource "aws_lambda_function" "http_create" {
  function_name = "companies-http-create"
  role          = aws_iam_role.lambda_http_create.arn

  // handler
  source_code_hash = filebase64sha256("../build/http-create.zip")
  filename         = "../dist/http-create.zip"
  handler          = "index.default"

  // runtime
  runtime = "nodejs18.x"
  timeout = "15"
}

resource "aws_iam_role" "lambda_http_create" {
  name               = "companies-http-create"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

module "lambda_http_create_gateway" {
  source = "./modules/lambda"
  method = "POST"
  path   = "/companies"

  function_name       = "companies-http-create"
  function_invoke_arn = aws_lambda_function.http_create.invoke_arn

  gateway_id            = aws_apigatewayv2_api.public.id
  gateway_execution_arn = aws_apigatewayv2_api.public.execution_arn

  authorizer_id = aws_apigatewayv2_authorizer.public.id
}

/*
 * Permissions
 */
module "lambda_http_create_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_http_create.id
  table  = aws_dynamodb_table.companies.arn
  write  = true
  read   = true
}

module "lambda_http_create_cloudwatch" {
  source = "./modules/iam-cloudwatch"
  role   = aws_iam_role.lambda_http_create.id
  name   = "companies-http-create"
}
