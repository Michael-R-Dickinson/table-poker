data "archive_file" "signaling_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambda/signaling"
  output_path = "${path.module}/../../lambda/signaling.zip"
}

resource "aws_lambda_function" "signaling_handler" {
  filename         = data.archive_file.signaling_lambda_zip.output_path
  function_name    = "poker-signaling-handler"
  role            = aws_iam_role.signaling_lambda_role.arn
  handler         = "handler.lambda_handler"
  source_code_hash = data.archive_file.signaling_lambda_zip.output_base64sha256
  runtime         = "python3.12"
  timeout         = 30

  environment {
    variables = {
      CONNECTIONS_TABLE = aws_dynamodb_table.websocket_connections.name
      REGION           = var.aws_region
    }
  }

  tags = {
    Name        = "poker-signaling-handler"
    Environment = "prod"
    Project     = "table-poker"
  }
}

resource "aws_lambda_permission" "apigw_lambda_connect" {
  statement_id  = "AllowAPIGatewayInvokeConnect"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.signaling_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "signaling_lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.signaling_handler.function_name}"
  retention_in_days = 7

  tags = {
    Name        = "poker-signaling-lambda-logs"
    Environment = "prod"
    Project     = "table-poker"
  }
}
