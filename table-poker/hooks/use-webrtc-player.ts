import { useCallback, useRef, useState } from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';
import { logger } from '@/utils/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

interface UseWebRTCPlayerProps {
  sendSignalingMessage: (message: Omit<SignalingMessage, 'senderId'>) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onDataChannelMessage?: (data: any) => void;
}

export function useWebRTCPlayer({
  sendSignalingMessage,
  onConnected,
  onDisconnected,
  onDataChannelMessage,
}: UseWebRTCPlayerProps) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<any>(null);
  const iceCandidateQueueRef = useRef<any[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  const createPeerConnection = useCallback(() => {
    logger.info('Creating peer connection to host');

    // Clear any queued ICE candidates from previous connection attempts
    iceCandidateQueueRef.current = [];

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    (peerConnection as any).addEventListener('datachannel', (event: any) => {
      logger.info('Data channel received from host');
      const dataChannel = event.channel;
      dataChannelRef.current = dataChannel;

      (dataChannel as any).addEventListener('open', () => {
        logger.info('Data channel opened');
        setConnectionState('connected');
        onConnected?.();
      });

      (dataChannel as any).addEventListener('close', () => {
        logger.info('Data channel closed');
        setConnectionState('disconnected');
        onDisconnected?.();
      });

      (dataChannel as any).addEventListener('message', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          onDataChannelMessage?.(data);
        } catch (err) {
          logger.error('Failed to parse data channel message:', err);
        }
      });
    });

    (peerConnection as any).addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        logger.info('Sending ICE candidate to host');
        sendSignalingMessage({
          type: 'ice-candidate',
          targetId: HOST_PLAYER_ID,
          payload: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          },
        });
      }
    });

    (peerConnection as any).addEventListener('connectionstatechange', () => {
      logger.info('Connection state changed:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setConnectionState('connected');
      } else if (
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'disconnected'
      ) {
        setConnectionState('disconnected');
        onDisconnected?.();
      } else if (peerConnection.connectionState === 'connecting') {
        setConnectionState('connecting');
      }
    });

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [sendSignalingMessage, onConnected, onDisconnected, onDataChannelMessage]);

  const handleOffer = useCallback(
    async (offer: any) => {
      logger.info('Received offer from host');

      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        logger.error('Failed to create peer connection');
        return;
      }

      try {
        setConnectionState('connecting');

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        logger.info('Remote description set');

        // Drain queued ICE candidates now that remote description is set
        if (iceCandidateQueueRef.current.length > 0) {
          logger.info(
            `Adding ${iceCandidateQueueRef.current.length} queued ICE candidates`,
          );
          for (const candidate of iceCandidateQueueRef.current) {
            try {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate({
                  candidate: candidate.candidate,
                  sdpMLineIndex: candidate.sdpMLineIndex,
                  sdpMid: candidate.sdpMid,
                }),
              );
            } catch (err) {
              logger.error('Failed to add queued ICE candidate:', err);
            }
          }
          iceCandidateQueueRef.current = [];
          logger.info('Queued ICE candidates processed');
        }

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        logger.info('Local description set');

        sendSignalingMessage({
          type: 'answer',
          targetId: HOST_PLAYER_ID,
          payload: {
            sdp: answer.sdp,
            type: 'answer',
          },
        });
        logger.info('Answer sent to host');
      } catch (err) {
        logger.error('Failed to handle offer:', err);
        setConnectionState('disconnected');
      }
    },
    [createPeerConnection, sendSignalingMessage],
  );

  const handleIceCandidate = useCallback(async (candidate: any) => {
    logger.info('Received ICE candidate from host');

    if (!peerConnectionRef.current) {
      logger.info('Queueing ICE candidate until peer connection is ready');
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    try {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        }),
      );
      logger.info('ICE candidate added');
    } catch (err) {
      logger.error('Failed to add ICE candidate:', err);
    }
  }, []);

  const handleSignalingMessage = useCallback(
    (message: SignalingMessage) => {
      logger.info('Received signaling message:', {
        type: message.type,
        payload: message.payload,
      });

      switch (message.type) {
        case 'offer':
          handleOffer(message.payload);
          break;
        case 'ice-candidate':
          handleIceCandidate(message.payload);
          break;
        case 'player-connected':
          logger.info('Player connection confirmed by host');
          break;
        case 'error':
          logger.error('Signaling error received:', message.payload);
          break;
        default:
          logger.warn('Unknown message type:', message.type);
      }
    },
    [handleOffer, handleIceCandidate],
  );

  const sendToHost = useCallback((data: any) => {
    if (dataChannelRef.current?.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify(data));
        console.log('Sent to host:', data);
      } catch (err) {
        logger.error('Failed to send to host:', err);
      }
    } else {
      logger.error('Data channel is not open');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current = null;
    }
    iceCandidateQueueRef.current = [];
    setConnectionState('disconnected');
  }, []);

  return {
    connectionState,
    handleSignalingMessage,
    sendToHost,
    disconnect,
  };
}
