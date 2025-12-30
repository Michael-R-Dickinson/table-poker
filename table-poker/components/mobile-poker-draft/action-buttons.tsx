import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Action } from '@/types/game-state';

interface ActionButtonsProps {
  availableActions: Action[];
  onAction: (action: Action, amount?: number) => void;
  chipRange: { min: number; max: number } | null;
  amountToCall: number | null;
}

export function ActionButtons({
  availableActions,
  onAction,
  chipRange,
  amountToCall,
}: ActionButtonsProps) {
  if (availableActions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {availableActions.includes('fold') && (
        <Pressable
          onPress={() => onAction('fold')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="close" size={16} color="#f87171" />
          <Text style={styles.foldText}>Fold</Text>
        </Pressable>
      )}

      {availableActions.includes('check') && (
        <Pressable
          onPress={() => onAction('check')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="checkmark-done" size={16} color="#60a5fa" />
          <Text style={styles.checkText}>Check</Text>
        </Pressable>
      )}

      {availableActions.includes('call') && amountToCall !== null && (
        <Pressable
          onPress={() => onAction('call')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="checkmark-done" size={16} color="#60a5fa" />
          <Text style={styles.callText}>Call {amountToCall}</Text>
        </Pressable>
      )}

      {availableActions.includes('bet') && chipRange && (
        <Pressable
          onPress={() => onAction('bet', chipRange.min)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="trending-up" size={16} color="#4ade80" />
          <Text style={styles.betText}>Bet {chipRange.min}</Text>
        </Pressable>
      )}

      {availableActions.includes('raise') && chipRange && (
        <Pressable
          onPress={() => onAction('raise', chipRange.min)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="trending-up" size={16} color="#4ade80" />
          <Text style={styles.raiseText}>Raise {chipRange.min}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  foldText: {
    fontSize: 14,
    color: '#f87171',
    fontWeight: '500',
  },
  raiseText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '500',
  },
  checkText: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: '500',
  },
  callText: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: '500',
  },
  betText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '500',
  },
});
