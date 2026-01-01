import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { useWebRTCHost } from '@/hooks/host/use-webrtc-host';
import { router } from 'expo-router';
import { logger } from '@/utils/shared/logger';
import { HOST_PLAYER_ID } from '@/constants/signaling';
import { ROUTES } from '@/constants/routes';
import { DEBUG_MODE } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function HostScreen() {
  const [gameCode, setGameCode] = useState('');
  const [smallBlind, setSmallBlind] = useState('10');
  const [bigBlind, setBigBlind] = useState('20');
  const [buyIn, setBuyIn] = useState('1000');
  const [orderedPlayers, setOrderedPlayers] = useState<string[]>([]);

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
    const code = DEBUG_MODE
      ? 'AAAAAA'
      : Math.random().toString(36).substring(2, 8).toUpperCase();

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
    // Don't cleanup on unmount - connections persist across navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOrderedPlayers((prev) => {
      const newPlayers = connectedPlayers.filter((p) => !prev.includes(p));
      const stillConnected = prev.filter((p) => connectedPlayers.includes(p));
      return [...stillConnected, ...newPlayers];
    });
  }, [connectedPlayers]);

  const getPositionLabel = (index: number, totalPlayers: number): string => {
    if (totalPlayers === 2) {
      return index === 0 ? 'BTN' : 'BB';
    }

    if (index === 0) return 'BTN';
    if (index === 1) return 'SB';
    if (index === 2) return 'BB';

    const remaining = totalPlayers - 3;
    const posIndex = index - 3;

    if (totalPlayers === 4) {
      return 'CO';
    }

    if (totalPlayers === 5) {
      return posIndex === 0 ? 'UTG' : 'CO';
    }

    if (totalPlayers === 6) {
      if (posIndex === 0) return 'UTG';
      if (posIndex === 1) return 'MP';
      return 'CO';
    }

    if (totalPlayers === 7) {
      if (posIndex === 0) return 'UTG';
      if (posIndex === 1) return 'UTG+1';
      if (posIndex === 2) return 'MP';
      return 'CO';
    }

    if (totalPlayers === 8) {
      if (posIndex === 0) return 'UTG';
      if (posIndex === 1) return 'UTG+1';
      if (posIndex === 2) return 'UTG+2';
      if (posIndex === 3) return 'MP';
      return 'CO';
    }

    if (posIndex === remaining - 1) return 'CO';
    if (posIndex === remaining - 2) return 'HJ';
    if (posIndex === remaining - 3) return 'MP';
    if (posIndex === 0) return 'UTG';

    return `UTG+${posIndex}`;
  };

  const movePlayerUp = (index: number) => {
    if (index === 0) return;
    setOrderedPlayers((prev) => {
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  const movePlayerDown = (index: number) => {
    if (index === orderedPlayers.length - 1) return;
    setOrderedPlayers((prev) => {
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

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
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0e0f16', '#050508']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Purple ambient glow */}
      <LinearGradient
        colors={['rgba(138, 130, 255, 0.15)', 'transparent']}
        style={styles.purpleGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />

      {/* Decorative card suits background */}
      <View style={styles.decorativeBackground}>
        <Text style={[styles.cardSuit, styles.spadesPosition]}>♠</Text>
        <Text style={[styles.cardSuit, styles.clubsPosition]}>♣</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Host Game</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getConnectionStatusColor() },
              ]}
            />
            <Text style={styles.statusText}>{connectionState}</Text>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Game Code Display */}
        <View style={styles.gameCodeContainer}>
          <Text style={styles.gameCodeLabel}>GAME CODE</Text>
          <Text style={styles.gameCodeText}>{gameCode}</Text>
          <Text style={styles.instructionText}>Share this code with players to join</Text>
        </View>

        {/* Game Configuration */}
        <View style={styles.configContainer}>
          <Text style={styles.sectionTitle}>Configuration</Text>

          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Small Blind</Text>
            <TextInput
              style={styles.configInput}
              value={smallBlind}
              onChangeText={setSmallBlind}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Big Blind</Text>
            <TextInput
              style={styles.configInput}
              value={bigBlind}
              onChangeText={setBigBlind}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Buy-In</Text>
            <TextInput
              style={styles.configInput}
              value={buyIn}
              onChangeText={setBuyIn}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Connected Players */}
        <View style={styles.playersContainer}>
          <Text style={styles.sectionTitle}>Players ({orderedPlayers.length})</Text>

          {orderedPlayers.length === 0 ? (
            <Text style={styles.emptyText}>Waiting for players to join...</Text>
          ) : (
            <FlatList
              data={orderedPlayers}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <View style={styles.playerItem}>
                  <View style={styles.positionTile}>
                    <Text style={styles.positionText}>
                      {getPositionLabel(index, orderedPlayers.length)}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <View style={styles.playerDot} />
                    <Text style={styles.playerText}>{item}</Text>
                  </View>
                  <View style={styles.playerControls}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.controlButton,
                        index === 0 && styles.controlButtonDisabled,
                        pressed && styles.controlButtonPressed,
                      ]}
                      onPress={() => movePlayerUp(index)}
                      disabled={index === 0}
                    >
                      <Text
                        style={[
                          styles.controlButtonText,
                          index === 0 && styles.controlButtonTextDisabled,
                        ]}
                      >
                        ↑
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.controlButton,
                        index === orderedPlayers.length - 1 &&
                          styles.controlButtonDisabled,
                        pressed && styles.controlButtonPressed,
                      ]}
                      onPress={() => movePlayerDown(index)}
                      disabled={index === orderedPlayers.length - 1}
                    >
                      <Text
                        style={[
                          styles.controlButtonText,
                          index === orderedPlayers.length - 1 &&
                            styles.controlButtonTextDisabled,
                        ]}
                      >
                        ↓
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              orderedPlayers.length === 0 && styles.primaryButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStartGame}
            disabled={orderedPlayers.length === 0}
          >
            <Text
              style={[
                styles.primaryButtonText,
                orderedPlayers.length === 0 && styles.primaryButtonTextDisabled,
              ]}
            >
              Start Game
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStopHosting}
          >
            <Text style={styles.secondaryButtonText}>Stop Hosting</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    right: 40,
    fontSize: 80,
  },
  clubsPosition: {
    bottom: 80,
    left: 60,
    fontSize: 72,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 24,
    color: '#ffffff',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  gameCodeContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#151524',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 130, 255, 0.2)',
    marginBottom: 20,
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
  instructionText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  configContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configLabel: {
    fontSize: 15,
    color: '#d1d5db',
  },
  configInput: {
    height: 40,
    width: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    textAlign: 'right',
  },
  playersContainer: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 16,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  positionTile: {
    minWidth: 52,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(138, 130, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(138, 130, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8a82ff',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  playerText: {
    fontSize: 15,
    color: '#ffffff',
  },
  playerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlButtonPressed: {
    opacity: 0.6,
  },
  controlButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  controlButtonTextDisabled: {
    color: '#6b7280',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#151524',
    borderWidth: 1,
    borderColor: 'rgba(138, 130, 255, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: 'rgba(90, 60, 255, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  primaryButtonTextDisabled: {
    color: '#6b7280',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
