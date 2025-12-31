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

  const valueMap: { [key: string]: string } = {
    '10': '10',
  };

  const suit = suitMap[card.suit];
  const value = (valueMap[card.rank] || card.rank) as any;

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
