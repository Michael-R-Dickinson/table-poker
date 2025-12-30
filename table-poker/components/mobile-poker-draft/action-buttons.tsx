import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonsProps {
  onFold: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  isPlayerTurn: boolean;
}

export function ActionButtons({
  onFold,
  onCall,
  onRaise,
  isPlayerTurn,
}: ActionButtonsProps) {
  const raiseAmount = 20;

  if (!isPlayerTurn) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onFold}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="close" size={16} color="#f87171" />
        <Text style={styles.foldText}>Fold</Text>
      </Pressable>

      <Pressable
        onPress={() => onRaise(raiseAmount)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="trending-up" size={16} color="#4ade80" />
        <Text style={styles.raiseText}>Raise</Text>
      </Pressable>

      <Pressable
        onPress={onCall}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="checkmark-done" size={16} color="#60a5fa" />
        <Text style={styles.checkText}>Check</Text>
      </Pressable>
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
});
