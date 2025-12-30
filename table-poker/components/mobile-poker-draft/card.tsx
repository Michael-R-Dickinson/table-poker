import { View, Text, StyleSheet, Image } from 'react-native';

interface CardProps {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  size?: 'small' | 'medium' | 'large';
}

const suitImageMap = {
  hearts: require('@/assets/images/heart.png'),
  diamonds: require('@/assets/images/diamond.png'),
  clubs: require('@/assets/images/club.png'),
  spades: require('@/assets/images/spade.png'),
};

const suitColors = {
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#1e293b',
  spades: '#1e293b',
};

const sizes = {
  small: {
    container: { height: 80, width: 56 },
    topValue: { fontSize: 20 },
    topSuit: { height: 10, width: 10 },
    bottomSuit: { height: 28, width: 28 },
    padding: 6,
  },
  medium: {
    container: { height: 112, width: 80 },
    topValue: { fontSize: 30 },
    topSuit: { height: 14, width: 14 },
    bottomSuit: { height: 48, width: 48 },
    padding: 8,
  },
  large: {
    container: { height: 176, width: 128 },
    topValue: { fontSize: 60 },
    topSuit: { height: 20, width: 20 },
    bottomSuit: { height: 80, width: 80 },
    padding: 12,
  },
};

export function Card({ rank, suit, size = 'medium' }: CardProps) {
  const textColor = suitColors[suit];
  const suitImage = suitImageMap[suit];
  const sizeConfig = sizes[size];

  return (
    <View
      style={[styles.container, sizeConfig.container, { padding: sizeConfig.padding }]}
    >
      <View style={styles.topCorner}>
        <Text style={[styles.rankText, sizeConfig.topValue, { color: textColor }]}>
          {rank}
        </Text>
        <Image source={suitImage} style={[styles.topSuitImage, sizeConfig.topSuit]} />
      </View>

      <View style={styles.bottomCorner}>
        <Image
          source={suitImage}
          style={[styles.bottomSuitImage, sizeConfig.bottomSuit]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  topCorner: {
    position: 'absolute',
    left: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rankText: {
    fontWeight: 'bold',
    lineHeight: undefined,
  },
  topSuitImage: {
    opacity: 0.8,
  },
  bottomCorner: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  bottomSuitImage: {
    opacity: 0.9,
  },
});
