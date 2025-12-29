import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import type { SignalingMessage } from '@/types/signaling';
import { webrtcLogger, logger as mainLogger } from '@/utils/shared/logger';
import {
  createDataChannelHeartbeat,
  HeartbeatCleanup,
} from '@/utils/data-channel-heartbeat';

export interface PeerConnectionInfo {
  connection: RTCPeerConnection;
  dataChannel: any;
  playerId: string;
  connectionState: 'connecting' | 'connected' | 'disconnected';
  heartbeatCleanup?: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface CreatePeerConnectionOptions {
  playerId: string;
  onIceCandidate: (playerId: string, candidate: any) => void;
  onConnectionStateChange: (playerId: string, state: string) => void;
  onDataChannelOpen: (playerId: string) => void;
  onDataChannelClose: (playerId: string) => void;
  onDataChannelMessage: (playerId: string, data: any) => void;
}

export function createPeerConnection({
  playerId,
  onIceCandidate,
  onConnectionStateChange,
  onDataChannelOpen,
  onDataChannelClose,
  onDataChannelMessage,
}: CreatePeerConnectionOptions): PeerConnectionInfo {
  webrtcLogger.debug(`Creating peer connection for player: ${playerId}`);

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
    webrtcLogger.debug(`Data channel opened for player: ${playerId}`);
    peerInfo.connectionState = 'connected';

    // Start heartbeat
    const { cleanup } = createDataChannelHeartbeat({
      dataChannel,
      onDisconnect: () => {
        webrtcLogger.warn(`Heartbeat timeout for player: ${playerId}`);
        onDataChannelClose(playerId);
      },
      logPrefix: `Host->Player-${playerId}`,
    });
    peerInfo.heartbeatCleanup = cleanup;

    onDataChannelOpen(playerId);
  });

  (dataChannel as any).addEventListener('close', () => {
    webrtcLogger.debug(`Data channel closed for player: ${playerId}`);
    peerInfo.connectionState = 'disconnected';

    // Clean up heartbeat
    if (peerInfo.heartbeatCleanup) {
      peerInfo.heartbeatCleanup();
      peerInfo.heartbeatCleanup = undefined;
    }

    onDataChannelClose(playerId);
  });

  (dataChannel as any).addEventListener('message', (event: any) => {
    try {
      const data = JSON.parse(event.data);

      // Filter out ping/pong messages - these are handled by the heartbeat utility
      if (data.type === 'ping' || data.type === 'pong') {
        return;
      }

      onDataChannelMessage(playerId, data);
    } catch (err) {
      mainLogger.error(`Failed to parse data channel message from ${playerId}:`, {
        error: err,
        playerId,
        rawData: event.data,
      });
    }
  });

  (peerConnection as any).addEventListener('icecandidate', (event: any) => {
    if (event.candidate) {
      webrtcLogger.debug(`Sending ICE candidate to player: ${playerId}`);
      onIceCandidate(playerId, event.candidate);
    }
  });

  (peerConnection as any).addEventListener('connectionstatechange', () => {
    webrtcLogger.debug(
      `Connection state changed for ${playerId}:`,
      peerConnection.connectionState,
      `Data channel state: ${dataChannel.readyState}`,
    );

    if (peerConnection.connectionState === 'connected') {
      peerInfo.connectionState = 'connected';
    }

    // Ignore 'failed' state for temporary blips - heartbeat will handle timeouts
    // Only data channel 'close' event triggers immediate disconnect

    onConnectionStateChange(playerId, peerConnection.connectionState);
  });

  return peerInfo;
}

export async function createOfferForPlayer(
  peerInfo: PeerConnectionInfo,
  sendOffer: (playerId: string, sdp: string) => void,
): Promise<void> {
  try {
    const offer = await peerInfo.connection.createOffer();
    await peerInfo.connection.setLocalDescription(offer);

    webrtcLogger.debug(`Sending offer to player: ${peerInfo.playerId}`);
    sendOffer(peerInfo.playerId, offer.sdp!);
  } catch (err) {
    mainLogger.error(`Failed to create offer for ${peerInfo.playerId}:`, {
      error: err,
      playerId: peerInfo.playerId,
    });
    throw err;
  }
}

export async function handleAnswer(
  peerInfo: PeerConnectionInfo,
  answer: any,
  iceCandidateQueue: any[],
): Promise<void> {
  webrtcLogger.debug(`Setting remote description for player: ${peerInfo.playerId}`);

  try {
    await peerInfo.connection.setRemoteDescription(new RTCSessionDescription(answer));
    webrtcLogger.debug(`Remote description set for player: ${peerInfo.playerId}`);

    if (iceCandidateQueue.length > 0) {
      webrtcLogger.debug(
        `Adding ${iceCandidateQueue.length} queued ICE candidates for ${peerInfo.playerId}`,
      );
      for (const candidate of iceCandidateQueue) {
        try {
          await peerInfo.connection.addIceCandidate(
            new RTCIceCandidate({
              candidate: candidate.candidate,
              sdpMLineIndex: candidate.sdpMLineIndex,
              sdpMid: candidate.sdpMid,
            }),
          );
        } catch (err) {
          mainLogger.error(
            `Failed to add queued ICE candidate for ${peerInfo.playerId}:`,
            {
              error: err,
              playerId: peerInfo.playerId,
              candidate,
            },
          );
        }
      }
      webrtcLogger.debug(`Queued ICE candidates processed for ${peerInfo.playerId}`);
    }
  } catch (err) {
    mainLogger.error(`Failed to set remote description for ${peerInfo.playerId}:`, {
      error: err,
      playerId: peerInfo.playerId,
      answer,
    });
    throw err;
  }
}

export async function addIceCandidate(
  peerInfo: PeerConnectionInfo,
  candidate: any,
): Promise<void> {
  try {
    await peerInfo.connection.addIceCandidate(
      new RTCIceCandidate({
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
      }),
    );
    webrtcLogger.debug(`ICE candidate added for player: ${peerInfo.playerId}`);
  } catch (err) {
    mainLogger.error(`Failed to add ICE candidate for ${peerInfo.playerId}:`, {
      error: err,
      playerId: peerInfo.playerId,
      candidate,
    });
    throw err;
  }
}
