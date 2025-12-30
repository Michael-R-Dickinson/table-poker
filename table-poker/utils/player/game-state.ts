import type { Table } from 'poker-ts';
import type { PlayerGameState, PlayerInfo, PlayerStatus } from '@/types/game-state';

export function extractPlayerGameState(
  table: InstanceType<typeof Table>,
  playerSeatIndex: number,
  seatToNameMap: Map<number, string>,
): PlayerGameState {
  const holeCards = table.holeCards();
  const seats = table.seats();
  const handPlayers = table.handPlayers();

  // Get player-specific hole cards
  const playerHoleCards = holeCards[playerSeatIndex] || null;

  // Get player to act and available actions
  let playerToAct: number | null = null;
  let availableActions = null;
  let chipRange = null;
  let amountToCall: number | null = null;

  const bettingRoundInProgress =
    table.isHandInProgress() && table.isBettingRoundInProgress();

  if (bettingRoundInProgress) {
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
        // Note: handPlayers() returns null for folded players, so if we reach
        // this point, the player is either active or all-in
        let status: PlayerStatus = 'active';
        if (player.stack === 0) {
          status = 'all-in';
        }

        return {
          seatIndex,
          name: seatToNameMap.get(seatIndex) || `Seat ${seatIndex}`,
          stack: player.stack,
          currentBet: player.betSize,
          status,
        } as PlayerInfo;
      },
    )
    .filter((p): p is PlayerInfo => p !== null);

  return {
    mySeatIndex: playerSeatIndex,
    holeCards: playerHoleCards,
    playerToAct,
    availableActions,
    chipRange,
    amountToCall,
    players,
  };
}
