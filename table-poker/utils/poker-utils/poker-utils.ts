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

export const calculatePotSize = (table: InstanceType<typeof Table> | null) => {
  if (!table || !table.isHandInProgress()) {
    return 0;
  }
  const pots = table.pots();
  return pots.reduce((total, pot) => total + pot.size, 0);
};

export const calculateCurrentBet = (table: InstanceType<typeof Table> | null) => {
  if (!table || !table.isHandInProgress() || !table.isBettingRoundInProgress()) {
    return 0;
  }
  const seats = table.seats();
  return Math.max(...seats.map((s) => s?.betSize || 0));
};
