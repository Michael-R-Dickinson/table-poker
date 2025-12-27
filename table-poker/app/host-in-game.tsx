import { StyleSheet, View, Button, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/use-signaling-connection';
import { useWebRTCHost } from '@/hooks/use-webrtc-host';
import { useLocalSearchParams, router } from 'expo-router';
import { logger } from '@/utils/logger';

export default function HostInGameScreen() {
  const params = useLocalSearchParams();
  const { gameCode, smallBlind, bigBlind, buyIn } = params;

  const { sendMessage } = useSignalingConnection({
    onMessage: (message) => {
      handleSignalingMessage(message);
    },
  });

  const {
    connectedPlayers,
    handleSignalingMessage,
    broadcastToPlayers,
    cleanup: cleanupWebRTC,
  } = useWebRTCHost({
    sendSignalingMessage: sendMessage,
    onPlayerConnected: (playerId) => {
      logger.info(`Player connected: ${playerId}`);
    },
    onPlayerDisconnected: (playerId) => {
      logger.info(`Player disconnected: ${playerId}`);
    },
    onDataChannelMessage: (playerId, data) => {
      logger.info(`Received from ${playerId}:`, data);
    },
  });

  const handleEndGame = () => {
    broadcastToPlayers({
      type: 'game_end',
    });
    cleanupWebRTC();
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Game In Progress</ThemedText>
      </ThemedView>

      <ThemedView style={styles.gameInfoContainer}>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Game Code:</ThemedText>
          <ThemedText style={styles.infoValue}>{gameCode}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Small Blind:</ThemedText>
          <ThemedText style={styles.infoValue}>{smallBlind}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Big Blind:</ThemedText>
          <ThemedText style={styles.infoValue}>{bigBlind}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Buy-In:</ThemedText>
          <ThemedText style={styles.infoValue}>{buyIn}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.playersContainer}>
        <ThemedText type="subtitle">Players ({connectedPlayers.length})</ThemedText>
        {connectedPlayers.length === 0 ? (
          <ThemedText style={styles.emptyText}>No players connected</ThemedText>
        ) : (
          <FlatList
            data={connectedPlayers}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <ThemedView style={styles.playerItem}>
                <View style={styles.playerDot} />
                <ThemedText>{item}</ThemedText>
              </ThemedView>
            )}
          />
        )}
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        <Button title="End Game" onPress={handleEndGame} color="#F44336" />
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
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
  },
  playersContainer: {
    flex: 1,
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 4,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  actionsContainer: {
    marginTop: 20,
  },
});
