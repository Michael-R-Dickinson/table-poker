import { atom } from 'jotai';
import type { PlayerGameState } from '@/types/game-state';

export interface WinningInfo {
  seatIndex: number;
  amount: number;
}

export interface PlayerGameStore {
  gameState: PlayerGameState | null;
  winningInfo: WinningInfo | null;
}

export const playerGameAtom = atom<PlayerGameStore>({
  gameState: null,
  winningInfo: null,
});
