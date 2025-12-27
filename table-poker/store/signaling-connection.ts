import { atom } from 'jotai';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SignalingConnectionState {
  connectionState: ConnectionState;
  error: string | null;
}

export const signalingConnectionAtom = atom<SignalingConnectionState>({
  connectionState: 'disconnected',
  error: null,
});
