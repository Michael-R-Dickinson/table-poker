import { useCallback, useRef, useState } from 'react';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';

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

  const createPeerConnection = useCallback((playerId: string) => {
    console.log(`Creating peer connection for player: ${playerId}`);

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    const dataChannel = peerConnection.createDataChannel('game-data', {
      ordered: true,
      reliable: true,
    });

    const peerInfo: PeerConnectionInfo = {
      connection: peerConnection,
      dataChannel,
      playerId,
      connectionState: 'connecting',
    };

    dataChannel.onopen = () => {
      console.log(`Data channel opened for player: ${playerId}`);
      peerInfo.connectionState = 'connected';
      setConnectedPlayers(prev => [...prev, playerId]);
      onPlayerConnected?.(playerId);
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed for player: ${playerId}`);
      peerInfo.connectionState = 'disconnected';
      setConnectedPlayers(prev => prev.filter(id => id !== playerId));
      onPlayerDisconnected?.(playerId);
    };

    dataChannel.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        onDataChannelMessage?.(playerId, data);
      } catch (err) {
        console.error(`Failed to parse data channel message from ${playerId}:`, err);
      }
    };

    peerConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to player: ${playerId}`);
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
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state changed for ${playerId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        peerInfo.connectionState = peerConnection.connectionState;
        setConnectedPlayers(prev => prev.filter(id => id !== playerId));
        onPlayerDisconnected?.(playerId);
      }
    };

    peerConnectionsRef.current.set(playerId, peerInfo);
    return peerInfo;
  }, [sendSignalingMessage, onPlayerConnected, onPlayerDisconnected, onDataChannelMessage]);

  const handlePlayerJoin = useCallback(async (playerId: string) => {
    console.log(`Player joining: ${playerId}`);

    if (peerConnectionsRef.current.has(playerId)) {
      console.log(`Player ${playerId} already has a connection`);
      return;
    }

    const peerInfo = createPeerConnection(playerId);

    try {
      const offer = await peerInfo.connection.createOffer();
      await peerInfo.connection.setLocalDescription(offer);

      console.log(`Sending offer to player: ${playerId}`);
      sendSignalingMessage({
        type: 'offer',
        targetId: playerId,
        payload: {
          sdp: offer.sdp,
          type: 'offer',
        },
      });
    } catch (err) {
      console.error(`Failed to create offer for ${playerId}:`, err);
      peerConnectionsRef.current.delete(playerId);
    }
  }, [createPeerConnection, sendSignalingMessage]);

  const handleAnswer = useCallback(async (playerId: string, answer: any) => {
    console.log(`Received answer from player: ${playerId}`);

    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (!peerInfo) {
      console.error(`No peer connection found for player: ${playerId}`);
      return;
    }

    try {
      await peerInfo.connection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log(`Remote description set for player: ${playerId}`);
    } catch (err) {
      console.error(`Failed to set remote description for ${playerId}:`, err);
    }
  }, []);

  const handleIceCandidate = useCallback(async (playerId: string, candidate: any) => {
    console.log(`Received ICE candidate from player: ${playerId}`);

    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (!peerInfo) {
      console.error(`No peer connection found for player: ${playerId}`);
      return;
    }

    try {
      await peerInfo.connection.addIceCandidate(
        new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        })
      );
      console.log(`ICE candidate added for player: ${playerId}`);
    } catch (err) {
      console.error(`Failed to add ICE candidate for ${playerId}:`, err);
    }
  }, []);

  const handleSignalingMessage = useCallback((message: SignalingMessage) => {
    const senderId = message.senderId;
    if (!senderId) {
      console.error('Received message without senderId');
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
        console.warn('Unknown message type:', message.type);
    }
  }, [handlePlayerJoin, handleAnswer, handleIceCandidate]);

  const broadcastToPlayers = useCallback((data: any) => {
    const message = JSON.stringify(data);
    peerConnectionsRef.current.forEach((peerInfo, playerId) => {
      if (peerInfo.dataChannel?.readyState === 'open') {
        try {
          peerInfo.dataChannel.send(message);
        } catch (err) {
          console.error(`Failed to send to player ${playerId}:`, err);
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
        console.error(`Failed to send to player ${playerId}:`, err);
      }
    } else {
      console.error(`Player ${playerId} is not connected or data channel not open`);
    }
  }, []);

  const disconnectPlayer = useCallback((playerId: string) => {
    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (peerInfo) {
      peerInfo.connection.close();
      peerConnectionsRef.current.delete(playerId);
      setConnectedPlayers(prev => prev.filter(id => id !== playerId));
      onPlayerDisconnected?.(playerId);
    }
  }, [onPlayerDisconnected]);

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
