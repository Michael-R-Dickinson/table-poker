import type { Action } from '@/types/game-state';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface ActionButtonsProps {
  availableActions: Action[];
  onAction: (action: Action, amount?: number) => void;
  chipRange: { min: number; max: number } | null;
  amountToCall: number | null;
  onBettingModeChange?: (inBettingMode: boolean) => void;
}

export function ActionButtons({
  availableActions,
  onAction,
  chipRange,
  amountToCall,
  onBettingModeChange,
}: ActionButtonsProps) {
  const [bettingMode, setBettingMode] = useState<'bet' | 'raise' | null>(null);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (bettingMode && chipRange) {
      Animated.spring(heightAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.spring(heightAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [bettingMode, heightAnim, chipRange]);

  useEffect(() => {
    if (bettingMode && !availableActions.includes(bettingMode)) {
      setBettingMode(null);
      setCurrentAmount(0);
    }
  }, [availableActions, bettingMode]);

  useEffect(() => {
    onBettingModeChange?.(bettingMode !== null);
  }, [bettingMode, onBettingModeChange]);

  const enterBettingMode = (mode: 'bet' | 'raise') => {
    if (!chipRange) return;
    setBettingMode(mode);
    setCurrentAmount(chipRange.min);
  };

  const exitBettingMode = () => {
    setBettingMode(null);
    setCurrentAmount(0);
  };

  const incrementAmount = (increment: number) => {
    if (!chipRange) return;
    setCurrentAmount((prev) => Math.min(prev + increment, chipRange.max));
  };

  const setToAllIn = () => {
    if (!chipRange) return;
    setCurrentAmount(chipRange.max);
  };

  const confirmBet = () => {
    if (!bettingMode) return;
    onAction(bettingMode, currentAmount);
    exitBettingMode();
  };

  if (availableActions.length === 0) {
    return null;
  }

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  if (bettingMode && chipRange) {
    return (
      <Animated.View style={[styles.container, { height: animatedHeight }]}>
        <View style={styles.bettingModeContent}>
          <View style={styles.amountDisplay}>
            <Text style={styles.amountLabel}>
              {bettingMode === 'bet' ? 'Bet Amount' : 'Raise To'}
            </Text>
            <Text style={styles.amountValue}>{currentAmount}</Text>
          </View>

          <View style={styles.incrementButtons}>
            <Pressable
              onPress={() => incrementAmount(5)}
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.incrementText}>+5</Text>
            </Pressable>
            <Pressable
              onPress={() => incrementAmount(10)}
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.incrementText}>+10</Text>
            </Pressable>
            <Pressable
              onPress={() => incrementAmount(25)}
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.incrementText}>+25</Text>
            </Pressable>
            <Pressable
              onPress={() => incrementAmount(50)}
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.incrementText}>+50</Text>
            </Pressable>
            <Pressable
              onPress={() => incrementAmount(100)}
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.incrementText}>+100</Text>
            </Pressable>
          </View>

          <View style={styles.allInButtonContainer}>
            <Pressable
              onPress={setToAllIn}
              style={({ pressed }) => [
                styles.allInButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.allInText}>All In</Text>
            </Pressable>
          </View>

          <View style={styles.confirmButtons}>
            <Pressable
              onPress={exitBettingMode}
              style={({ pressed }) => [
                styles.confirmButton,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="close" size={16} color="#f87171" />
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={confirmBet}
              style={({ pressed }) => [
                styles.confirmButton,
                styles.confirmButtonGreen,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="checkmark" size={16} color="#4ade80" />
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          </View>
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
          onPress={() => enterBettingMode('bet')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Ionicons name="trending-up" size={16} color="#4ade80" />
          <Text style={styles.betText}>Bet</Text>
        </Pressable>
      )}

      {availableActions.includes('raise') && chipRange && (
        <Pressable
          onPress={() => enterBettingMode('raise')}
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
    marginBottom: 24,
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
  bettingModeContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  incrementButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  incrementButton: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
    textAlign: 'center',
  },
  allInButtonContainer: {
    marginBottom: 12,
  },
  allInButton: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allInText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
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
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  confirmButtonGreen: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
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
