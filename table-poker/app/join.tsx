import { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/use-signaling-connection';
import { useWebRTCPlayer } from '@/hooks/use-webrtc-player';
import { router } from 'expo-router';
import { logger } from '@/utils/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';

export default function JoinScreen() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const {
    connectionState: signalingState,
    error,
    connect,
    disconnect,
    sendMessage,
  } = useSignalingConnection({
    onMessage: (message) => {
      handleSignalingMessage(message);
    },
  });

  const {
    connectionState: webrtcState,
    handleSignalingMessage,
    sendToHost,
    disconnect: disconnectWebRTC,
  } = useWebRTCPlayer({
    sendSignalingMessage: sendMessage,
    onConnected: () => {
      logger.info('Connected to host via WebRTC');
      setIsJoined(true);
    },
    onDisconnected: () => {
      logger.info('Disconnected from host');
      setIsJoined(false);
    },
    onDataChannelMessage: (data) => {
      logger.info('Received from host:', data);
    },
  });

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (playerName.toUpperCase() === HOST_PLAYER_ID) {
      alert(
        `Cannot use "${HOST_PLAYER_ID}" as player name - this is reserved for the host`,
      );
      return;
    }

    if (!gameCode.trim() || gameCode.length !== 6) {
      alert('Please enter a valid 6-character game code');
      return;
    }

    connect(playerName, gameCode.toUpperCase());
    setIsJoining(true);

    setTimeout(() => {
      sendMessage({
        type: 'join',
        payload: { playerName },
      });
    }, 1000);
  };

  const handleLeaveGame = () => {
    disconnect();
    disconnectWebRTC();
    setIsJoining(false);
    setIsJoined(false);
  };

  const handleTestSend = () => {
    sendToHost({
      type: 'test',
      message: 'Hello from player!',
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    return () => {
      if (isJoining) {
        disconnect();
        disconnectWebRTC();
      }
    };
  }, [isJoining]);

  const getSignalingStatusColor = () => {
    switch (signalingState) {
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

  const getWebRTCStatusColor = () => {
    switch (webrtcState) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Join Game</ThemedText>
        <Button title="Back" onPress={() => router.back()} />
      </ThemedView>

      {!isJoining ? (
        <ThemedView style={styles.setupContainer}>
          <ThemedText type="subtitle">Join a Game</ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#999"
            value={playerName}
            onChangeText={setPlayerName}
          />

          <TextInput
            style={styles.input}
            placeholder="Game Code"
            placeholderTextColor="#999"
            value={gameCode}
            onChangeText={(text) => setGameCode(text.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />

          <Button title="Join Game" onPress={handleJoinGame} />
        </ThemedView>
      ) : (
        <ThemedView style={styles.gameContainer}>
          <ThemedView style={styles.statusContainer}>
            <ThemedText type="subtitle">Connection Status</ThemedText>

            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getSignalingStatusColor() },
                ]}
              />
              <ThemedText>Signaling: {signalingState}</ThemedText>
            </View>

            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getWebRTCStatusColor() },
                ]}
              />
              <ThemedText>WebRTC: {webrtcState}</ThemedText>
            </View>

            {error && <ThemedText style={styles.errorText}>Error: {error}</ThemedText>}
          </ThemedView>

          <ThemedView style={styles.gameInfoContainer}>
            <ThemedText type="subtitle">Game Code</ThemedText>
            <ThemedText type="title" style={styles.gameCodeText}>
              {gameCode}
            </ThemedText>
            <ThemedText style={styles.playerNameText}>
              Playing as: {playerName}
            </ThemedText>
          </ThemedView>

          {isJoined ? (
            <ThemedView style={styles.connectedContainer}>
              <ThemedText style={styles.connectedText}>Connected to Host!</ThemedText>
              <ThemedText style={styles.instructionText}>
                Waiting for game to start...
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.connectingContainer}>
              <ThemedText style={styles.connectingText}>Connecting to host...</ThemedText>
              <ThemedText style={styles.instructionText}>
                Please wait while we establish connection
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.actionsContainer}>
            <Button title="Test Send" onPress={handleTestSend} disabled={!isJoined} />
            <View style={styles.buttonSpacer} />
            <Button title="Leave Game" onPress={handleLeaveGame} color="#F44336" />
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
  gameInfoContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  gameCodeText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginVertical: 10,
  },
  playerNameText: {
    fontSize: 16,
    color: '#666',
  },
  connectedContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  connectedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  connectingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  connectingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
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
