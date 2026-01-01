import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OpponentDisplayProps {
  player: {
    id: string;
    name: string;
    chips: number;
    currentBet: number;
    status: 'active' | 'folded' | 'called' | 'raised' | 'allin';
    avatar: string;
    position?: string;
    isCurrentPlayer?: boolean;
    isPlayerToAct?: boolean;
  };
}

export function OpponentDisplay({ player }: OpponentDisplayProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.playerCard,
          player.status === 'folded' && styles.playerCardFolded,
          player.isPlayerToAct && styles.playerCardToAct,
        ]}
      >
        <View style={styles.playerInfo}>
          {player.position && (
            <Text style={styles.positionText} numberOfLines={1}>
              {player.position}
            </Text>
          )}
          <Text
            style={[
              styles.playerName,
              player.status === 'folded' && styles.playerNameFolded,
              player.isCurrentPlayer && styles.playerNameCurrent,
            ]}
            numberOfLines={1}
          >
            {player.name}
          </Text>

          <View style={styles.chipsContainer}>
            <Ionicons name="ellipse" size={14} color="#6b7280" />
            <Text style={styles.chipsText}>{player.chips}</Text>
          </View>
        </View>
      </View>

      {player.currentBet > 0 && player.status !== 'folded' && (
        <View style={styles.betCircle}>
          <Text style={styles.betText}>{player.currentBet}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  playerCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(26, 27, 38, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(156, 163, 175, 0.4)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  playerCardFolded: {
    opacity: 0.5,
  },
  playerCardToAct: {
    borderColor: '#b794f6',
    borderWidth: 2,
  },
  playerInfo: {
    flexDirection: 'column',
    gap: 4,
    width: 80,
  },
  positionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  playerNameFolded: {
    color: '#6b7280',
  },
  playerNameCurrent: {
    color: '#60a5fa',
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#d1d5db',
  },
  betCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  betText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
