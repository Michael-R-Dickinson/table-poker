import { useCallback } from 'react';
import { useAtom } from 'jotai';
import type { PlayerGameState, Action } from '@/types/game-state';
import { logger } from '@/utils/shared/logger';
import { playerGameAtom } from '@/store/player-game';

interface UsePlayerGameplayProps {
  sendToHost: (data: any) => void;
}

export function usePlayerGameplay({ sendToHost }: UsePlayerGameplayProps) {
  const [playerGame, setPlayerGame] = useAtom(playerGameAtom);

  const handleGameStateMessage = useCallback(
    (data: any) => {
      logger.info('Received message from host:', data);

      if (data.type === 'game-state') {
        setPlayerGame((prev) => ({
          ...prev,
          gameState: data.state,
          winningInfo: null,
        }));
      } else if (data.type === 'end-hand') {
        const myWinning = data.winners.find(
          (w: { seatIndex: number; amount: number }) =>
            w.seatIndex === playerGame.gameState?.mySeatIndex,
        );

        if (myWinning) {
          logger.info('I won!', myWinning);
          setPlayerGame((prev) => ({
            ...prev,
            winningInfo: myWinning,
          }));
        } else {
          logger.info('I did not win this hand');
        }
      }
    },
    [setPlayerGame, playerGame.gameState?.mySeatIndex],
  );

  const takeAction = useCallback(
    (action: Action, betSize?: number) => {
      logger.info('Sending action to host:', action, betSize);
      sendToHost({
        type: 'player-action',
        action,
        betSize,
      });
    },
    [sendToHost],
  );

  return {
    gameState: playerGame.gameState,
    winningInfo: playerGame.winningInfo,
    handleGameStateMessage,
    takeAction,
  };
}
