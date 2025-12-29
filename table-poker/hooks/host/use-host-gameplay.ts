import { useEffect, useRef, useCallback, useState } from 'react';
import type { Table } from 'poker-ts';
import type { PokerGameState } from '@/store/poker-game';
import type { GameControlActions } from '@/utils/host/game-control';
import { extractPlayerGameState } from '@/utils/player/game-state';
import { logger } from '@/utils/shared/logger';
import type { Action } from '@/types/game-state';

interface UseHostGameplayProps {
  pokerGame: PokerGameState;
  gameControl: GameControlActions;
  connectedPlayers: string[];
  sendToPlayer: (playerId: string, data: any) => void;
  broadcastToPlayers: (data: any) => void;
  buyIn: number;
}

interface PlayerAction {
  type: 'player-action';
  action: Action;
  betSize?: number;
}

interface WinnerInfo {
  seatIndex: number;
  amount: number;
}

export function useHostGameplay({
  pokerGame,
  gameControl,
  connectedPlayers,
  sendToPlayer,
  broadcastToPlayers,
  buyIn,
}: UseHostGameplayProps) {
  const [playerToSeatMap, setPlayerToSeatMap] = useState<Map<string, number>>(new Map());
  const [gameStarted, setGameStarted] = useState(false);
  const [lastPots, setLastPots] = useState<{ size: number; eligiblePlayers: number[] }[]>(
    [],
  );
  const [lastCommunityCards, setLastCommunityCards] = useState<any[]>([]);
  const [handEndWinners, setHandEndWinners] = useState<WinnerInfo[] | null>(null);
  const previousVersionRef = useRef<number>(0);

  // Broadcast game state to all players after any game state change
  useEffect(() => {
    if (!pokerGame.table) {
      return;
    }

    // Only broadcast if version changed
    if (pokerGame.version === previousVersionRef.current) {
      return;
    }

    previousVersionRef.current = pokerGame.version;

    if (pokerGame.table.isHandInProgress()) {
      // Hand in progress - store pots and broadcast game state
      const pots = pokerGame.table.pots();
      setLastPots(pots);

      // Store community cards while hand is in progress
      const communityCards = pokerGame.table.communityCards();
      setLastCommunityCards(communityCards);

      logger.info('Broadcasting game state to all players', {
        version: pokerGame.version,
        players: connectedPlayers.length,
      });

      // Send each player their specific game state
      playerToSeatMap.forEach((seatIndex, playerId) => {
        const gameState = extractPlayerGameState(pokerGame.table!, seatIndex);
        sendToPlayer(playerId, {
          type: 'game-state',
          state: gameState,
        });
      });

      // Check if betting round is complete and auto-progress
      const bettingRoundInProgress = pokerGame.table.isBettingRoundInProgress();

      if (!bettingRoundInProgress) {
        if (pokerGame.table.areBettingRoundsCompleted()) {
          // If we have all 5 community cards, it's time for showdown
          logger.info('River betting complete, performing showdown');

          setTimeout(() => {
            try {
              gameControl.performShowdown();
            } catch (error) {
              logger.error('Failed to perform showdown:', error);
            }
          }, 500);
        } else {
          // Betting round just ended, advance to next round (flop/turn/river)
          logger.info('Betting round complete, advancing to next round');

          setTimeout(() => {
            logger.info('setTimeout fired, calling endBettingRound');
            try {
              gameControl.endBettingRound();
              logger.info('endBettingRound completed successfully');
            } catch (error) {
              logger.error('Failed to end betting round:', error);
            }
          }, 500);
        }
      }
    } else {
      // Hand ended - calculate and broadcast winnings
      const winners = pokerGame.table.winners();

      logger.info('Hand ended', { pots: lastPots, winners });

      // Calculate winnings for each player
      const playerWinnings = new Map<number, number>();

      if (winners.length > 0) {
        // Showdown occurred - match winners with pots
        winners.forEach((potWinners, potIndex) => {
          const pot = lastPots[potIndex];
          const winnersCount = potWinners.length;
          const amountPerWinner = Math.floor(pot.size / winnersCount);

          potWinners.forEach(([seatIndex]) => {
            const currentWinnings = playerWinnings.get(seatIndex) || 0;
            playerWinnings.set(seatIndex, currentWinnings + amountPerWinner);
          });
        });
      } else if (lastPots.length === 1 && lastPots[0].eligiblePlayers.length === 1) {
        // Everyone folded - single winner
        const winningSeat = lastPots[0].eligiblePlayers[0];
        playerWinnings.set(winningSeat, lastPots[0].size);
      }

      // Convert to array format for broadcasting
      const winningsArray = Array.from(playerWinnings.entries()).map(
        ([seatIndex, amount]) => ({
          seatIndex,
          amount,
        }),
      );

      logger.info('Broadcasting end-hand message', { winnings: winningsArray });

      // Store winner info for host display
      setHandEndWinners(winningsArray);

      // Broadcast end-hand message to all players
      broadcastToPlayers({
        type: 'end-hand',
        winners: winningsArray,
      });
    }
  }, [
    pokerGame.version,
    pokerGame.table,
    gameStarted,
    playerToSeatMap,
    sendToPlayer,
    connectedPlayers,
    gameControl,
    broadcastToPlayers,
    lastPots,
  ]);

  const startGame = useCallback(() => {
    if (!pokerGame.table) {
      logger.error('Cannot start game: table not initialized');
      return;
    }

    if (connectedPlayers.length < 2) {
      logger.error('Cannot start game: need at least 2 players');
      return;
    }

    logger.info('Starting game with players:', connectedPlayers);

    // Create player-to-seat mapping
    const newPlayerToSeatMap = new Map<string, number>();
    connectedPlayers.forEach((playerId, index) => {
      newPlayerToSeatMap.set(playerId, index);
      gameControl.seatPlayer(index, buyIn);
      logger.info(`Seated player ${playerId} at seat ${index}`);
    });

    setPlayerToSeatMap(newPlayerToSeatMap);

    // Start the first hand
    logger.debug('Calling startHand - should immediately apply to table');
    gameControl.startHand();
    setGameStarted(true);

    logger.info('Game started, first hand dealt');
  }, [pokerGame.table, connectedPlayers, gameControl, buyIn]);

  const handlePlayerAction = useCallback(
    (playerId: string, data: PlayerAction) => {
      if (!pokerGame.table || !gameStarted) {
        logger.warn('Received player action but game not started');
        return;
      }

      const seatIndex = playerToSeatMap.get(playerId);
      if (seatIndex === undefined) {
        logger.error('Received action from unknown player:', playerId);
        return;
      }

      // Verify it's this player's turn
      if (
        !pokerGame.table.isHandInProgress() ||
        !pokerGame.table.isBettingRoundInProgress()
      ) {
        logger.warn('Received action but no betting round in progress');
        return;
      }

      const playerToAct = pokerGame.table.playerToAct();
      if (playerToAct !== seatIndex) {
        logger.warn(
          `Received action from player ${playerId} (seat ${seatIndex}) but it's seat ${playerToAct}'s turn`,
        );
        return;
      }

      logger.info(
        `Player ${playerId} (seat ${seatIndex}) taking action:`,
        data.action,
        data.betSize,
      );

      try {
        gameControl.takeAction(data.action, data.betSize);
      } catch (error) {
        logger.error('Failed to process player action:', error);
      }
    },
    [pokerGame.table, gameStarted, playerToSeatMap, gameControl],
  );

  const startNextHand = useCallback(() => {
    logger.info('Starting next hand');
    setHandEndWinners(null);
    gameControl.startHand();
  }, [gameControl]);

  return {
    startGame,
    handlePlayerAction,
    gameStarted,
    playerToSeatMap,
    lastCommunityCards,
    handEndWinners,
    startNextHand,
  };
}
