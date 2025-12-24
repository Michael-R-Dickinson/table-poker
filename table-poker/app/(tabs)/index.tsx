import { Image } from 'expo-image';
import { StyleSheet, Button, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Poker Home Game</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Start Playing</ThemedText>

        <ThemedText>
          Host a new game or join an existing one with a game code
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Button
            title="Host Game"
            onPress={() => router.push('/host')}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Join Game"
            onPress={() => router.push('/join')}
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">How it works</ThemedText>
        <ThemedText>
          1. Host creates a game and shares the game code
        </ThemedText>
        <ThemedText>
          2. Players join using the game code
        </ThemedText>
        <ThemedText>
          3. Direct peer-to-peer connection established via WebRTC
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  buttonContainer: {
    marginTop: 10,
  },
});
