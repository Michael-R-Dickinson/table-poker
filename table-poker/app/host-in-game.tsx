import { StyleSheet, View, Button, FlatList, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/use-signaling-connection';
import { useWebRTCHost } from '@/hooks/use-webrtc-host';
import { useLocalSearchParams, router } from 'expo-router';
import { logger } from '@/utils/logger';
import { useAtom } from 'jotai';
import { pokerGameAtom } from '@/store/poker-game';
import { Table } from 'poker-ts';
import { useEffect, useMemo } from 'react';
import { extractPlayerGameState } from '@/utils/game-state';
import { createGameControl } from '@/utils/game-control';

export default function HostInGameScreen() {
  const params = useLocalSearchParams();
  const { gameCode, smallBlind, bigBlind, buyIn } = params;

  const [pokerGame, setPokerGame] = useAtom(pokerGameAtom);

  const { sendMessage } = useSignalingConnection({
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

  useEffect(() => {
    // Initialize poker table when component mounts
    const table = new Table({
      smallBlind: Number(smallBlind),
      bigBlind: Number(bigBlind),
    });

    setPokerGame({
      table,
      version: 0,
    });

    logger.info('Poker table initialized', {
      smallBlind,
      bigBlind,
      buyIn,
    });
  }, [smallBlind, bigBlind, buyIn]);

  const handleEndGame = () => {
    broadcastToPlayers({
      type: 'game_end',
    });
    cleanupWebRTC();
    router.back();
  };

  const gameControl = useMemo(
    () => createGameControl(pokerGame, setPokerGame),
    [pokerGame, setPokerGame],
  );

  const handleLogGameState = () => {
    if (!pokerGame.table) {
      logger.warn('No poker table initialized');
      return;
    }

    const table = pokerGame.table;

    const bettingRoundInProgress =
      table.isHandInProgress() && table.isBettingRoundInProgress();

    logger.info('Table state:', {
      isHandInProgress: table.isHandInProgress(),
      isBettingRoundInProgress: bettingRoundInProgress,
      seats: table.seats(),
      version: pokerGame.version,
    });

    if (table.isHandInProgress()) {
      const gameState = extractPlayerGameState(table, 0);
      logger.info('Current game state for seat 0:', gameState);
    }
  };

  const handleSeatPlayers = () => {
    try {
      gameControl.seatPlayer(0, Number(buyIn));
      gameControl.seatPlayer(1, Number(buyIn));
      gameControl.seatPlayer(2, Number(buyIn));
      logger.info('Seated 3 players at seats 0, 1, 2');
    } catch (error) {
      logger.error('Failed to seat players:', error);
    }
  };

  const handleStartHand = () => {
    try {
      gameControl.startHand();
      logger.info('Hand started');
    } catch (error) {
      logger.error('Failed to start hand:', error);
    }
  };

  const handleFold = () => {
    try {
      gameControl.takeAction('fold');
      logger.info('Action taken: fold');
    } catch (error) {
      logger.error('Failed to fold:', error);
    }
  };

  const handleCheck = () => {
    try {
      gameControl.takeAction('check');
      logger.info('Action taken: check');
    } catch (error) {
      logger.error('Failed to check:', error);
    }
  };

  const handleCall = () => {
    try {
      gameControl.takeAction('call');
      logger.info('Action taken: call');
    } catch (error) {
      logger.error('Failed to call:', error);
    }
  };

  const handleBet = () => {
    try {
      const betSize = Number(bigBlind);
      gameControl.takeAction('bet', betSize);
      logger.info('Action taken: bet', betSize);
    } catch (error) {
      logger.error('Failed to bet:', error);
    }
  };

  const handleRaise = () => {
    try {
      const raiseSize = Number(bigBlind) * 2;
      gameControl.takeAction('raise', raiseSize);
      logger.info('Action taken: raise', raiseSize);
    } catch (error) {
      logger.error('Failed to raise:', error);
    }
  };

  const handleEndBettingRound = () => {
    try {
      gameControl.endBettingRound();
      logger.info('Betting round ended');
    } catch (error) {
      logger.error('Failed to end betting round:', error);
    }
  };

  const handleShowdown = () => {
    try {
      gameControl.performShowdown();
      logger.info('Showdown performed');
    } catch (error) {
      logger.error('Failed to perform showdown:', error);
    }
  };

  const legalActions = useMemo(() => {
    if (
      !pokerGame.table ||
      !pokerGame.table.isHandInProgress() ||
      !pokerGame.table.isBettingRoundInProgress()
    ) {
      return [];
    }
    return pokerGame.table.legalActions().actions;
  }, [pokerGame]);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Game In Progress</ThemedText>
      </ThemedView>

      <ThemedView style={styles.gameInfoContainer}>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Game Code:</ThemedText>
          <ThemedText style={styles.infoValue}>{gameCode}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Small Blind:</ThemedText>
          <ThemedText style={styles.infoValue}>{smallBlind}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Big Blind:</ThemedText>
          <ThemedText style={styles.infoValue}>{bigBlind}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Buy-In:</ThemedText>
          <ThemedText style={styles.infoValue}>{buyIn}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Game Setup</ThemedText>
        <View style={styles.buttonRow}>
          <View style={styles.button}>
            <Button title="Seat Players" onPress={handleSeatPlayers} color="#9C27B0" />
          </View>
          <View style={styles.button}>
            <Button title="Start Hand" onPress={handleStartHand} color="#4CAF50" />
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Player Actions</ThemedText>
        <View style={styles.buttonRow}>
          {legalActions.includes('fold') && (
            <View style={styles.button}>
              <Button title="Fold" onPress={handleFold} color="#F44336" />
            </View>
          )}
          {legalActions.includes('check') && (
            <View style={styles.button}>
              <Button title="Check" onPress={handleCheck} color="#2196F3" />
            </View>
          )}
          {legalActions.includes('call') && (
            <View style={styles.button}>
              <Button title="Call" onPress={handleCall} color="#FF9800" />
            </View>
          )}
        </View>
        <View style={styles.buttonRow}>
          {legalActions.includes('bet') && (
            <View style={styles.button}>
              <Button title="Bet" onPress={handleBet} color="#673AB7" />
            </View>
          )}
          {legalActions.includes('raise') && (
            <View style={styles.button}>
              <Button title="Raise" onPress={handleRaise} color="#E91E63" />
            </View>
          )}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Round Controls</ThemedText>
        <View style={styles.buttonRow}>
          <View style={styles.button}>
            <Button
              title="End Betting Round"
              onPress={handleEndBettingRound}
              color="#FF5722"
            />
          </View>
          <View style={styles.button}>
            <Button title="Showdown" onPress={handleShowdown} color="#795548" />
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Players ({connectedPlayers.length})</ThemedText>
        {connectedPlayers.length === 0 ? (
          <ThemedText style={styles.emptyText}>No players connected</ThemedText>
        ) : (
          <View>
            {connectedPlayers.map((item) => (
              <ThemedView key={item} style={styles.playerItem}>
                <View style={styles.playerDot} />
                <ThemedText>{item}</ThemedText>
              </ThemedView>
            ))}
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <View style={styles.buttonRow}>
          <View style={styles.button}>
            <Button title="Log Game State" onPress={handleLogGameState} color="#2196F3" />
          </View>
          <View style={styles.button}>
            <Button title="End Game" onPress={handleEndGame} color="#F44336" />
          </View>
        </View>
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
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  button: {
    flex: 1,
  },
});
