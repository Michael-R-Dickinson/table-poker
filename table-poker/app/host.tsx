import { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TextInput, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/use-signaling-connection';
import { useWebRTCHost } from '@/hooks/use-webrtc-host';
import { router } from 'expo-router';

export default function HostScreen() {
  const [gameCode, setGameCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [isHosting, setIsHosting] = useState(false);

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
      console.log(`Player connected: ${playerId}`);
    },
    onPlayerDisconnected: (playerId) => {
      console.log(`Player disconnected: ${playerId}`);
    },
    onDataChannelMessage: (playerId, data) => {
      console.log(`Received from ${playerId}:`, data);
    },
  });

  const generateGameCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameCode(code);
    return code;
  };

  const handleStartHosting = () => {
    if (!hostName.trim()) {
      alert('Please enter your name');
      return;
    }

    const code = gameCode || generateGameCode();
    setGameCode(code);

    connect(hostName, code);
    setIsHosting(true);
  };

  const handleStopHosting = () => {
    disconnect();
    cleanupWebRTC();
    setIsHosting(false);
  };

  const handleTestBroadcast = () => {
    broadcastToPlayers({
      type: 'test',
      message: 'Hello from host!',
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    return () => {
      if (isHosting) {
        disconnect();
        cleanupWebRTC();
      }
    };
  }, [isHosting]);

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

      {!isHosting ? (
        <ThemedView style={styles.setupContainer}>
          <ThemedText type="subtitle">Setup Your Game</ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#999"
            value={hostName}
            onChangeText={setHostName}
          />

          <TextInput
            style={styles.input}
            placeholder="Game Code (leave empty to auto-generate)"
            placeholderTextColor="#999"
            value={gameCode}
            onChangeText={setGameCode}
            maxLength={6}
            autoCapitalize="characters"
          />

          <Button title="Start Hosting" onPress={handleStartHosting} />
        </ThemedView>
      ) : (
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
            <ThemedText type="subtitle">Game Code</ThemedText>
            <ThemedText type="title" style={styles.gameCodeText}>
              {gameCode}
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              Share this code with players to join
            </ThemedText>
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
              title="Test Broadcast"
              onPress={handleTestBroadcast}
              disabled={connectedPlayers.length === 0}
            />
            <View style={styles.buttonSpacer} />
            <Button title="Stop Hosting" onPress={handleStopHosting} color="#F44336" />
          </ThemedView>
        </ThemedView>
      )}
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
  setupContainer: {
    gap: 15,
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
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginVertical: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  buttonSpacer: {
    width: 10,
  },
});
