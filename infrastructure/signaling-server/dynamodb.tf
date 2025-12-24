resource "aws_dynamodb_table" "websocket_connections" {
  name           = "poker-signaling-connections"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }

  attribute {
    name = "gameId"
    type = "S"
  }

  global_secondary_index {
    name            = "gameId-index"
    hash_key        = "gameId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "poker-signaling-connections"
    Environment = "prod"
    Project     = "table-poker"
  }
}
