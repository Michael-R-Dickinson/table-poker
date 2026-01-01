import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Action } from '@/types/game-state';
import { useState, useRef, useEffect } from 'react';

interface ActionButtonsProps {
  availableActions: Action[];
  onAction: (action: Action, amount?: number) => void;
  chipRange: { min: number; max: number } | null;
  amountToCall: number | null;
  onRaiseModeChange?: (isActive: boolean, amount: number) => void;
}

export function ActionButtons({
  availableActions,
  onAction,
  chipRange,
  amountToCall,
  onRaiseModeChange,
}: ActionButtonsProps) {
  const [isInRaiseMode, setIsInRaiseMode] = useState(false);
  const [pendingRaiseAmount, setPendingRaiseAmount] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onRaiseModeChange?.(isInRaiseMode, pendingRaiseAmount);
  }, [isInRaiseMode, pendingRaiseAmount, onRaiseModeChange]);

  useEffect(() => {
    Animated.spring(animatedHeight, {
      toValue: isInRaiseMode ? 1 : 0,
      useNativeDriver: false,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [isInRaiseMode]);

  if (availableActions.length === 0) {
    return null;
  }

  const enterRaiseMode = () => {
    if (!chipRange) return;
    setPendingRaiseAmount(chipRange.min);
    setIsInRaiseMode(true);
  };

  const exitRaiseMode = () => {
    setIsInRaiseMode(false);
    setPendingRaiseAmount(0);
  };

  const confirmRaise = () => {
    onAction('raise', pendingRaiseAmount);
    exitRaiseMode();
  };

  const adjustRaise = (delta: number) => {
    if (!chipRange) return;
    const newAmount = Math.max(
      chipRange.min,
      Math.min(chipRange.max, pendingRaiseAmount + delta),
    );
    setPendingRaiseAmount(newAmount);
  };

  const setAllIn = () => {
    if (!chipRange) return;
    setPendingRaiseAmount(chipRange.max);
  };

  const calculateIncrements = (): number[] => {
    if (!chipRange) return [];
    const bigBlind = Math.ceil(chipRange.min / 2);
    return [bigBlind, bigBlind * 2, bigBlind * 5, bigBlind * 10, bigBlind * 25];
  };

  if (isInRaiseMode) {
    const increments = calculateIncrements();
    const containerHeight = animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 120],
    });

    return (
      <Animated.View style={[styles.raiseContainer, { height: containerHeight }]}>
        <View style={styles.incrementButtons}>
          {increments.map((increment) => (
            <Pressable
              key={increment}
              onPress={() => adjustRaise(increment)}
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.incrementText}>+{increment}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={setAllIn}
            style={({ pressed }) => [
              styles.incrementButton,
              styles.allInButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.allInText}>All-In</Text>
          </Pressable>
        </View>
        <View style={styles.confirmButtons}>
          <Pressable
            onPress={exitRaiseMode}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="close" size={16} color="#f87171" />
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={confirmRaise}
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="checkmark" size={16} color="#4ade80" />
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
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
          onPress={enterRaiseMode}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="trending-up" size={16} color="#4ade80" />
          <Text style={styles.raiseText}>Raise</Text>
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
  raiseContainer: {
    overflow: 'hidden',
    gap: 12,
  },
  incrementButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  incrementButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  incrementText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
  },
  allInButton: {
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  allInText: {
    fontSize: 14,
    color: '#fb923c',
    fontWeight: '600',
  },
  confirmButtons: {
    flexDirection: 'row',
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
  cancelButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  confirmButton: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
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
  cancelText: {
    fontSize: 14,
    color: '#f87171',
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '500',
  },
});
