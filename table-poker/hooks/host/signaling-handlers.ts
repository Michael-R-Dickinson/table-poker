import type { SignalingMessage } from '@/types/signaling';
import { webrtcLogger, logger as mainLogger } from '@/utils/shared/logger';
import type { PeerConnectionInfo } from './peer-connection-manager';
import {
  createPeerConnection,
  createOfferForPlayer,
  handleAnswer as handleAnswerForPeer,
  addIceCandidate,
} from './peer-connection-manager';

interface SignalingHandlerDependencies {
  peerConnectionsRef: React.RefObject<Map<string, PeerConnectionInfo>>;
  iceCandidateQueuesRef: React.RefObject<Map<string, any[]>>;
  sendSignalingMessage: (message: Omit<SignalingMessage, 'senderId'>) => void;
  onPlayerConnected: (playerId: string) => void;
  onPlayerDisconnected: (playerId: string) => void;
  onDataChannelMessage?: (playerId: string, data: any) => void;
}

export function createSignalingHandlers(deps: SignalingHandlerDependencies) {
  const {
    peerConnectionsRef,
    iceCandidateQueuesRef,
    sendSignalingMessage,
    onPlayerConnected,
    onPlayerDisconnected,
    onDataChannelMessage,
  } = deps;

  const handlePlayerJoin = async (playerId: string) => {
    webrtcLogger.debug(`Player joining: ${playerId}`);

    if (peerConnectionsRef.current.has(playerId)) {
      webrtcLogger.debug(`Player ${playerId} already has a connection`);
      return;
    }

    iceCandidateQueuesRef.current.set(playerId, []);

    const peerInfo = createPeerConnection({
      playerId,
      onIceCandidate: (playerId, candidate) => {
        sendSignalingMessage({
          type: 'ice-candidate',
          targetId: playerId,
          payload: {
            candidate: candidate.candidate,
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdpMid: candidate.sdpMid,
          },
        });
      },
      onConnectionStateChange: (playerId, state) => {
        // State monitoring handled in peer connection manager
      },
      onDataChannelOpen: (playerId) => {
        onPlayerConnected(playerId);
      },
      onDataChannelClose: (playerId) => {
        onPlayerDisconnected(playerId);
      },
      onDataChannelMessage: (playerId, data) => {
        onDataChannelMessage?.(playerId, data);
      },
    });

    peerConnectionsRef.current.set(playerId, peerInfo);

    try {
      await createOfferForPlayer(peerInfo, (playerId, sdp) => {
        sendSignalingMessage({
          type: 'offer',
          targetId: playerId,
          payload: {
            sdp,
            type: 'offer',
          },
        });
      });
    } catch (err) {
      mainLogger.error(`Failed to create offer for ${playerId}:`, {
        error: err,
        playerId,
      });
      peerConnectionsRef.current.delete(playerId);
      iceCandidateQueuesRef.current.delete(playerId);
    }
  };

  const handleAnswer = async (playerId: string, answer: any) => {
    webrtcLogger.debug(`Received answer from player: ${playerId}`);

    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (!peerInfo) {
      mainLogger.error(`No peer connection found for player: ${playerId}`, {
        playerId,
        answer,
      });
      return;
    }

    const queue = iceCandidateQueuesRef.current.get(playerId) || [];

    try {
      await handleAnswerForPeer(peerInfo, answer, queue);
      iceCandidateQueuesRef.current.set(playerId, []);
    } catch (err) {
      mainLogger.error(`Error handling answer for ${playerId}:`, {
        error: err,
        playerId,
        answer,
      });
    }
  };

  const handleIceCandidate = async (playerId: string, candidate: any) => {
    webrtcLogger.debug(`Received ICE candidate from player: ${playerId}`);

    const peerInfo = peerConnectionsRef.current.get(playerId);
    if (!peerInfo) {
      mainLogger.error(`No peer connection found for player: ${playerId}`, {
        playerId,
        candidate,
      });
      return;
    }

    if (!peerInfo.connection.remoteDescription) {
      webrtcLogger.debug(
        `Queueing ICE candidate for ${playerId} until remote description is set`,
      );
      const queue = iceCandidateQueuesRef.current.get(playerId) || [];
      queue.push(candidate);
      iceCandidateQueuesRef.current.set(playerId, queue);
      return;
    }

    try {
      await addIceCandidate(peerInfo, candidate);
    } catch (err) {
      mainLogger.error(`Error adding ICE candidate for ${playerId}:`, {
        error: err,
        playerId,
        candidate,
      });
    }
  };

  const handleSignalingMessage = (message: SignalingMessage) => {
    const senderId = message.senderId;
    if (!senderId) {
      mainLogger.error('Received message without senderId', {
        message,
      });
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
        webrtcLogger.debug('Unknown message type:', message.type);
    }
  };

  return {
    handleSignalingMessage,
    handlePlayerJoin,
    handleAnswer,
    handleIceCandidate,
  };
}
