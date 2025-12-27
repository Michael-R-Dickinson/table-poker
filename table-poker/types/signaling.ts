export type SignalingMessageType =
  | 'join'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'player-connected'
  | 'error';

export interface SignalingMessage {
  type: SignalingMessageType;
  senderId?: string;
  targetId?: string;
  payload: unknown;
}

export interface OfferPayload {
  sdp: string;
  type: 'offer';
}

export interface AnswerPayload {
  sdp: string;
  type: 'answer';
}

export interface IceCandidatePayload {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}
