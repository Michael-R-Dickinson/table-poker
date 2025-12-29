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

  const otherPlayers = useMemo(() => {
    if (!gameState) return [];
    return gameState.players.filter((p) => p.seatIndex !== gameState.mySeatIndex);
  }, [gameState]);

  const myPlayerInfo = useMemo(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.seatIndex === gameState.mySeatIndex);
  }, [gameState]);

  const isMyTurn = useMemo(() => {
    if (!gameState) return false;
    return gameState.playerToAct !== null && gameState.availableActions !== null;
  }, [gameState]);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.topBar}>
        <View style={styles.infoBlock}>
          <ThemedText style={styles.infoBlockLabel}>Game</ThemedText>
          <ThemedText style={styles.infoBlockValue}>{gameCode}</ThemedText>
        </View>
        <View style={styles.infoBlock}>
          <ThemedText style={styles.infoBlockLabel}>Player</ThemedText>
          <ThemedText style={styles.infoBlockValue}>{playerName}</ThemedText>
        </View>
        <View style={styles.infoBlock}>
          <ThemedText style={styles.infoBlockLabel}>Status</ThemedText>
          <ThemedText
            style={[
              styles.infoBlockValue,
              { color: connectionState === 'connected' ? '#4CAF50' : '#FF9800' },
            ]}
          >
            {connectionState === 'connected' ? 'Connected' : 'Connecting...'}
          </ThemedText>
        </View>
      </ThemedView>

      {!gameState && (
        <ThemedView style={styles.statusContainer}>
          <ThemedText style={styles.statusText}>Waiting for game to start...</ThemedText>
        </ThemedView>
      )}

      {gameState && (
        <>
          {otherPlayers.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Other Players</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.otherPlayersContainer}>
                  {otherPlayers.map((player) => (
                    <View key={player.seatIndex} style={styles.playerCard}>
                      <ThemedText style={styles.playerCardName}>
                        Seat {player.seatIndex}
                      </ThemedText>
                      <ThemedText style={styles.playerCardStat}>
                        Stack: {player.stack}
                      </ThemedText>
                      <ThemedText style={styles.playerCardStat}>
                        Bet: {player.currentBet}
                      </ThemedText>
                      <View style={styles.playerCardStatusContainer}>
                        <ThemedText style={styles.playerCardStatus}>
                          {player.status}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </ThemedView>
          )}

          {myPlayerInfo && (
            <ThemedView style={styles.myStatsBar}>
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>Stack</ThemedText>
                <ThemedText style={styles.statValue}>{myPlayerInfo.stack}</ThemedText>
              </View>
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>Current Bet</ThemedText>
                <ThemedText style={styles.statValue}>
                  {myPlayerInfo.currentBet}
                </ThemedText>
              </View>
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>Status</ThemedText>
                <ThemedText
                  style={[
                    styles.statValue,
                    styles.statusBadge,
                    myPlayerInfo.status === 'folded' && styles.statusFolded,
                    myPlayerInfo.status === 'active' && styles.statusActive,
                  ]}
                >
                  {myPlayerInfo.status}
                </ThemedText>
              </View>
            </ThemedView>
          )}

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
  topBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  infoBlockLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBlockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  myStatsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBlock: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  statusActive: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  statusFolded: {
    backgroundColor: '#F44336',
    color: '#fff',
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
  otherPlayersContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: 110,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 6,
  },
  playerCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerCardStat: {
    fontSize: 12,
    color: '#333',
  },
  playerCardStatusContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  playerCardStatus: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    textAlign: 'center',
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
