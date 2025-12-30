import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Action } from '@/types/game-state';
import { Card } from './card';
import { OpponentDisplay } from './opponent-display';
import { ActionButtons } from './action-buttons';
import { PokerTable } from './poker-table';
import { PotDisplay } from './pot-display';

interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  status: 'active' | 'folded' | 'called' | 'raised' | 'allin';
  avatar: string;
}

interface MobilePokerGameProps {
  opponents: Player[];
  pot: number;
  playerCards: {
    rank: string;
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  }[];
  playerChips: number;
  playerCurrentBet: number;
  isPlayerTurn: boolean;
  availableActions: Action[];
  onAction: (action: Action, amount?: number) => void;
  chipRange: { min: number; max: number } | null;
  amountToCall: number | null;
}

export function MobilePokerGame({
  opponents,
  pot: bet,
  playerCards,
  playerChips,
  playerCurrentBet,
  isPlayerTurn,
  availableActions,
  onAction,
  chipRange,
  amountToCall,
}: MobilePokerGameProps) {
  return (
    <View style={styles.container}>
      {/* Background gradient creates depth from top to bottom */}
      <LinearGradient
        colors={['#0e0f16', '#050508']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Opponents section at top with fade-out gradient */}
      <View style={styles.opponentsSection}>
        <LinearGradient
          colors={['#0e0f16', 'transparent']}
          style={styles.opponentsGradient}
        >
          <View style={styles.opponentsContainer}>
            {opponents.map((opponent) => (
              <OpponentDisplay key={opponent.id} player={opponent} />
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Current pot/bet display */}
      <PotDisplay amount={bet} />

      {/* Poker table surface with shadow and glow effects */}
      <PokerTable />

      {/* Player section at bottom with action buttons and cards */}
      <View style={styles.playerSection}>
        <LinearGradient
          colors={['transparent', 'rgba(5, 5, 8, 0.9)', '#050508']}
          style={styles.playerGradient}
        >
          {/* Action buttons for player decisions */}
          <View style={styles.actionButtonsContainer}>
            <ActionButtons
              availableActions={isPlayerTurn ? availableActions : []}
              onAction={onAction}
              chipRange={chipRange}
              amountToCall={amountToCall}
            />
          </View>

          {/* Display current bet if player has bet this round */}
          {playerCurrentBet > 0 && (
            <View style={styles.currentBetContainer}>
              <View style={styles.currentBetCircle}>
                <Ionicons name="ellipse" size={16} color="#ffffff" />
                <Text style={styles.currentBetText}>{playerCurrentBet}</Text>
              </View>
            </View>
          )}

          {/* Player's hole cards with fan effect */}
          <View style={styles.playerCardsContainer}>
            {playerCards.map((card, index) => {
              const totalCards = playerCards.length;
              const middleIndex = (totalCards - 1) / 2;
              const offsetFromMiddle = index - middleIndex;
              const rotation = `${offsetFromMiddle * 10}deg`;
              const translateX = offsetFromMiddle * 30;

              return (
                <View
                  key={index}
                  style={[
                    styles.cardWrapper,
                    {
                      transform: [{ translateX }, { rotate: rotation }],
                      zIndex: index,
                    },
                  ]}
                >
                  <Card rank={card.rank} suit={card.suit} size="medium" />
                </View>
              );
            })}
          </View>

          {/* Player's chip count */}
          <View style={styles.playerBankContainer}>
            <View style={styles.playerBank}>
              <Text style={styles.playerBankLabel}>Your Bank</Text>
              <Text style={styles.playerBankAmount}>{playerChips}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    overflow: 'hidden',
  },
  opponentsSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  opponentsGradient: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  opponentsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: 8,
  },
  playerSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  playerGradient: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  currentBetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currentBetCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  currentBetText: {
    fontWeight: '600',
    color: '#ffffff',
  },
  playerCardsContainer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    height: 128,
  },
  cardWrapper: {
    position: 'absolute',
    transformOrigin: 'center bottom',
  },
  playerBankContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  playerBank: {
    alignItems: 'center',
  },
  playerBankLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  playerBankAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
