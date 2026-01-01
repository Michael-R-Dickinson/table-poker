import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { useWebRTCPlayer } from '@/hooks/player/use-webrtc-player';
import { router } from 'expo-router';
import { logger } from '@/utils/shared/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';
import { ROUTES } from '@/constants/routes';
import { DEBUG_MODE } from '@/constants/config';

const { width } = Dimensions.get('window');

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
    <View style={styles.container}>
      {/* Purple ambient glow */}
      <LinearGradient
        colors={['rgba(138, 130, 255, 0.15)', 'transparent']}
        style={styles.purpleGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />

      {/* Decorative card suits background */}
      <View style={styles.decorativeBackground}>
        <Text style={[styles.cardSuit, styles.heartsPosition]}>♣</Text>
        <Text style={[styles.cardSuit, styles.diamondsPosition]}>♦</Text>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Join Game</Text>
        </View>

        {!isJoining ? (
          <View style={styles.setupContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>YOUR NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#6b7280"
                value={playerName}
                onChangeText={setPlayerName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GAME CODE</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#6b7280"
                value={gameCode}
                onChangeText={(text) => setGameCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleJoinGame}
            >
              <Text style={styles.primaryButtonText}>Join Game</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.gameContainer}>
            {/* Connection Status */}
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getSignalingStatusColor() },
                  ]}
                />
                <Text style={styles.statusText}>Signaling: {signalingState}</Text>
              </View>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getWebRTCStatusColor() },
                  ]}
                />
                <Text style={styles.statusText}>WebRTC: {webrtcState}</Text>
              </View>

              {error && <Text style={styles.errorText}>Error: {error}</Text>}
            </View>

            {/* Game Info */}
            <View style={styles.gameInfoContainer}>
              <Text style={styles.gameCodeLabel}>GAME CODE</Text>
              <Text style={styles.gameCodeText}>{gameCode}</Text>
              <Text style={styles.playerNameText}>Playing as: {playerName}</Text>
            </View>

            {/* Connection Status Messages */}
            {joinError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitleText}>Connection Failed</Text>
                <Text style={styles.errorMessageText}>{joinError}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    setJoinError(null);
                    setIsJoining(false);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Try Again</Text>
                </Pressable>
              </View>
            ) : isJoined ? (
              <View style={styles.connectedContainer}>
                <Text style={styles.connectedText}>Connected to Host</Text>
                <Text style={styles.instructionText}>Waiting for game to start...</Text>
              </View>
            ) : (
              <View style={styles.connectingContainer}>
                <Text style={styles.connectingText}>Connecting to host...</Text>
                <Text style={styles.instructionText}>
                  Please wait while we establish connection
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.testButton,
                  !isJoined && styles.testButtonDisabled,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleTestSend}
                disabled={!isJoined}
              >
                <Text
                  style={[
                    styles.testButtonText,
                    !isJoined && styles.testButtonTextDisabled,
                  ]}
                >
                  Test Send
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.leaveButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleLeaveGame}
              >
                <Text style={styles.leaveButtonText}>Leave Game</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    paddingTop: 40,
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
  heartsPosition: {
    top: 60,
    right: 50,
    fontSize: 88,
  },
  diamondsPosition: {
    bottom: 100,
    left: 70,
    fontSize: 96,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: 32,
    color: '#ffffff',
    marginTop: -4,
  },
  setupContainer: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: 2,
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  primaryButton: {
    backgroundColor: '#151524',
    borderWidth: 1,
    borderColor: 'rgba(138, 130, 255, 0.3)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: 'rgba(90, 60, 255, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gameContainer: {
    flex: 1,
    gap: 20,
  },
  statusContainer: {
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#d1d5db',
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 4,
  },
  gameInfoContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#151524',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 130, 255, 0.2)',
  },
  gameCodeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: 2,
    marginBottom: 8,
  },
  gameCodeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 12,
    marginVertical: 8,
  },
  playerNameText: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  connectedContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connectedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  connectingContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  connectingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fb923c',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 16,
  },
  errorTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  errorMessageText: {
    fontSize: 14,
    color: '#f87171',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  testButtonDisabled: {
    opacity: 0.4,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d1d5db',
  },
  testButtonTextDisabled: {
    color: '#6b7280',
  },
  leaveButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d1d5db',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
