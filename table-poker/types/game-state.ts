export type Card = {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 'clubs' | 'diamonds' | 'hearts' | 'spades';
};

export type Action = 'fold' | 'check' | 'call' | 'bet' | 'raise';

export type ChipRange = {
  min: number;
  max: number;
};

export type PlayerStatus = 'active' | 'folded' | 'all-in';

export interface PlayerInfo {
  seatIndex: number;
  name: string;
  stack: number;
  currentBet: number;
  status: PlayerStatus;
}

export interface PlayerGameState {
  mySeatIndex: number;
  holeCards: Card[] | null;
  playerToAct: number | null;
  availableActions: Action[] | null;
  chipRange: ChipRange | null;
  amountToCall: number | null;
  buttonSeat: number | null;
  // Players ordered clockwise around the table (not necessarily starting with SB)
  players: PlayerInfo[];
}
