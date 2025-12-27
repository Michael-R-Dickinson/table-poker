import { atom } from 'jotai';

export type PlayerConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface WebRTCPlayerState {
  connectionState: PlayerConnectionState;
}

export const webrtcPlayerAtom = atom<WebRTCPlayerState>({
  connectionState: 'disconnected',
});
