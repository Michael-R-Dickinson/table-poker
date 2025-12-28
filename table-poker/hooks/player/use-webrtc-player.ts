import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';
import { logger } from '@/utils/shared/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';
import { webrtcPlayerAtom } from '@/store/webrtc-player';
import type { PlayerConnectionState } from '@/store/webrtc-player';
import { createDataChannelHeartbeat } from '@/utils/data-channel-heartbeat';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface UseWebRTCPlayerProps {
  sendSignalingMessage: (message: Omit<SignalingMessage, 'senderId'>) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onDataChannelMessage?: (data: any) => void;
}

// Module-level refs to persist across component unmounts
let peerConnectionRef: RTCPeerConnection | null = null;
let dataChannelRef: any = null;
let iceCandidateQueueRef: any[] = [];
let heartbeatCleanupRef: (() => void) | null = null;
let callbacksRef: {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onDataChannelMessage?: (data: any) => void;
} = {};

export function useWebRTCPlayer({
  sendSignalingMessage,
  onConnected,
  onDisconnected,
  onDataChannelMessage,
}: UseWebRTCPlayerProps) {
  const [{ connectionState }, setWebRTCState] = useAtom(webrtcPlayerAtom);

  // Update callbacks ref whenever they change
  useEffect(() => {
    callbacksRef = {
      onConnected,
      onDisconnected,
      onDataChannelMessage,
    };
  }, [onConnected, onDisconnected, onDataChannelMessage]);

  const updateConnectionState = useCallback(
    (state: PlayerConnectionState) => {
      setWebRTCState({ connectionState: state });
    },
    [setWebRTCState],
  );

  const createPeerConnection = useCallback(() => {
    logger.info('Creating peer connection to host');

    // Clear any queued ICE candidates from previous connection attempts
    iceCandidateQueueRef = [];

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    (peerConnection as any).addEventListener('datachannel', (event: any) => {
      logger.info('Data channel received from host');
      const dataChannel = event.channel;
      dataChannelRef = dataChannel;

      (dataChannel as any).addEventListener('open', () => {
        logger.info('Data channel opened');
        setWebRTCState({ connectionState: 'connected' });

        // Start heartbeat
        const { cleanup } = createDataChannelHeartbeat({
          dataChannel,
          onDisconnect: () => {
            logger.warn('Heartbeat timeout - disconnected from host');
            setWebRTCState({ connectionState: 'disconnected' });
            callbacksRef.onDisconnected?.();
          },
          logPrefix: 'Player->Host',
        });
        heartbeatCleanupRef = cleanup;

        callbacksRef.onConnected?.();
      });

      (dataChannel as any).addEventListener('close', () => {
        logger.info('Data channel closed');

        // Clean up heartbeat
        if (heartbeatCleanupRef) {
          heartbeatCleanupRef();
          heartbeatCleanupRef = null;
        }

        setWebRTCState({ connectionState: 'disconnected' });
        callbacksRef.onDisconnected?.();
      });

      (dataChannel as any).addEventListener('message', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          callbacksRef.onDataChannelMessage?.(data);
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
        setWebRTCState({ connectionState: 'connected' });
      } else if (peerConnection.connectionState === 'connecting') {
        setWebRTCState({ connectionState: 'connecting' });
      }

      // Ignore 'failed' and 'disconnected' states for temporary blips
      // Heartbeat will handle timeouts, and data channel 'close' event triggers immediate disconnect
    });

    peerConnectionRef = peerConnection;
    return peerConnection;
  }, [sendSignalingMessage, setWebRTCState]);

  const handleOffer = useCallback(
    async (offer: any) => {
      logger.info('Received offer from host');

      if (!peerConnectionRef) {
        createPeerConnection();
      }

      const peerConnection = peerConnectionRef;
      if (!peerConnection) {
        logger.error('Failed to create peer connection');
        return;
      }

      try {
        setWebRTCState({ connectionState: 'connecting' });

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        logger.info('Remote description set');

        // Drain queued ICE candidates now that remote description is set
        if (iceCandidateQueueRef.length > 0) {
          logger.info(`Adding ${iceCandidateQueueRef.length} queued ICE candidates`);
          for (const candidate of iceCandidateQueueRef) {
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
          iceCandidateQueueRef = [];
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
        setWebRTCState({ connectionState: 'disconnected' });
      }
    },
    [createPeerConnection, sendSignalingMessage, setWebRTCState],
  );

  const handleIceCandidate = useCallback(async (candidate: any) => {
    logger.info('Received ICE candidate from host');

    if (!peerConnectionRef) {
      logger.info('Queueing ICE candidate until peer connection is ready');
      iceCandidateQueueRef.push(candidate);
      return;
    }

    try {
      await peerConnectionRef.addIceCandidate(
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
    if (dataChannelRef?.readyState === 'open') {
      try {
        dataChannelRef.send(JSON.stringify(data));
        console.log('Sent to host:', data);
      } catch (err) {
        logger.error('Failed to send to host:', err);
      }
    } else {
      logger.error('Data channel is not open');
    }
  }, []);

  const disconnect = useCallback(() => {
    // Clean up heartbeat if it exists (defensive cleanup)
    if (heartbeatCleanupRef) {
      heartbeatCleanupRef();
      heartbeatCleanupRef = null;
    }

    if (peerConnectionRef) {
      peerConnectionRef.close();
      peerConnectionRef = null;
    }
    if (dataChannelRef) {
      dataChannelRef = null;
    }
    iceCandidateQueueRef = [];
    setWebRTCState({ connectionState: 'disconnected' });
  }, [setWebRTCState]);

  return {
    connectionState,
    handleSignalingMessage,
    sendToHost,
    disconnect,
  };
}
