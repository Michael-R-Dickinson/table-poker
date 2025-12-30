import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PotDisplayProps {
  amount: number;
}

export function PotDisplay({ amount }: PotDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Ionicons name="wallet-outline" size={20} color="#9ca3af" />
        <Text style={styles.labelText}>BET</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
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
  amount: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -2,
  },
});
