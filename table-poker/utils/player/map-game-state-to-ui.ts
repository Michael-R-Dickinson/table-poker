import type { PlayerGameState, Card as GameCard } from '@/types/game-state';

/**
 * Player data formatted for the mobile poker UI
 */
export interface UIPlayer {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  status: 'active' | 'folded' | 'called' | 'raised' | 'allin';
  avatar: string;
}

/**
 * Card data formatted for the mobile poker UI
 */
export interface UICard {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

/**
 * Complete UI state for the mobile poker game component
 */
export interface MobilePokerUIState {
  opponents: UIPlayer[];
  playerCards: UICard[];
  playerChips: number;
  playerCurrentBet: number;
  isPlayerTurn: boolean;
}

/**
 * Converts a game state Card (with rank 'T') to UI Card (with rank '10')
 */
function mapCardToUI(card: GameCard): UICard {
  const rank = card.rank === 'T' ? '10' : card.rank;
  return {
    rank,
    suit: card.suit,
  };
}

/**
 * Maps game state player status to UI player status
 * Currently simplified as we don't track 'called' vs 'raised' in the game state
 */
function mapPlayerStatus(
  status: 'active' | 'folded' | 'all-in',
): 'active' | 'folded' | 'called' | 'raised' | 'allin' {
  if (status === 'all-in') return 'allin';
  return status;
}

/**
 * Generates avatar color based on seat index
 */
function getAvatarColor(seatIndex: number): string {
  const colors = [
    '#6366f1', // indigo
    '#f97316', // orange
    '#10b981', // emerald
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
  ];
  return colors[seatIndex % colors.length];
}

/**
 * Maps PlayerGameState to the props needed by MobilePokerGame component
 */
export function mapGameStateToUI(
  gameState: PlayerGameState | null,
): MobilePokerUIState | null {
  if (!gameState) {
    return null;
  }

  const myPlayer = gameState.players.find((p) => p.seatIndex === gameState.mySeatIndex);

  if (!myPlayer) {
    return null;
  }

  const opponents: UIPlayer[] = gameState.players
    .filter((p) => p.seatIndex !== gameState.mySeatIndex)
    .map((player) => ({
      id: `seat-${player.seatIndex}`,
      name: `Seat ${player.seatIndex}`,
      chips: player.stack,
      currentBet: player.currentBet,
      status: mapPlayerStatus(player.status),
      avatar: getAvatarColor(player.seatIndex),
    }));

  const playerCards: UICard[] = gameState.holeCards
    ? gameState.holeCards.map(mapCardToUI)
    : [];

  return {
    opponents,
    playerCards,
    playerChips: myPlayer.stack,
    playerCurrentBet: myPlayer.currentBet,
    isPlayerTurn: gameState.playerToAct === gameState.mySeatIndex,
  };
}
