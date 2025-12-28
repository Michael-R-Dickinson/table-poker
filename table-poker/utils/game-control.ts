import type { Table } from 'poker-ts';
import type { Action } from '@/types/game-state';
import type { PokerGameState } from '@/store/poker-game';

export interface GameControlActions {
  startHand: () => void;
  takeAction: (action: Action, betSize?: number) => void;
  endBettingRound: () => void;
  performShowdown: () => void;
  seatPlayer: (seatIndex: number, buyIn: number) => void;
}

export function createGameControl(
  pokerGame: PokerGameState,
  setPokerGame: (
    update: PokerGameState | ((prev: PokerGameState) => PokerGameState),
  ) => void,
): GameControlActions {
  const updateGameState = (updater: (table: InstanceType<typeof Table>) => void) => {
    setPokerGame((prev) => {
      if (!prev.table) {
        throw new Error('Poker table not initialized');
      }

      if (pokerGame.table && pokerGame.table.isHandInProgress()) {
        const cardsBefore = prev.table.communityCards();
        updater(prev.table);
        const cardsAfter = prev.table.communityCards();

        console.log('[game-control] Mutation complete:', {
          versionBefore: prev.version,
          versionAfter: prev.version + 1,
          cardsBeforeLength: cardsBefore.length,
          cardsAfterLength: cardsAfter.length,
          cardsAfter: cardsAfter,
        });
      }

      return {
        table: prev.table,
        version: prev.version + 1,
      };
    });
  };

  return {
    startHand: () => {
      updateGameState((table) => {
        table.startHand();
      });
    },

    takeAction: (action: Action, betSize?: number) => {
      updateGameState((table) => {
        table.actionTaken(action, betSize);
      });
    },

    endBettingRound: () => {
      updateGameState((table) => {
        table.endBettingRound();
      });
    },

    performShowdown: () => {
      updateGameState((table) => {
        table.showdown();
      });
    },

    seatPlayer: (seatIndex: number, buyIn: number) => {
      updateGameState((table) => {
        table.sitDown(seatIndex, buyIn);
      });
    },
  };
}
