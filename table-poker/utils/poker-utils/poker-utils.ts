import { Table } from 'poker-ts';

// Map poker-ts card to HostCard format
export const mapCard = (card: any) => {
  if (!card) return null;

  const suitMap: { [key: string]: 'club' | 'diamond' | 'heart' | 'spade' } = {
    clubs: 'club',
    diamonds: 'diamond',
    hearts: 'heart',
    spades: 'spade',
  };

  const suit = suitMap[card.suit];
  // Convert 'T' to '10', otherwise use the rank as-is
  const value = (card.rank === 'T' ? '10' : card.rank) as any;

  return { suit, value };
};

/**
 * Gets the total pot size including all collected pots and current bets
 * from the active betting round.
 *
 * @param table - The poker table instance
 * @returns The total amount of chips in all pots plus current bets
 */
export function calculatePotSize(table: InstanceType<typeof Table> | null): number {
  if (!table || !table.isHandInProgress()) {
    return 0;
  }

  // Sum all collected pots from previous betting rounds
  const pots = table.pots();
  const collectedPotTotal = pots.reduce((sum, pot) => sum + pot.size, 0);

  // Sum current bets from the active betting round
  const seats = table.seats();
  const currentBets = seats.reduce((sum, seat) => {
    return sum + (seat?.betSize ?? 0);
  }, 0);

  // Return total of collected pots and current bets
  return collectedPotTotal + currentBets;
}

export const calculateCurrentBet = (table: InstanceType<typeof Table> | null) => {
  if (!table || !table.isHandInProgress() || !table.isBettingRoundInProgress()) {
    return 0;
  }
  const seats = table.seats();
  return Math.max(...seats.map((s) => s?.betSize || 0));
};

export interface PlayerActionInfo {
  playerName: string;
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise';
  betSize?: number;
}

/**
 * Formats a player action into a readable string for display.
 * Examples:
 * - "Daanish calls"
 * - "Michael checks"
 * - "John + 15"
 *
 * @param actionInfo - The player action information
 * @returns A formatted string describing the action
 */
export function formatPlayerAction(actionInfo: PlayerActionInfo): string {
  const { playerName, action, betSize } = actionInfo;

  switch (action) {
    case 'fold':
      return `${playerName} folds`;
    case 'check':
      return `${playerName} checks`;
    case 'call':
      return `${playerName} calls`;
    case 'bet':
    case 'raise':
      return `${playerName} + ${betSize}`;
    default:
      return `${playerName} ${action}`;
  }
}
