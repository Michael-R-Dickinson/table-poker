import { useState, useCallback } from 'react';
import type { PlayerGameState, Action } from '@/types/game-state';
import { logger } from '@/utils/logger';

interface UsePlayerGameplayProps {
  sendToHost: (data: any) => void;
}

export function usePlayerGameplay({ sendToHost }: UsePlayerGameplayProps) {
  const [gameState, setGameState] = useState<PlayerGameState | null>(null);

  const handleGameStateMessage = useCallback((data: any) => {
    if (data.type === 'game-state') {
      logger.info('Received game state update:', data.state);
      setGameState(data.state);
    }
  }, []);

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
