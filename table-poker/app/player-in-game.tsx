import { StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, router } from 'expo-router';

export default function PlayerInGameScreen() {
  const params = useLocalSearchParams();
  const { gameCode, playerName } = params;

  const handleLeaveGame = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Game In Progress</ThemedText>
      </ThemedView>

      <ThemedView style={styles.gameInfoContainer}>
        <ThemedText type="subtitle">Game Code: {gameCode}</ThemedText>
        <ThemedText style={styles.playerNameText}>Playing as: {playerName}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.statusText}>Waiting for game to start...</ThemedText>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        <Button title="Leave Game" onPress={handleLeaveGame} color="#F44336" />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  gameInfoContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  playerNameText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 20,
  },
});
