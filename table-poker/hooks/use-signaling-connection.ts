import { useState, useRef, useCallback, useEffect } from 'react';
import { SIGNALING_SERVER_URL } from '@/constants/signaling';
import type { SignalingMessage } from '@/types/signaling';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseSignalingConnectionProps {
  playerId?: string;
  gameId?: string;
  onMessage?: (message: SignalingMessage) => void;
}

export function useSignalingConnection({
  playerId,
  gameId,
  onMessage,
}: UseSignalingConnectionProps = {}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((playerIdOverride?: string, gameIdOverride?: string) => {
    const finalPlayerId = playerIdOverride || playerId;
    const finalGameId = gameIdOverride || gameId;

    if (!finalPlayerId || !finalGameId) {
      setError('Player ID and Game ID are required');
      setConnectionState('error');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    try {
      setConnectionState('connecting');
      setError(null);

      const url = `${SIGNALING_SERVER_URL}?playerId=${encodeURIComponent(finalPlayerId)}&gameId=${encodeURIComponent(finalGameId)}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState('connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: SignalingMessage = JSON.parse(event.data);
          console.log('Received message:', message);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setConnectionState('error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionState('disconnected');
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnectionState('error');
    }
  }, [playerId, gameId, onMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setConnectionState('disconnected');
    }
  }, []);

  const sendMessage = useCallback((message: Omit<SignalingMessage, 'senderId'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
