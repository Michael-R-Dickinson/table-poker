import { useCallback, useRef, useState } from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';
import { logger } from '@/utils/logger';

interface PeerConnectionInfo {
  connection: RTCPeerConnection;
  dataChannel: any;
  playerId: string;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

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
      setConnectedPlayers((prev) => prev.filter((id) => id !== playerId));
      onPlayerDisconnected?.(playerId);
    },
    [onPlayerDisconnected],
  );

  const createPeerConnection = useCallback(
    (playerId: string) => {
      logger.info(`Creating peer connection for player: ${playerId}`);

      const peerConnection = new RTCPeerConnection(ICE_SERVERS);
      const dataChannel = peerConnection.createDataChannel('game-data', {
        ordered: true,
      });

      const peerInfo: PeerConnectionInfo = {
        connection: peerConnection,
        dataChannel,
        playerId,
        connectionState: 'connecting',
      };

      (dataChannel as any).addEventListener('open', () => {
        logger.info(`Data channel opened for player: ${playerId}`);
        peerInfo.connectionState = 'connected';
        handleConnect(playerId);
      });

      (dataChannel as any).addEventListener('close', () => {
        logger.info(`Data channel closed for player: ${playerId}`);
        peerInfo.connectionState = 'disconnected';
        handleDisconnect(playerId);
      });

      (dataChannel as any).addEventListener('message', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          onDataChannelMessage?.(playerId, data);
        } catch (err) {
          logger.error(`Failed to parse data channel message from ${playerId}:`, err);
        }
      });

      (peerConnection as any).addEventListener('icecandidate', (event: any) => {
        if (event.candidate) {
          logger.info(`Sending ICE candidate to player: ${playerId}`);
          sendSignalingMessage({
            type: 'ice-candidate',
            targetId: playerId,
            payload: {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
            },
          });
        }
      });

      (peerConnection as any).addEventListener('connectionstatechange', () => {
        logger.info(
          `Connection state changed for ${playerId}:`,
          peerConnection.connectionState,
        );
        if (
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'disconnected'
        ) {
          peerInfo.connectionState = peerConnection.connectionState;
          handleDisconnect(playerId);
        }
      });

      peerConnectionsRef.current.set(playerId, peerInfo);
      return peerInfo;
    },
    [sendSignalingMessage, handleConnect, handleDisconnect, onDataChannelMessage],
  );

  const handlePlayerJoin = useCallback(
    async (playerId: string) => {
      logger.info(`Player joining: ${playerId}`);

      if (peerConnectionsRef.current.has(playerId)) {
        logger.info(`Player ${playerId} already has a connection`);
        return;
      }

      const peerInfo = createPeerConnection(playerId);

      try {
        const offer = await peerInfo.connection.createOffer();
        await peerInfo.connection.setLocalDescription(offer);

        logger.info(`Sending offer to player: ${playerId}`);
        sendSignalingMessage({
          type: 'offer',
          targetId: playerId,
          payload: {
            sdp: offer.sdp,
            type: 'offer',
          },
        });
      } catch (err) {
        logger.error(`Failed to create offer for ${playerId}:`, err);
        peerConnectionsRef.current.delete(playerId);
      }
    },
    [createPeerConnection, sendSignalingMessage],
  );

  const handleAnswer = useCallback(async (playerId: string, answer: any) => {
    logger.info(`Received answer from player: ${playerId}`);

    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (!peerInfo) {
      logger.error(`No peer connection found for player: ${playerId}`);
      return;
    }

    try {
      await peerInfo.connection.setRemoteDescription(new RTCSessionDescription(answer));
      logger.info(`Remote description set for player: ${playerId}`);
    } catch (err) {
      logger.error(`Failed to set remote description for ${playerId}:`, err);
    }
  }, []);

  const handleIceCandidate = useCallback(async (playerId: string, candidate: any) => {
    logger.info(`Received ICE candidate from player: ${playerId}`);

    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (!peerInfo) {
      logger.error(`No peer connection found for player: ${playerId}`);
      return;
    }

    try {
      await peerInfo.connection.addIceCandidate(
        new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        }),
      );
      logger.info(`ICE candidate added for player: ${playerId}`);
    } catch (err) {
      logger.error(`Failed to add ICE candidate for ${playerId}:`, err);
    }
  }, []);

  const handleSignalingMessage = useCallback(
    (message: SignalingMessage) => {
      const senderId = message.senderId;
      if (!senderId) {
        logger.error('Received message without senderId');
        return;
      }

      switch (message.type) {
        case 'join':
          handlePlayerJoin(senderId);
          break;
        case 'answer':
          handleAnswer(senderId, message.payload);
          break;
        case 'ice-candidate':
          handleIceCandidate(senderId, message.payload);
          break;
        default:
          logger.warn('Unknown message type:', message.type);
      }
    },
    [handlePlayerJoin, handleAnswer, handleIceCandidate],
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
    setConnectedPlayers([]);
  }, []);

  return {
    connectedPlayers,
    handleSignalingMessage,
    broadcastToPlayers,
    sendToPlayer,
    disconnectPlayer,
    cleanup,
  };
}
