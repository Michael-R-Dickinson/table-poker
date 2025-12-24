# Poker Signaling Server Infrastructure

WebSocket signaling server for WebRTC peer-to-peer connections in the table poker application.

## Architecture

- **API Gateway WebSocket API**: Manages persistent WebSocket connections
- **Lambda Function**: Python handler for routing signaling messages
- **DynamoDB**: Stores active connection metadata
- **Region**: us-west-2
- **Stage**: prod

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- OpenTofu/Terraform installed

### Deploy

```bash
cd infrastructure/signaling-server
tofu init
tofu plan
tofu apply
```

### Outputs

After deployment, you'll receive:
- `websocket_url`: WebSocket endpoint URL for client connections
- `websocket_api_id`: API Gateway WebSocket API ID
- `lambda_function_name`: Lambda function name
- `dynamodb_table_name`: DynamoDB table name

## Usage

### Client Connection

Connect to the WebSocket with query parameters:

```
wss://{api-id}.execute-api.us-west-2.amazonaws.com/prod?playerId={playerId}&gameId={gameId}
```

### Message Format

Send signaling messages in the following format:

```json
{
  "type": "offer|answer|ice-candidate",
  "targetId": "recipient-player-id",
  "payload": {
    // WebRTC signaling data
  }
}
```

### Routes

- `$connect`: Handles new connections, stores metadata in DynamoDB
- `$disconnect`: Handles disconnections, removes metadata from DynamoDB
- `$default`: Routes signaling messages between peers

## DynamoDB Schema

**Table**: `poker-signaling-connections`

- **Primary Key**: `connectionId` (String)
- **Attributes**:
  - `playerId` (String)
  - `gameId` (String)
  - `connectedAt` (String, ISO timestamp)
  - `ttl` (Number, Unix timestamp)
- **GSI**: `gameId-index` on `gameId`

## Lambda Handler

The Python Lambda handler routes messages based on route keys:

- **$connect**: Store connection with TTL (2 hours)
- **$disconnect**: Remove connection from DynamoDB
- **$default**: Route signaling messages to target player in same game

## Security

- No authentication currently implemented
- IAM roles follow least privilege principle
- CloudWatch logs enabled for debugging (7-day retention)
