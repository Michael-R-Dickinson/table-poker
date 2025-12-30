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
  };
}

export function OpponentDisplay({ player }: OpponentDisplayProps) {
  return (
    <View style={styles.container}>
      <View
        style={[styles.playerCard, player.status === 'folded' && styles.playerCardFolded]}
      >
        <View style={styles.playerInfo}>
          <Text
            style={[
              styles.playerName,
              player.status === 'folded' && styles.playerNameFolded,
            ]}
            numberOfLines={1}
          >
            {player.name}
          </Text>

          <View style={styles.chipsContainer}>
            <Ionicons name="ellipse" size={12} color="#6b7280" />
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 27, 38, 0.8)',
    borderWidth: 1,
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
  playerInfo: {
    flexDirection: 'column',
    gap: 6,
    width: 60,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  playerNameFolded: {
    color: '#6b7280',
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d1d5db',
  },
  betCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  betText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
