import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './card';
import { OpponentDisplay } from './opponent-display';
import { ActionButtons } from './action-buttons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  onFold: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
}

export function MobilePokerGame({
  opponents,
  pot: bet,
  playerCards,
  playerChips,
  playerCurrentBet,
  isPlayerTurn,
  onFold,
  onCall,
  onRaise,
}: MobilePokerGameProps) {
  const railSize = 22;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0e0f16', '#050508']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />

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

      <View style={styles.potContainer}>
        <View style={styles.potLabel}>
          <Ionicons name="wallet-outline" size={20} color="#9ca3af" />
          <Text style={styles.potLabelText}>BET</Text>
        </View>
        <Text style={styles.potAmount}>{bet}</Text>
      </View>

      <View
        style={[
          styles.tableEdge,
          {
            top: screenHeight * 0.5,
            width: screenWidth * 2.8,
            height: screenHeight * 0.7,
            shadowColor: 'rgba(138, 130, 255, 0.3)',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 1,
            shadowRadius: 1,
            elevation: 5,
          },
        ]}
      >
        <View
          style={[
            styles.tableInnerRail,
            {
              borderTopWidth: railSize,
              borderTopColor: '#0f1016',
            },
          ]}
        />
        <View style={[styles.tableInnerHighlight, { top: railSize }]} />
      </View>

      <View style={styles.purpleGlow} />

      <View style={styles.playerSection}>
        <LinearGradient
          colors={['transparent', 'rgba(5, 5, 8, 0.9)', '#050508']}
          style={styles.playerGradient}
        >
          <View style={styles.actionButtonsContainer}>
            <ActionButtons
              onFold={onFold}
              onCall={onCall}
              onRaise={onRaise}
              isPlayerTurn={isPlayerTurn}
            />
          </View>

          {playerCurrentBet > 0 && (
            <View style={styles.currentBetContainer}>
              <View style={styles.currentBetCircle}>
                <Ionicons name="ellipse" size={16} color="#ffffff" />
                <Text style={styles.currentBetText}>{playerCurrentBet}</Text>
              </View>
            </View>
          )}

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
  potContainer: {
    position: 'absolute',
    top: 160,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  potLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  potLabelText: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  potAmount: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -2,
  },
  tableEdge: {
    position: 'absolute',
    left: '50%',
    marginLeft: -(screenWidth * 2.8) / 2,
    borderTopLeftRadius: screenWidth * 1.4,
    borderTopRightRadius: screenWidth * 1.4,
    backgroundColor: '#161722',
    overflow: 'hidden',
  },
  tableInnerRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tableInnerHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  purpleGlow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -300,
    width: 600,
    height: screenHeight * 1.5,
    opacity: 0.3,
    backgroundColor: 'transparent',
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
