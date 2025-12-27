import json
import os
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
apigateway_management = None

CONNECTIONS_TABLE = os.environ['CONNECTIONS_TABLE']
REGION = os.environ['REGION']

connections_table = dynamodb.Table(CONNECTIONS_TABLE)


def lambda_handler(event, context):
    """
    Main handler for WebSocket signaling server.
    Routes requests based on route key: $connect, $disconnect, $default
    """
    route_key = event.get('requestContext', {}).get('routeKey')
    connection_id = event.get('requestContext', {}).get('connectionId')

    print(f"Route: {route_key}, ConnectionId: {connection_id}")

    if route_key == '$connect':
        return handle_connect(event, connection_id)
    elif route_key == '$disconnect':
        return handle_disconnect(event, connection_id)
    elif route_key == '$default':
        return handle_message(event, connection_id)
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Unknown route'})
        }


def handle_connect(event, connection_id):
    """
    Handle new WebSocket connection.
    Store connection metadata in DynamoDB.
    """
    try:
        # Extract query parameters (playerId, gameId) if provided
        query_params = event.get('queryStringParameters') or {}
        player_id = query_params.get('playerId', 'unknown')
        game_id = query_params.get('gameId', 'unknown')

        # Calculate TTL (2 hours from now)
        ttl = int((datetime.now() + timedelta(hours=2)).timestamp())

        # Store connection in DynamoDB
        connections_table.put_item(
            Item={
                'connectionId': connection_id,
                'playerId': player_id,
                'gameId': game_id,
                'connectedAt': datetime.now().isoformat(),
                'ttl': ttl
            }
        )

        print(f"Connection stored: {connection_id}, Player: {player_id}, Game: {game_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connected successfully'})
        }
    except Exception as e:
        print(f"Error in handle_connect: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to connect'})
        }


def handle_disconnect(event, connection_id):
    """
    Handle WebSocket disconnection.
    Remove connection from DynamoDB.
    """
    try:
        connections_table.delete_item(
            Key={'connectionId': connection_id}
        )

        print(f"Connection removed: {connection_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Disconnected successfully'})
        }
    except Exception as e:
        print(f"Error in handle_disconnect: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to disconnect'})
        }


def handle_message(event, connection_id):
    """
    Handle signaling messages (offer, answer, ICE candidates, join).
    Route messages to the intended recipient.
    """
    try:
        body = json.loads(event.get('body', '{}'))
        message_type = body.get('type')
        target_id = body.get('targetId')
        payload = body.get('payload')

        print(f"Message type: {message_type}, Target: {target_id}")

        # Get sender info from DynamoDB
        sender = connections_table.get_item(Key={'connectionId': connection_id})
        sender_data = sender.get('Item', {})

        # Query all connections in the same game
        game_id = sender_data.get('gameId')
        if not game_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Sender not in a game'})
            }

        response = connections_table.query(
            IndexName='gameId-index',
            KeyConditionExpression='gameId = :gid',
            ExpressionAttributeValues={':gid': game_id}
        )

        game_connections = response.get('Items', [])

        # Special handling for 'join' message - send to HOST
        if message_type == 'join':
            # Find host (connection with playerId='HOST')
            target_connection_id = None
            for item in game_connections:
                if item.get('playerId') == 'HOST':
                    target_connection_id = item.get('connectionId')
                    break

            if not target_connection_id:
                print(f"Host not found in game {game_id}")
                # Send error message back to sender
                domain = event.get('requestContext', {}).get('domainName')
                stage = event.get('requestContext', {}).get('stage')

                global apigateway_management
                if apigateway_management is None:
                    apigateway_management = boto3.client(
                        'apigatewaymanagementapi',
                        endpoint_url=f"https://{domain}/{stage}"
                    )

                error_message = {
                    'type': 'error',
                    'payload': {
                        'code': 'HOST_NOT_FOUND',
                        'message': 'No host found for this game code. Please check the code and try again.'
                    }
                }

                try:
                    apigateway_management.post_to_connection(
                        ConnectionId=connection_id,
                        Data=json.dumps(error_message).encode('utf-8')
                    )
                    print(f"Error message sent to {connection_id}")
                except Exception as e:
                    print(f"Failed to send error message: {str(e)}")

                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Error sent to client'})
                }

            if target_connection_id == connection_id:
                print(f"Host cannot join their own game")
                # Send error message back to sender
                domain = event.get('requestContext', {}).get('domainName')
                stage = event.get('requestContext', {}).get('stage')

                global apigateway_management
                if apigateway_management is None:
                    apigateway_management = boto3.client(
                        'apigatewaymanagementapi',
                        endpoint_url=f"https://{domain}/{stage}"
                    )

                error_message = {
                    'type': 'error',
                    'payload': {
                        'code': 'INVALID_JOIN',
                        'message': 'Host cannot join their own game.'
                    }
                }

                try:
                    apigateway_management.post_to_connection(
                        ConnectionId=connection_id,
                        Data=json.dumps(error_message).encode('utf-8')
                    )
                    print(f"Error message sent to {connection_id}")
                except Exception as e:
                    print(f"Failed to send error message: {str(e)}")

                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Error sent to client'})
                }
        else:
            # For other messages, targetId is required
            if not target_id:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'targetId is required'})
                }

            # Find target connection by playerId
            target_connection_id = None
            for item in game_connections:
                if item.get('playerId') == target_id:
                    target_connection_id = item.get('connectionId')
                    break

            if not target_connection_id:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'Target player not found'})
                }

        # Send message to target using API Gateway Management API
        domain = event.get('requestContext', {}).get('domainName')
        stage = event.get('requestContext', {}).get('stage')

        global apigateway_management
        if apigateway_management is None:
            apigateway_management = boto3.client(
                'apigatewaymanagementapi',
                endpoint_url=f"https://{domain}/{stage}"
            )

        message_to_send = {
            'type': message_type,
            'senderId': sender_data.get('playerId'),
            'payload': payload
        }

        apigateway_management.post_to_connection(
            ConnectionId=target_connection_id,
            Data=json.dumps(message_to_send).encode('utf-8')
        )

        print(f"Message sent from {connection_id} to {target_connection_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Message sent successfully'})
        }

    except Exception as e:
        print(f"Error in handle_message: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Failed to handle message: {str(e)}'})
        }
