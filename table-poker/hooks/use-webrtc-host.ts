import { useCallback, useRef, useState, useMemo } from 'react';
import type { SignalingMessage } from '@/types/signaling';
import { logger } from '@/utils/logger';
import type { PeerConnectionInfo } from './webrtc-host/peer-connection-manager';
import { createSignalingHandlers } from './webrtc-host/signaling-handlers';

interface UseWebRTCHostProps {
  sendSignalingMessage: (message: Omit<SignalingMessage, 'senderId'>) => void;
  onPlayerConnected?: (playerId: string) => void;
  onPlayerDisconnected?: (playerId: string) => void;
  onDataChannelMessage?: (playerId: string, data: any) => void;
}

export function useWebRTCHost({
  sendSignalingMessage,
  onPlayerConnected,
  onPlayerDisconnected,
  onDataChannelMessage,
}: UseWebRTCHostProps) {
  const peerConnectionsRef = useRef<Map<string, PeerConnectionInfo>>(new Map());
  const iceCandidateQueuesRef = useRef<Map<string, any[]>>(new Map());
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);

  const handleConnect = useCallback(
    (playerId: string) => {
      setConnectedPlayers((prev) => [...prev, playerId]);
      onPlayerConnected?.(playerId);
    },
    [onPlayerConnected],
  );

  const handleDisconnect = useCallback(
    (playerId: string) => {
      peerConnectionsRef.current.delete(playerId);
      iceCandidateQueuesRef.current.delete(playerId);
      setConnectedPlayers((prev) => prev.filter((id) => id !== playerId));
      onPlayerDisconnected?.(playerId);
    },
    [onPlayerDisconnected],
  );

  const signalingHandlers = useMemo(
    () =>
      createSignalingHandlers({
        peerConnectionsRef,
        iceCandidateQueuesRef,
        sendSignalingMessage,
        onPlayerConnected: handleConnect,
        onPlayerDisconnected: handleDisconnect,
        onDataChannelMessage,
      }),
    [sendSignalingMessage, handleConnect, handleDisconnect, onDataChannelMessage],
  );

  const broadcastToPlayers = useCallback((data: any) => {
    const message = JSON.stringify(data);
    peerConnectionsRef.current.forEach((peerInfo, playerId) => {
      if (peerInfo.dataChannel?.readyState === 'open') {
        try {
          peerInfo.dataChannel.send(message);
        } catch (err) {
          logger.error(`Failed to send to player ${playerId}:`, err);
        }
      }
    });
  }, []);

  const sendToPlayer = useCallback((playerId: string, data: any) => {
    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (peerInfo?.dataChannel?.readyState === 'open') {
      try {
        peerInfo.dataChannel.send(JSON.stringify(data));
      } catch (err) {
        logger.error(`Failed to send to player ${playerId}:`, err);
      }
    } else {
      logger.error(`Player ${playerId} is not connected or data channel not open`);
    }
  }, []);

  const disconnectPlayer = useCallback(
    (playerId: string) => {
      const peerInfo = peerConnectionsRef.current.get(playerId);
      if (peerInfo) {
        peerInfo.connection.close();
        handleDisconnect(playerId);
      }
    },
    [handleDisconnect],
  );

  const cleanup = useCallback(() => {
    peerConnectionsRef.current.forEach((peerInfo) => {
      peerInfo.connection.close();
    });
    peerConnectionsRef.current.clear();
    iceCandidateQueuesRef.current.clear();
    setConnectedPlayers([]);
  }, []);

  return {
    connectedPlayers,
    handleSignalingMessage: signalingHandlers.handleSignalingMessage,
    broadcastToPlayers,
    sendToPlayer,
    disconnectPlayer,
    cleanup,
  };
}
