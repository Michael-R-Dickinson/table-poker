import { useCallback, useRef, useState } from 'react';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

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
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  const createPeerConnection = useCallback(() => {
    console.log('Creating peer connection to host');

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    (peerConnection as any).addEventListener('datachannel', (event: any) => {
      console.log('Data channel received from host');
      const dataChannel = event.channel;
      dataChannelRef.current = dataChannel;

      (dataChannel as any).addEventListener('open', () => {
        console.log('Data channel opened');
        setConnectionState('connected');
        onConnected?.();
      });

      (dataChannel as any).addEventListener('close', () => {
        console.log('Data channel closed');
        setConnectionState('disconnected');
        onDisconnected?.();
      });

      (dataChannel as any).addEventListener('message', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          onDataChannelMessage?.(data);
        } catch (err) {
          console.error('Failed to parse data channel message:', err);
        }
      });
    });

    (peerConnection as any).addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to host');
        sendSignalingMessage({
          type: 'ice-candidate',
          payload: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          },
        });
      }
    });

    (peerConnection as any).addEventListener('connectionstatechange', () => {
      console.log('Connection state changed:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setConnectionState('connected');
      } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        setConnectionState(peerConnection.connectionState as ConnectionState);
        onDisconnected?.();
      } else if (peerConnection.connectionState === 'connecting') {
        setConnectionState('connecting');
      }
    });

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [sendSignalingMessage, onConnected, onDisconnected, onDataChannelMessage]);

  const handleOffer = useCallback(async (offer: any) => {
    console.log('Received offer from host');

    if (!peerConnectionRef.current) {
      createPeerConnection();
    }

    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      console.error('Failed to create peer connection');
      return;
    }

    try {
      setConnectionState('connecting');

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      console.log('Remote description set');

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log('Local description set');

      sendSignalingMessage({
        type: 'answer',
        payload: {
          sdp: answer.sdp,
          type: 'answer',
        },
      });
      console.log('Answer sent to host');
    } catch (err) {
      console.error('Failed to handle offer:', err);
      setConnectionState('failed');
    }
  }, [createPeerConnection, sendSignalingMessage]);

  const handleIceCandidate = useCallback(async (candidate: any) => {
    console.log('Received ICE candidate from host');

    if (!peerConnectionRef.current) {
      console.error('No peer connection available');
      return;
    }

    try {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        })
      );
      console.log('ICE candidate added');
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  }, []);

  const handleSignalingMessage = useCallback((message: SignalingMessage) => {
    switch (message.type) {
      case 'offer':
        handleOffer(message.payload);
        break;
      case 'ice-candidate':
        handleIceCandidate(message.payload);
        break;
      case 'player-connected':
        console.log('Player connection confirmed by host');
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, [handleOffer, handleIceCandidate]);

  const sendToHost = useCallback((data: any) => {
    if (dataChannelRef.current?.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify(data));
      } catch (err) {
        console.error('Failed to send to host:', err);
      }
    } else {
      console.error('Data channel is not open');
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
    setConnectionState('disconnected');
  }, []);

  return {
    connectionState,
    handleSignalingMessage,
    sendToHost,
    disconnect,
  };
}
