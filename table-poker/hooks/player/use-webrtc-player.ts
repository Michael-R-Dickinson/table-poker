import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';
import { webrtcLogger, logger as mainLogger } from '@/utils/shared/logger';
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
    webrtcLogger.debug('Creating peer connection to host');

    // Clear any queued ICE candidates from previous connection attempts
    iceCandidateQueueRef = [];

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    (peerConnection as any).addEventListener('datachannel', (event: any) => {
      webrtcLogger.debug('Data channel received from host');
      const dataChannel = event.channel;
      dataChannelRef = dataChannel;

      (dataChannel as any).addEventListener('open', () => {
        webrtcLogger.debug('Data channel opened');
        setWebRTCState({ connectionState: 'connected' });

        // Start heartbeat
        const { cleanup } = createDataChannelHeartbeat({
          dataChannel,
          onDisconnect: () => {
            webrtcLogger.warn('Heartbeat timeout - disconnected from host');
            setWebRTCState({ connectionState: 'disconnected' });
            callbacksRef.onDisconnected?.();
          },
          logPrefix: 'Player->Host',
        });
        heartbeatCleanupRef = cleanup;

        callbacksRef.onConnected?.();
      });

      (dataChannel as any).addEventListener('close', () => {
        webrtcLogger.debug('Data channel closed');

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

          // Filter out ping/pong messages - these are handled by the heartbeat utility
          if (data.type === 'ping' || data.type === 'pong') {
            return;
          }

          callbacksRef.onDataChannelMessage?.(data);
        } catch (err) {
          mainLogger.error('Failed to parse data channel message:', {
            error: err,
            rawData: event.data,
          });
        }
      });
    });

    (peerConnection as any).addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        webrtcLogger.debug('Sending ICE candidate to host');
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
      webrtcLogger.debug('Connection state changed:', peerConnection.connectionState);
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
      webrtcLogger.debug('Received offer from host');

      if (!peerConnectionRef) {
        createPeerConnection();
      }

      const peerConnection = peerConnectionRef;
      if (!peerConnection) {
        mainLogger.error('Failed to create peer connection');
        return;
      }

      try {
        setWebRTCState({ connectionState: 'connecting' });

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        webrtcLogger.debug('Remote description set');

        // Drain queued ICE candidates now that remote description is set
        if (iceCandidateQueueRef.length > 0) {
          webrtcLogger.debug(
            `Adding ${iceCandidateQueueRef.length} queued ICE candidates`,
          );
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
              mainLogger.error('Failed to add queued ICE candidate:', {
                error: err,
                candidate,
              });
            }
          }
          iceCandidateQueueRef = [];
          webrtcLogger.debug('Queued ICE candidates processed');
        }

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        webrtcLogger.debug('Local description set');

        sendSignalingMessage({
          type: 'answer',
          targetId: HOST_PLAYER_ID,
          payload: {
            sdp: answer.sdp,
            type: 'answer',
          },
        });
        webrtcLogger.debug('Answer sent to host');
      } catch (err) {
        mainLogger.error('Failed to handle offer:', {
          error: err,
          offer,
        });
        setWebRTCState({ connectionState: 'disconnected' });
      }
    },
    [createPeerConnection, sendSignalingMessage, setWebRTCState],
  );

  const handleIceCandidate = useCallback(async (candidate: any) => {
    webrtcLogger.debug('Received ICE candidate from host');

    if (!peerConnectionRef) {
      webrtcLogger.debug('Queueing ICE candidate until peer connection is ready');
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
      webrtcLogger.debug('ICE candidate added');
    } catch (err) {
      mainLogger.error('Failed to add ICE candidate:', {
        error: err,
        candidate,
      });
    }
  }, []);

  const handleSignalingMessage = useCallback(
    (message: SignalingMessage) => {
      webrtcLogger.debug('Received signaling message:', {
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
          webrtcLogger.debug('Player connection confirmed by host');
          break;
        case 'error':
          mainLogger.error('Signaling error received:', {
            message,
          });
          break;
        default:
          webrtcLogger.debug('Unknown message type:', message.type);
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
        mainLogger.error('Failed to send to host:', {
          error: err,
          data,
        });
      }
    } else {
      webrtcLogger.warn('Data channel is not open');
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
