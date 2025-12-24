output "websocket_url" {
  description = "WebSocket API URL"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}

output "websocket_api_id" {
  description = "WebSocket API ID"
  value       = aws_apigatewayv2_api.websocket_api.id
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.signaling_handler.function_name
}

output "dynamodb_table_name" {
  description = "DynamoDB connections table name"
  value       = aws_dynamodb_table.websocket_connections.name
}
