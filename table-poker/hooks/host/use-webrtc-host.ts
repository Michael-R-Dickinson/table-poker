import { useCallback, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import type { SignalingMessage } from '@/types/signaling';
import { logger } from '@/utils/shared/logger';
import type { PeerConnectionInfo } from './peer-connection-manager';
import { createSignalingHandlers } from './signaling-handlers';
import { webrtcHostAtom } from '@/store/webrtc-host';

interface UseWebRTCHostProps {
  sendSignalingMessage: (message: Omit<SignalingMessage, 'senderId'>) => void;
  onPlayerConnected?: (playerId: string) => void;
  onPlayerDisconnected?: (playerId: string) => void;
  onDataChannelMessage?: (playerId: string, data: any) => void;
}

// Module-level refs to persist across component unmounts
let peerConnectionsRef: Map<string, PeerConnectionInfo> = new Map();
let iceCandidateQueuesRef: Map<string, any[]> = new Map();
let callbacksRef: {
  onPlayerConnected?: (playerId: string) => void;
  onPlayerDisconnected?: (playerId: string) => void;
  onDataChannelMessage?: (playerId: string, data: any) => void;
} = {};

export function useWebRTCHost({
  sendSignalingMessage,
  onPlayerConnected,
  onPlayerDisconnected,
  onDataChannelMessage,
}: UseWebRTCHostProps) {
  const [{ connectedPlayers }, setWebRTCState] = useAtom(webrtcHostAtom);

  // Update callbacks ref whenever they change
  useEffect(() => {
    callbacksRef = {
      onPlayerConnected,
      onPlayerDisconnected,
      onDataChannelMessage,
    };
  }, [onPlayerConnected, onPlayerDisconnected, onDataChannelMessage]);

  const handleConnect = useCallback(
    (playerId: string) => {
      setWebRTCState((prev) => ({
        connectedPlayers: [...prev.connectedPlayers, playerId],
      }));
      callbacksRef.onPlayerConnected?.(playerId);
    },
    [setWebRTCState],
  );

  const handleDisconnect = useCallback(
    (playerId: string) => {
      const peerInfo = peerConnectionsRef.get(playerId);

      // Clean up heartbeat if it exists (defensive cleanup)
      if (peerInfo?.heartbeatCleanup) {
        peerInfo.heartbeatCleanup();
        peerInfo.heartbeatCleanup = undefined;
      }

      peerConnectionsRef.delete(playerId);
      iceCandidateQueuesRef.delete(playerId);
      setWebRTCState((prev) => ({
        connectedPlayers: prev.connectedPlayers.filter((id) => id !== playerId),
      }));
      callbacksRef.onPlayerDisconnected?.(playerId);
    },
    [setWebRTCState],
  );

  const signalingHandlers = useMemo(
    () =>
      createSignalingHandlers({
        peerConnectionsRef: { current: peerConnectionsRef },
        iceCandidateQueuesRef: { current: iceCandidateQueuesRef },
        sendSignalingMessage,
        onPlayerConnected: handleConnect,
        onPlayerDisconnected: handleDisconnect,
        onDataChannelMessage: (playerId: string, data: any) => {
          callbacksRef.onDataChannelMessage?.(playerId, data);
        },
      }),
    [sendSignalingMessage, handleConnect, handleDisconnect],
  );

  const broadcastToPlayers = useCallback((data: any) => {
    const message = JSON.stringify(data);
    peerConnectionsRef.forEach((peerInfo, playerId) => {
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
    const peerInfo = peerConnectionsRef.get(playerId);
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
      const peerInfo = peerConnectionsRef.get(playerId);
      if (peerInfo) {
        peerInfo.connection.close();
        handleDisconnect(playerId);
      }
    },
    [handleDisconnect],
  );

  const cleanup = useCallback(() => {
    peerConnectionsRef.forEach((peerInfo) => {
      peerInfo.connection.close();
    });
    peerConnectionsRef.clear();
    iceCandidateQueuesRef.clear();
    setWebRTCState({ connectedPlayers: [] });
  }, [setWebRTCState]);

  return {
    connectedPlayers,
    handleSignalingMessage: signalingHandlers.handleSignalingMessage,
    broadcastToPlayers,
    sendToPlayer,
    disconnectPlayer,
    cleanup,
  };
}
