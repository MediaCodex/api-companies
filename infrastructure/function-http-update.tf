resource "aws_lambda_function" "http_update" {
  function_name = "companies-http-update"
  role          = aws_iam_role.lambda_http_update.arn

  // handler
  source_code_hash = filebase64sha256("../build/http-update.zip")
  filename         = "../build/http-update.zip"
  handler          = "index.default"

  // runtime
  runtime = "nodejs18.x"
  timeout = "15"
}

resource "aws_iam_role" "lambda_http_update" {
  name               = "companies-http-update"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

module "lambda_http_update_gateway" {
  source = "./modules/lambda"
  method = "PUT"
  path   = "/companies/{id}"

  function_name       = "companies-http-update"
  function_invoke_arn = aws_lambda_function.http_update.invoke_arn

  gateway_id            = aws_apigatewayv2_api.public.id
  gateway_execution_arn = aws_apigatewayv2_api.public.execution_arn

  authorizer_id = aws_apigatewayv2_authorizer.public.id
}

/*
 * Permissions
 */
module "lambda_http_update_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_http_update.id
  table  = aws_dynamodb_table.companies.arn
  write  = true
  read   = true
}

module "lambda_http_update_cloudwatch" {
  source = "./modules/iam-cloudwatch"
  role   = aws_iam_role.lambda_http_update.id
  name   = "companies-http-update"
}
