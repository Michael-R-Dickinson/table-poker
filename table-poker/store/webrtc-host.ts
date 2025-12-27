import { atom } from 'jotai';

export interface WebRTCHostState {
  connectedPlayers: string[];
}

export const webrtcHostAtom = atom<WebRTCHostState>({
  connectedPlayers: [],
});
