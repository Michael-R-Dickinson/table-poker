import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  // Lock to portrait orientation
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }, []),
  );

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0e0f16', '#050508']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Purple ambient glow - simulated with gradient */}
      <LinearGradient
        colors={['rgba(138, 130, 255, 0.15)', 'transparent']}
        style={styles.purpleGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />

      {/* Decorative card suits background */}
      <View style={styles.decorativeBackground}>
        <Text style={[styles.cardSuit, styles.spadesPosition]}>♠</Text>
        <Text style={[styles.cardSuit, styles.heartsPosition]}>♥</Text>
        <Text style={[styles.cardSuit, styles.clubsPosition]}>♣</Text>
        <Text style={[styles.cardSuit, styles.diamondsPosition]}>♦</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>No-Chip Poker</Text>
          <View style={styles.subtitleContainer}>
            <View style={styles.decorativeLine} />
            <Text style={styles.subtitle}>PLAY ANYWHERE</Text>
            <View style={styles.decorativeLine} />
          </View>
        </View>

        {/* Buttons container */}
        <View style={styles.buttonsContainer}>
          {/* Host Game Button */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push('/host')}
          >
            {/* <LinearGradient
              colors={['rgba(138, 130, 255, 0.15)', 'rgba(90, 60, 255, 0.15)']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            > */}
            <View style={styles.buttonBorder}>
              <View style={styles.buttonContent}>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>Host Game</Text>
                  <Text style={styles.buttonSubtitle}>Start a new table</Text>
                </View>
                <Text style={styles.buttonIcon}>♠</Text>
              </View>
            </View>
            {/* </LinearGradient> */}
          </Pressable>

          {/* Join Game Button */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push('/join')}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.buttonBorder, styles.buttonBorderLight]}>
                <View style={styles.buttonContent}>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>Join Game</Text>
                    <Text style={styles.buttonSubtitle}>Enter a game code</Text>
                  </View>
                  <Text style={styles.buttonIcon}>♦</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Bottom decorative dots */}
        <View style={styles.bottomDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotFaded]} />
          <View style={[styles.dot, styles.dotFaded]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  purpleGlow: {
    position: 'absolute',
    top: 0,
    left: width / 2 - 300,
    width: 600,
    height: '100%',
    opacity: 0.4,
  },
  decorativeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  cardSuit: {
    position: 'absolute',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  spadesPosition: {
    top: 40,
    left: 40,
    fontSize: 96,
  },
  heartsPosition: {
    top: 128,
    right: 64,
    fontSize: 72,
  },
  clubsPosition: {
    bottom: 128,
    left: 80,
    fontSize: 84,
  },
  diamondsPosition: {
    bottom: 80,
    right: 96,
    fontSize: 108,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 64,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decorativeLine: {
    width: 48,
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: 2,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    width: '100%',
  },
  buttonBorder: {
    backgroundColor: 'rgba(114, 105, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(138, 130, 255, 0.2)',
    borderRadius: 16,
    shadowColor: 'rgba(90, 60, 255, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  buttonBorderLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
  },
  buttonContent: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  buttonTextContainer: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  buttonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  buttonIcon: {
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  bottomDots: {
    position: 'absolute',
    bottom: 32,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    opacity: 0.2,
  },
  dotFaded: {
    opacity: 0.1,
  },
});
