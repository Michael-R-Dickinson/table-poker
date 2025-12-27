import { atom } from 'jotai';
import type { PlayerGameState } from '@/types/game-state';

export interface PlayerGameStore {
  gameState: PlayerGameState | null;
}

export const playerGameAtom = atom<PlayerGameStore>({
  gameState: null,
});
