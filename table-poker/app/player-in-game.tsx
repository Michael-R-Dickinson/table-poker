import { StyleSheet, View } from 'react-native';
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
    disconnectSignaling();
    disconnectWebRTC();
    router.replace('/');
  };

  const uiState = useMemo(() => mapGameStateToUI(gameState), [gameState]);

  if (!uiState) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      />
    </View>
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
});
