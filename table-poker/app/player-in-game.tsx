import { StyleSheet, Button, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, router } from 'expo-router';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { useWebRTCPlayer } from '@/hooks/player/use-webrtc-player';
import { usePlayerGameplay } from '@/hooks/player/use-player-gameplay';
import { useMemo } from 'react';
import { logger } from '@/utils/shared/logger';

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

  const { gameState, handleGameStateMessage, takeAction } = usePlayerGameplay({
    sendToHost,
  });

  const handleLeaveGame = () => {
    disconnectSignaling();
    disconnectWebRTC();
    router.replace('/');
  };

  const formatCard = (card: any) => {
    if (!card) return '';
    const rankMap: { [key: string]: string } = {
      '10': 'T',
    };
    const rank = rankMap[card.rank] || card.rank;
    const suitMap: { [key: string]: string } = {
      clubs: 'c',
      diamonds: 'd',
      hearts: 'h',
      spades: 's',
    };
    const suit = suitMap[card.suit] || card.suit[0];
    return `${rank}${suit}`;
  };

  const myPlayerInfo = useMemo(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.seatIndex === gameState.playerToAct);
  }, [gameState]);

  const isMyTurn = useMemo(() => {
    if (!gameState) return false;
    return gameState.playerToAct !== null && gameState.availableActions !== null;
  }, [gameState]);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Game In Progress</ThemedText>
      </ThemedView>

      <ThemedView style={styles.gameInfoContainer}>
        <ThemedText type="subtitle">Game Code: {gameCode}</ThemedText>
        <ThemedText style={styles.playerNameText}>Playing as: {playerName}</ThemedText>
        <ThemedText style={styles.statusText}>
          {connectionState === 'connected' ? 'Connected' : 'Connecting...'}
        </ThemedText>
      </ThemedView>

      {!gameState && (
        <ThemedView style={styles.statusContainer}>
          <ThemedText style={styles.statusText}>Waiting for game to start...</ThemedText>
        </ThemedView>
      )}

      {gameState && (
        <>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Your Hole Cards</ThemedText>
            <View style={styles.holeCardsContainer}>
              {gameState.holeCards && gameState.holeCards.length > 0 ? (
                gameState.holeCards.map((card, index) => (
                  <View key={index} style={styles.card}>
                    <ThemedText style={styles.cardText}>{formatCard(card)}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>No cards yet</ThemedText>
              )}
            </View>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Players</ThemedText>
            {gameState.players.map((player) => (
              <View key={player.seatIndex} style={styles.playerItem}>
                <ThemedText style={styles.playerText}>
                  Seat {player.seatIndex} - Stack: {player.stack} - Bet:{' '}
                  {player.currentBet}
                </ThemedText>
                <ThemedText style={styles.statusBadge}>{player.status}</ThemedText>
              </View>
            ))}
          </ThemedView>

          {isMyTurn && gameState.availableActions && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Your Turn - Choose an Action</ThemedText>
              {gameState.amountToCall !== null && gameState.amountToCall > 0 && (
                <ThemedText style={styles.infoText}>
                  Amount to call: {gameState.amountToCall}
                </ThemedText>
              )}
              <View style={styles.actionsGrid}>
                {gameState.availableActions.includes('fold') && (
                  <View style={styles.actionButton}>
                    <Button
                      title="Fold"
                      onPress={() => takeAction('fold')}
                      color="#F44336"
                    />
                  </View>
                )}
                {gameState.availableActions.includes('check') && (
                  <View style={styles.actionButton}>
                    <Button
                      title="Check"
                      onPress={() => takeAction('check')}
                      color="#2196F3"
                    />
                  </View>
                )}
                {gameState.availableActions.includes('call') && (
                  <View style={styles.actionButton}>
                    <Button
                      title="Call"
                      onPress={() => takeAction('call')}
                      color="#FF9800"
                    />
                  </View>
                )}
                {gameState.availableActions.includes('bet') && gameState.chipRange && (
                  <View style={styles.actionButton}>
                    <Button
                      title={`Bet ${gameState.chipRange.min}`}
                      onPress={() => takeAction('bet', gameState.chipRange!.min)}
                      color="#673AB7"
                    />
                  </View>
                )}
                {gameState.availableActions.includes('raise') && gameState.chipRange && (
                  <View style={styles.actionButton}>
                    <Button
                      title={`Raise ${gameState.chipRange.min}`}
                      onPress={() => takeAction('raise', gameState.chipRange!.min)}
                      color="#E91E63"
                    />
                  </View>
                )}
              </View>
            </ThemedView>
          )}

          {!isMyTurn && gameState.playerToAct !== null && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.waitingText}>
                Waiting for Seat {gameState.playerToAct} to act...
              </ThemedText>
            </ThemedView>
          )}
        </>
      )}

      <ThemedView style={styles.actionsContainer}>
        <Button title="Leave Game" onPress={handleLeaveGame} color="#F44336" />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  gameInfoContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  playerNameText: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
    gap: 10,
  },
  holeCardsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 4,
  },
  playerText: {
    fontSize: 14,
  },
  statusBadge: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  infoText: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: '#ff9800',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
