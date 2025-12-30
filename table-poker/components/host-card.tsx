import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from './themed-text';

type Suit = 'club' | 'diamond' | 'heart' | 'spade';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface HostCardProps {
  suit: Suit;
  value: Value;
}

const suitImages = {
  club: require('@/assets/images/card-suits/club.png'),
  diamond: require('@/assets/images/card-suits/diamond.png'),
  heart: require('@/assets/images/card-suits/heart.png'),
  spade: require('@/assets/images/card-suits/spade.png'),
};

const suitColors = {
  club: '#1e293b',
  diamond: '#ef4444',
  heart: '#ef4444',
  spade: '#1e293b',
};

export function HostCard({ suit, value }: HostCardProps) {
  const textColor = suitColors[suit];

  return (
    <View style={styles.card}>
      <View style={styles.topCorner}>
        <ThemedText
          style={[styles.valueText, { color: textColor }]}
          lightColor={textColor}
          darkColor={textColor}
        >
          {value}
        </ThemedText>
        <Image source={suitImages[suit]} style={styles.cornerSuitIcon} />
      </View>

      <View style={styles.centerSuitContainer}>
        <Image source={suitImages[suit]} style={styles.centerSuitIcon} />
      </View>

      <View style={styles.bottomCorner}>
        <ThemedText
          style={[styles.valueText, { color: textColor }]}
          lightColor={textColor}
          darkColor={textColor}
        >
          {value}
        </ThemedText>
        <Image source={suitImages[suit]} style={styles.cornerSuitIcon} />
      </View>
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
    backgroundColor: '#ffffff',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  topCorner: {
    position: 'absolute',
    left: 4,
    top: 4,
    alignItems: 'center',
  },
  bottomCorner: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  cornerSuitIcon: {
    width: 14,
    height: 14,
  },
  centerSuitContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSuitIcon: {
    width: 48,
    height: 48,
    opacity: 0.9,
  },
});
