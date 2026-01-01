import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface PotDisplayProps {
  currentBet: number;
  playerCurrentBet: number;
  isInRaiseMode?: boolean;
  pendingRaiseAmount?: number;
}

export function PotDisplay({
  currentBet,
  playerCurrentBet,
  isInRaiseMode = false,
  pendingRaiseAmount = 0,
}: PotDisplayProps) {
  const displayAmount = isInRaiseMode ? currentBet + pendingRaiseAmount : currentBet;
  const labelText = isInRaiseMode ? 'RAISE TO' : 'BET';
  const iconName = isInRaiseMode ? 'trending-up' : 'wallet-outline';

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Ionicons
          name={iconName}
          size={20}
          color={isInRaiseMode ? '#4ade80' : '#9ca3af'}
        />
        <Text style={[styles.labelText, isInRaiseMode && styles.raiseLabelText]}>
          {labelText}
        </Text>
      </View>
      <Text style={[styles.amount, isInRaiseMode && styles.raiseAmount]}>
        {displayAmount}
      </Text>

      {!isInRaiseMode && playerCurrentBet > 0 && (
        <View style={styles.playerBetContainer}>
          <Ionicons name="ellipse" size={14} color="#9ca3af" />
          <Text style={styles.playerBetAmount}>{playerCurrentBet}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 160,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  raiseLabelText: {
    color: '#4ade80',
  },
  amount: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -2,
  },
  raiseAmount: {
    color: '#4ade80',
  },
  playerBetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: '15%',
  },
  playerBetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
