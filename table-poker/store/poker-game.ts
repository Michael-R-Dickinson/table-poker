import { atom } from 'jotai';
import { Table } from 'poker-ts';

export interface PokerGameState {
  table: InstanceType<typeof Table> | null;
  version: number;
}

export const pokerGameAtom = atom<PokerGameState>({
  table: null,
  version: 0,
});
