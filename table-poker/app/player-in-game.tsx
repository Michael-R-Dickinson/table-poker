import { MobilePokerGame } from '@/components/mobile-poker-draft/mobile-poker-game';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerGameplay } from '@/hooks/player/use-player-gameplay';
import { useWebRTCPlayer } from '@/hooks/player/use-webrtc-player';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { mapGameStateToUI } from '@/utils/player/map-game-state-to-ui';
import { logger } from '@/utils/shared/logger';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleLeaveGame();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const uiState = useMemo(() => mapGameStateToUI(gameState), [gameState]);

  if (!uiState) {
    return (
      <SafeAreaView style={styles.container}>
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

      <Modal
        visible={connectionState === 'disconnected'}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              Disconnected from host device
            </ThemedText>
            <Pressable
              style={styles.leaveButton}
              onPress={() => {
                disconnectSignaling();
                disconnectWebRTC();
                router.replace('/');
              }}
            >
              <ThemedText style={styles.leaveButtonText}>Leave Game</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    minWidth: 280,
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  leaveButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
