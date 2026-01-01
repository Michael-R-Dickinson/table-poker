import { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { useWebRTCPlayer } from '@/hooks/player/use-webrtc-player';
import { router } from 'expo-router';
import { logger } from '@/utils/shared/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';
import { ROUTES } from '@/constants/routes';
import { DEBUG_MODE } from '@/constants/config';

export default function JoinScreen() {
  const [gameCode, setGameCode] = useState(DEBUG_MODE ? 'AAAAAA' : '');
  const [playerName, setPlayerName] = useState(DEBUG_MODE ? 'player' : '');
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const {
    connectionState: signalingState,
    error,
    connect,
    disconnect,
    sendMessage,
  } = useSignalingConnection({
    onMessage: (message) => {
      if (message.type === 'error') {
        const errorPayload = message.payload as { code: string; message: string };
        logger.error('Signaling error:', errorPayload);
        setJoinError(errorPayload.message);
        disconnect();
        disconnectWebRTC();
      } else {
        handleSignalingMessage(message);
      }
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
      if (data.type === 'game_start') {
        router.push({
          pathname: ROUTES.PLAYER_IN_GAME as any,
          params: {
            gameCode,
            playerName,
          },
        });
      }
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

    setJoinError(null);
    connect(playerName, gameCode.toUpperCase());
    setIsJoining(true);

    setTimeout(() => {
      sendMessage({
        type: 'join',
        targetId: HOST_PLAYER_ID,
        payload: { playerName },
      });
      logger.info(`Sending join message for game: `, {
        targetId: HOST_PLAYER_ID,
        payload: { playerName },
      });
    }, 1000);
  };

  const handleLeaveGame = () => {
    disconnect();
    disconnectWebRTC();
    setIsJoining(false);
    setIsJoined(false);
    setJoinError(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      case 'disconnected':
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

          {joinError ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorTitleText}>Connection Failed</ThemedText>
              <ThemedText style={styles.errorMessageText}>{joinError}</ThemedText>
              <View style={styles.buttonSpacer} />
              <Button
                title="Try Again"
                onPress={() => {
                  setJoinError(null);
                  setIsJoining(false);
                }}
              />
            </ThemedView>
          ) : isJoined ? (
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
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
  },
  errorTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  errorMessageText: {
    fontSize: 14,
    color: '#D32F2F',
    marginTop: 8,
    textAlign: 'center',
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
