import { View, StyleSheet } from 'react-native';

export function HostCardBack() {
  return (
    <View style={styles.card}>
      <View style={styles.pattern} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 128,
    width: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#141820',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  pattern: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'solid',
  },
});
