import { logger } from './shared/logger';

const PING_INTERVAL_MS = 3000; // Send ping every 3 seconds
const MAX_MISSED_PONGS = 3; // Disconnect after 3 missed pongs (9 seconds)

export interface HeartbeatConfig {
  dataChannel: any; // RTCDataChannel from react-native-webrtc
  onDisconnect: () => void;
  logPrefix?: string; // Optional prefix for log messages (e.g., "Player-ABC" or "Host->Player-123")
}

export interface HeartbeatCleanup {
  cleanup: () => void;
}

/**
 * Manages ping/pong heartbeat for a WebRTC data channel.
 *
 * - Sends ping every 3 seconds
 * - Expects pong response within 9 seconds (3 missed pongs)
 * - Calls onDisconnect callback when threshold is reached
 * - Returns cleanup function to stop heartbeat
 *
 * Usage:
 * ```typescript
 * const { cleanup } = createDataChannelHeartbeat({
 *   dataChannel,
 *   onDisconnect: () => handleDisconnect(playerId),
 *   logPrefix: 'Host->Player-123'
 * });
 *
 * // Later, when cleaning up:
 * cleanup();
 * ```
 */
export function createDataChannelHeartbeat(config: HeartbeatConfig): HeartbeatCleanup {
  const { dataChannel, onDisconnect, logPrefix = 'Heartbeat' } = config;

  let missedPongs = 0;
  let pingInterval: ReturnType<typeof setInterval> | null = null;
  let messageListener: ((event: MessageEvent) => void) | null = null;

  // Send ping message
  const sendPing = () => {
    if (dataChannel.readyState !== 'open') {
      // logger.debug(`[${logPrefix}] Data channel not open, skipping ping`);
      return;
    }

    try {
      const pingMessage = JSON.stringify({
        type: 'ping',
        timestamp: Date.now(),
      });
      dataChannel.send(pingMessage);
      missedPongs++;

      // Only log when missed pongs > 1 (potential issue)
      if (missedPongs > 1) {
        logger.debug(
          `[${logPrefix}] Sent ping (missed pongs: ${missedPongs}/${MAX_MISSED_PONGS})`,
        );
      }

      // Check if we've exceeded the threshold
      if (missedPongs > MAX_MISSED_PONGS) {
        logger.warn(
          `[${logPrefix}] Exceeded max missed pongs (${MAX_MISSED_PONGS}), triggering disconnect`,
        );
        cleanup();
        onDisconnect();
      }
    } catch (error) {
      logger.error(`[${logPrefix}] Failed to send ping:`, error);
    }
  };

  // Handle incoming messages (listen for pong)
  messageListener = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string);

      if (data.type === 'ping') {
        // Respond with pong
        const pongMessage = JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
        });
        dataChannel.send(pongMessage);
        // logger.debug(`[${logPrefix}] Received ping, sent pong`);
      } else if (data.type === 'pong') {
        // Reset missed pongs counter
        const previousMissed = missedPongs;
        missedPongs = 0;

        // Only log when recovering from missed pongs > 1
        if (previousMissed > 1) {
          logger.debug(
            `[${logPrefix}] Received pong (reset from ${previousMissed} missed)`,
          );
        }
      }
    } catch (error) {
      // Not a JSON message or not a ping/pong message, ignore
      // This is expected for game state and player action messages
    }
  };

  // Attach message listener
  dataChannel.addEventListener('message', messageListener);

  // Start ping interval
  pingInterval = setInterval(sendPing, PING_INTERVAL_MS);

  // logger.info(`[${logPrefix}] Heartbeat started`);

  // Cleanup function
  const cleanup = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }

    if (messageListener) {
      dataChannel.removeEventListener('message', messageListener);
      messageListener = null;
    }

    // logger.info(`[${logPrefix}] Heartbeat stopped`);
  };

  return { cleanup };
}
