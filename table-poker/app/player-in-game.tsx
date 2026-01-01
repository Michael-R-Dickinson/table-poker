import { StyleSheet, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, router } from 'expo-router';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { useWebRTCPlayer } from '@/hooks/player/use-webrtc-player';
import { usePlayerGameplay } from '@/hooks/player/use-player-gameplay';
import { useMemo } from 'react';
import { logger } from '@/utils/shared/logger';
import { MobilePokerGame } from '@/components/mobile-poker-draft/mobile-poker-game';
import { mapGameStateToUI } from '@/utils/player/map-game-state-to-ui';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerInGameScreen() {
  const params = useLocalSearchParams();
  const { gameCode, playerName } = params;

  const { sendMessage, disconnect: disconnectSignaling } = useSignalingConnection({
    onMessage: (message) => {
      handleSignalingMessage(message);
    },
  });

  const {
    connectionState,
    handleSignalingMessage,
    sendToHost,
    disconnect: disconnectWebRTC,
  } = useWebRTCPlayer({
    sendSignalingMessage: sendMessage,
    onConnected: () => {
      logger.info('Connected to host');
    },
    onDisconnected: () => {
      logger.info('Disconnected from host');
    },
    onDataChannelMessage: (data) => {
      handleGameStateMessage(data);
    },
  });

  const { gameState, winningInfo, handleGameStateMessage, takeAction } =
    usePlayerGameplay({
      sendToHost,
    });

  const handleLeaveGame = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave the game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            disconnectSignaling();
            disconnectWebRTC();
            router.replace('/');
          },
        },
      ],
      { cancelable: true },
    );
  };

  const uiState = useMemo(() => mapGameStateToUI(gameState), [gameState]);

  if (!uiState) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveGame}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <ThemedView style={styles.waitingContainer}>
          <ThemedText style={styles.waitingTitle}>
            {connectionState === 'connected' ? 'Connected' : 'Connecting...'}
          </ThemedText>
          <ThemedText style={styles.waitingSubtitle}>
            Waiting for game to start...
          </ThemedText>
          <ThemedText style={styles.waitingInfo}>Game: {gameCode}</ThemedText>
          <ThemedText style={styles.waitingInfo}>Player: {playerName}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.leaveButton}
        onPress={handleLeaveGame}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <MobilePokerGame
        opponents={uiState.opponents}
        playerCards={uiState.playerCards}
        playerChips={uiState.playerChips}
        playerCurrentBet={uiState.playerCurrentBet}
        isPlayerTurn={uiState.isPlayerTurn}
        availableActions={gameState?.availableActions || []}
        onAction={takeAction}
        chipRange={gameState?.chipRange || null}
        amountToCall={gameState?.amountToCall || null}
        winningInfo={winningInfo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leaveButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  waitingSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  waitingInfo: {
    fontSize: 14,
    color: '#999',
  },
});
