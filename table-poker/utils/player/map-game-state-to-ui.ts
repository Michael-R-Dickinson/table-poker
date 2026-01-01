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
  position?: string;
  isCurrentPlayer?: boolean;
  isPlayerToAct?: boolean;
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
 * Position maps for different table sizes
 * Each array maps relative position index to position label
 * Index 0 = button, 1 = small blind, 2 = big blind, etc.
 */
const POSITION_MAPS: Record<number, string[]> = {
  2: ['BTN/SB', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'SB', 'BB', 'CO'],
  5: ['BTN', 'SB', 'BB', 'UTG', 'CO'],
  6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'],
  7: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'HJ', 'CO'],
  8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'HJ', 'CO'],
  9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'HJ', 'CO'],
  10: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP1', 'MP2', 'HJ', 'CO'],
};

/**
 * Calculates relative position from button (0 = button, 1 = next seat clockwise, etc.)
 */
function getRelativePosition(
  seatIndex: number,
  buttonSeat: number,
  activePlayers: number[],
): number {
  // Create a mapping of seat index to relative position
  const seatToRelativePos = new Map<number, number>();

  activePlayers.forEach((seat) => {
    const offset = (seat - buttonSeat + activePlayers.length) % activePlayers.length;
    seatToRelativePos.set(seat, offset);
  });

  return seatToRelativePos.get(seatIndex) ?? 0;
}

/**
 * Calculates poker position label based on button position and number of players
 * Uses a table-driven approach for clarity and maintainability
 */
function getPositionLabel(
  seatIndex: number,
  buttonSeat: number,
  activePlayers: number[],
): string {
  const numPlayers = activePlayers.length;

  // Get the position map for this table size
  const positionMap = POSITION_MAPS[numPlayers];
  if (!positionMap) {
    return ''; // Unsupported table size
  }

  // Calculate relative position from button
  const relativePosition = getRelativePosition(seatIndex, buttonSeat, activePlayers);

  // Look up the position label
  return positionMap[relativePosition] || '';
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

  // Get all active player seat indices for position calculation
  const activePlayerSeats = gameState.players.map((p) => p.seatIndex);

  // Map all players (including current player) with position info
  const opponents: UIPlayer[] = gameState.players.map((player) => {
    const isCurrentPlayer = player.seatIndex === gameState.mySeatIndex;
    const isPlayerToAct = player.seatIndex === gameState.playerToAct;

    // Calculate position if button is available
    const position =
      gameState.buttonSeat !== null
        ? getPositionLabel(player.seatIndex, gameState.buttonSeat, activePlayerSeats)
        : undefined;

    return {
      id: `seat-${player.seatIndex}`,
      name: player.name,
      chips: player.stack,
      currentBet: player.currentBet,
      status: mapPlayerStatus(player.status),
      avatar: getAvatarColor(player.seatIndex),
      position,
      isCurrentPlayer,
      isPlayerToAct,
    };
  });

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
