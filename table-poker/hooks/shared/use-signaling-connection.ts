import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { SIGNALING_SERVER_URL } from '@/constants/signaling';
import type { SignalingMessage } from '@/types/signaling';
import { logger } from '@/utils/shared/logger';
import { signalingConnectionAtom } from '@/store/signaling-connection';
import type { ConnectionState } from '@/store/signaling-connection';

interface UseSignalingConnectionProps {
  playerId?: string;
  gameId?: string;
  onMessage?: (message: SignalingMessage) => void;
}

// Module-level refs to persist across component unmounts
let wsRef: WebSocket | null = null;
let messageHandlerRef: ((message: SignalingMessage) => void) | null = null;

export function useSignalingConnection({
  playerId,
  gameId,
  onMessage,
}: UseSignalingConnectionProps = {}) {
  const [{ connectionState, error }, setSignalingState] = useAtom(
    signalingConnectionAtom,
  );

  const connect = useCallback(
    (playerIdOverride?: string, gameIdOverride?: string) => {
      const finalPlayerId = playerIdOverride || playerId;
      const finalGameId = gameIdOverride || gameId;

      if (!finalPlayerId || !finalGameId) {
        setSignalingState({
          connectionState: 'error',
          error: 'Player ID and Game ID are required',
        });
        return;
      }

      if (wsRef?.readyState === WebSocket.OPEN) {
        logger.info('Already connected');
        return;
      }

      try {
        setSignalingState({
          connectionState: 'connecting',
          error: null,
        });

        const url = `${SIGNALING_SERVER_URL}?playerId=${encodeURIComponent(finalPlayerId)}&gameId=${encodeURIComponent(finalGameId)}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
          logger.info('WebSocket connected');
          setSignalingState({
            connectionState: 'connected',
            error: null,
          });
        };

        ws.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            logger.info('Received message:', message);
            messageHandlerRef?.(message);
          } catch (err) {
            logger.error('Failed to parse message:', err);
          }
        };

        ws.onerror = (event) => {
          logger.error('WebSocket error:', event);
          setSignalingState({
            connectionState: 'error',
            error: 'Connection error occurred',
          });
        };

        ws.onclose = () => {
          logger.info('WebSocket disconnected');
          setSignalingState({
            connectionState: 'disconnected',
            error: null,
          });
          wsRef = null;
        };

        wsRef = ws;
      } catch (err) {
        logger.error('Failed to connect:', err);
        setSignalingState({
          connectionState: 'error',
          error: err instanceof Error ? err.message : 'Failed to connect',
        });
      }
    },
    [playerId, gameId, setSignalingState],
  );

  const disconnect = useCallback(() => {
    if (wsRef) {
      wsRef.close();
      wsRef = null;
      setSignalingState({
        connectionState: 'disconnected',
        error: null,
      });
    }
  }, [setSignalingState]);

  const sendMessage = useCallback((message: Omit<SignalingMessage, 'senderId'>) => {
    if (wsRef?.readyState === WebSocket.OPEN) {
      wsRef.send(JSON.stringify(message));
    } else {
      logger.error('WebSocket is not connected');
    }
  }, []);

  // Update the message handler ref whenever onMessage changes
  useEffect(() => {
    messageHandlerRef = onMessage || null;
  }, [onMessage]);

  return {
    connectionState,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
