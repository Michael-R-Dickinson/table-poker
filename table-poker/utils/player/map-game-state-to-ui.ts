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
 * Calculates poker position label based on button position and number of players
 */
function getPositionLabel(
  seatIndex: number,
  buttonSeat: number,
  activePlayers: number[],
): string {
  const numPlayers = activePlayers.length;

  // Find relative position from button (0 = button, 1 = next after button, etc.)
  const sortedSeats = [...activePlayers].sort((a, b) => {
    const aOffset = (a - buttonSeat + activePlayers.length) % activePlayers.length;
    const bOffset = (b - buttonSeat + activePlayers.length) % activePlayers.length;
    return aOffset - bOffset;
  });

  const relativePosition = sortedSeats.indexOf(seatIndex);

  // Assign position labels based on number of players
  if (numPlayers === 2) {
    // Heads up: button is also small blind
    return relativePosition === 0 ? 'BTN/SB' : 'BB';
  }

  // Standard positions
  if (relativePosition === 0) return 'BTN';
  if (relativePosition === 1) return 'SB';
  if (relativePosition === 2) return 'BB';

  // Additional positions for more players
  if (numPlayers === 3) {
    return 'BTN'; // Already handled above, this shouldn't be reached
  } else if (numPlayers === 4) {
    return 'CO';
  } else if (numPlayers === 5) {
    return relativePosition === 3 ? 'UTG' : 'CO';
  } else if (numPlayers === 6) {
    if (relativePosition === 3) return 'UTG';
    if (relativePosition === 4) return 'HJ';
    return 'CO';
  } else if (numPlayers === 7) {
    if (relativePosition === 3) return 'UTG';
    if (relativePosition === 4) return 'UTG+1';
    if (relativePosition === 5) return 'HJ';
    return 'CO';
  } else if (numPlayers >= 8) {
    if (relativePosition === 3) return 'UTG';
    if (relativePosition === 4) return 'UTG+1';
    if (relativePosition === 5) return 'UTG+2';
    if (relativePosition === numPlayers - 2) return 'HJ';
    if (relativePosition === numPlayers - 1) return 'CO';
    return `UTG+${relativePosition - 3}`;
  }

  return '';
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
