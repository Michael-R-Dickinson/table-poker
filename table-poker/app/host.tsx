import { useState, useEffect } from 'react';
import { StyleSheet, View, Button, FlatList, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/use-signaling-connection';
import { useWebRTCHost } from '@/hooks/use-webrtc-host';
import { router } from 'expo-router';
import { logger } from '@/utils/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';
import { ROUTES } from '@/constants/routes';

export default function HostScreen() {
  const [gameCode, setGameCode] = useState('');
  const [smallBlind, setSmallBlind] = useState('5');
  const [bigBlind, setBigBlind] = useState('10');
  const [buyIn, setBuyIn] = useState('1000');

  const { connectionState, error, connect, disconnect, sendMessage } =
    useSignalingConnection({
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

  console.log('connected players state updated: ', connectedPlayers);
  const generateGameCode = () => {
    // Production: random code generation
    // const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Testing: fixed code for easier development
    const code = 'AAAAAA';

    setGameCode(code);
    return code;
  };

  const handleStopHosting = () => {
    disconnect();
    cleanupWebRTC();
    router.back();
  };

  const handleStartGame = () => {
    const gameConfig = {
      smallBlind: parseInt(smallBlind, 10),
      bigBlind: parseInt(bigBlind, 10),
      buyIn: parseInt(buyIn, 10),
    };

    broadcastToPlayers({
      type: 'game_start',
      config: gameConfig,
    });

    router.push({
      pathname: ROUTES.HOST_IN_GAME as any,
      params: {
        gameCode,
        smallBlind,
        bigBlind,
        buyIn,
      },
    });
  };

  useEffect(() => {
    const code = generateGameCode();
    connect(HOST_PLAYER_ID, code);

    return () => {
      disconnect();
      cleanupWebRTC();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Host Game</ThemedText>
        <Button title="Back" onPress={() => router.back()} />
      </ThemedView>

      <ThemedView style={styles.gameContainer}>
        <ThemedView style={styles.statusContainer}>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getConnectionStatusColor() },
              ]}
            />
            <ThemedText>Status: {connectionState}</ThemedText>
          </View>

          {error && <ThemedText style={styles.errorText}>Error: {error}</ThemedText>}
        </ThemedView>

        <ThemedView style={styles.gameCodeContainer}>
          <ThemedText type="subtitle" darkColor="#000000ff" lightColor="000000ff">
            Game Code
          </ThemedText>
          <ThemedText
            type="title"
            darkColor="#000000ff"
            lightColor="000000ff"
            style={styles.gameCodeText}
          >
            {gameCode}
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            Share this code with players to join
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.configContainer}>
          <ThemedText type="subtitle">Game Configuration</ThemedText>

          <ThemedView style={styles.configRow}>
            <ThemedText style={styles.configLabel}>Small Blind:</ThemedText>
            <TextInput
              style={styles.configInput}
              value={smallBlind}
              onChangeText={setSmallBlind}
              keyboardType="numeric"
            />
          </ThemedView>

          <ThemedView style={styles.configRow}>
            <ThemedText style={styles.configLabel}>Big Blind:</ThemedText>
            <TextInput
              style={styles.configInput}
              value={bigBlind}
              onChangeText={setBigBlind}
              keyboardType="numeric"
            />
          </ThemedView>

          <ThemedView style={styles.configRow}>
            <ThemedText style={styles.configLabel}>Buy-In:</ThemedText>
            <TextInput
              style={styles.configInput}
              value={buyIn}
              onChangeText={setBuyIn}
              keyboardType="numeric"
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.playersContainer}>
          <ThemedText type="subtitle">
            Connected Players ({connectedPlayers.length})
          </ThemedText>
          {connectedPlayers.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Waiting for players to join...
            </ThemedText>
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
          <Button
            title="Start Game"
            onPress={handleStartGame}
            disabled={connectedPlayers.length === 0}
            color="#4CAF50"
          />
          <View style={styles.buttonSpacer} />
          <Button title="Stop Hosting" onPress={handleStopHosting} color="#F44336" />
        </ThemedView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameContainer: {
    flex: 1,
    gap: 20,
  },
  statusContainer: {
    gap: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  errorText: {
    color: '#F44336',
  },
  gameCodeContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  gameCodeText: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginVertical: 10,
    padding: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
  },
  configContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    gap: 12,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configLabel: {
    fontSize: 16,
    flex: 1,
  },
  configInput: {
    height: 40,
    width: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
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
    flexDirection: 'row',
    gap: 10,
  },
  buttonSpacer: {
    width: 10,
  },
});
