import { useCallback } from 'react';
import { useAtom } from 'jotai';
import type { PlayerGameState, Action } from '@/types/game-state';
import { logger } from '@/utils/logger';
import { playerGameAtom } from '@/store/player-game';

interface UsePlayerGameplayProps {
  sendToHost: (data: any) => void;
}

export function usePlayerGameplay({ sendToHost }: UsePlayerGameplayProps) {
  const [{ gameState }, setPlayerGame] = useAtom(playerGameAtom);

  const handleGameStateMessage = useCallback(
    (data: any) => {
      if (data.type === 'game-state') {
        // logger.info('Received game state update:', data.state);
        setPlayerGame({ gameState: data.state });
      }
    },
    [setPlayerGame],
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
    gameState,
    handleGameStateMessage,
    takeAction,
  };
}
