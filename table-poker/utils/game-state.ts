import type { Table } from 'poker-ts';
import type { PlayerGameState, PlayerInfo, PlayerStatus } from '@/types/game-state';

export function extractPlayerGameState(
  table: InstanceType<typeof Table>,
  playerSeatIndex: number,
): PlayerGameState {
  const holeCards = table.holeCards();
  const seats = table.seats();
  const handPlayers = table.handPlayers();
  const pots = table.pots();

  // Get player-specific hole cards
  const playerHoleCards = holeCards[playerSeatIndex] || null;

  // Get player to act and available actions
  let playerToAct: number | null = null;
  let availableActions = null;
  let chipRange = null;
  let amountToCall: number | null = null;

  if (table.isBettingRoundInProgress()) {
    playerToAct = table.playerToAct();

    if (playerToAct === playerSeatIndex) {
      const legalActions = table.legalActions();
      availableActions = legalActions.actions;
      chipRange = legalActions.chipRange || null;

      // Calculate amount to call
      const playerSeat = seats[playerSeatIndex];
      if (playerSeat) {
        const maxBet = Math.max(
          ...seats.map((s: { betSize: number } | null) => s?.betSize || 0),
        );
        amountToCall = maxBet - playerSeat.betSize;
      }
    }
  }

  // Build player info array
  // Note: This array is ordered by seat position clockwise around the table,
  // not necessarily starting with the small blind
  const players: PlayerInfo[] = handPlayers
    .map(
      (
        player: { totalChips: number; stack: number; betSize: number } | null,
        seatIndex: number,
      ) => {
        if (!player) return null;

        // Determine player status
        let status: PlayerStatus = 'active';

        // Check if player is all-in (stack is 0)
        if (player.stack === 0) {
          status = 'all-in';
        } else {
          // Check if player is folded by looking at eligible players in pots
          const isEligible = pots.some(
            (pot: { size: number; eligiblePlayers: number[] }) =>
              pot.eligiblePlayers.includes(seatIndex),
          );
          if (!isEligible && table.isHandInProgress()) {
            status = 'folded';
          }
        }

        return {
          seatIndex,
          stack: player.stack,
          currentBet: player.betSize,
          status,
        };
      },
    )
    .filter((p): p is PlayerInfo => p !== null);

  return {
    holeCards: playerHoleCards,
    playerToAct,
    availableActions,
    chipRange,
    amountToCall,
    players,
  };
}
