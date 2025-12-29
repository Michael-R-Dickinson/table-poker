import { StyleSheet, View, Button, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { useWebRTCHost } from '@/hooks/host/use-webrtc-host';
import { useLocalSearchParams, router } from 'expo-router';
import { logger } from '@/utils/shared/logger';
import { useAtom } from 'jotai';
import { pokerGameAtom } from '@/store/poker-game';
import { Table } from 'poker-ts';
import { useEffect, useMemo } from 'react';
import { createGameControl } from '@/utils/host/game-control';
import { useHostGameplay } from '@/hooks/host/use-host-gameplay';

export default function HostInGameScreen() {
  const params = useLocalSearchParams();
  const { gameCode, smallBlind, bigBlind, buyIn } = params;

  const [pokerGame, setPokerGame] = useAtom(pokerGameAtom);

  const gameControl = useMemo(
    () => createGameControl(pokerGame, setPokerGame),
    [pokerGame, setPokerGame],
  );

  // Reuse existing signaling connection (already established in host screen)
  const { sendMessage } = useSignalingConnection({
    onMessage: (message) => {
      handleSignalingMessage(message);
    },
  });

  // Reuse existing WebRTC connections (already established in host screen)
  const {
    connectedPlayers,
    handleSignalingMessage,
    broadcastToPlayers,
    sendToPlayer,
    cleanup: cleanupWebRTC,
  } = useWebRTCHost({
    sendSignalingMessage: sendMessage,
    onPlayerConnected: (playerId) => {
      logger.info(`Player connected in-game: ${playerId}`);
    },
    onPlayerDisconnected: (playerId) => {
      logger.info(`Player disconnected in-game: ${playerId}`);
    },
    onDataChannelMessage: (playerId, data) => {
      handlePlayerAction(playerId, data);
    },
  });

  const { startGame, handlePlayerAction, gameStarted } = useHostGameplay({
    pokerGame,
    gameControl,
    connectedPlayers,
    sendToPlayer,
    broadcastToPlayers,
    buyIn: Number(buyIn),
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

  // Auto-start game when table is ready and we have players
  useEffect(() => {
    if (pokerGame.table && connectedPlayers.length >= 2 && !gameStarted) {
      logger.info('Auto-starting game');
      startGame();
    }
  }, [pokerGame.table, connectedPlayers.length, gameStarted, startGame]);

  const handleEndGame = () => {
    broadcastToPlayers({
      type: 'game_end',
    });
    cleanupWebRTC();
    router.back();
  };

  const handleLogGameState = () => {
    if (!pokerGame.table) {
      logger.warn('No poker table initialized');
      return;
    }

    const table = pokerGame.table;

    const bettingRoundInProgress =
      table.isHandInProgress() && table.isBettingRoundInProgress();

    logger.info('Table state:', {
      // isHandInProgress: table.isHandInProgress(),
      // isBettingRoundInProgress: bettingRoundInProgress,
      // seats: table.seats(),
      communityCards: table.communityCards(),
      version: pokerGame.version,
    });
  };

  useEffect(() => {
    logger.debug('CHANGE IN VERSION DETECTED', { version: pokerGame.version });
    // consider just making it pokerGame?
  }, [pokerGame.version]);

  const communityCards = useMemo(() => {
    if (!pokerGame.table || !pokerGame.table.isHandInProgress()) {
      logger.debug('Short circuiting community cards - no hand in progress');
      return [];
    }
    const cards = pokerGame.table.communityCards();
    logger.debug('Computing community cards from table', {
      version: pokerGame.version,
      cardsLength: cards.length,
      cards: cards,
    });
    return cards;
  }, [pokerGame]);
  logger.debug('Rendering HostInGameScreen', {
    communityCards,
    version: pokerGame.version,
  });

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
        <ThemedText type="subtitle">Community Cards</ThemedText>
        <View style={styles.communityCardsContainer}>
          {communityCards.length === 0 ? (
            <ThemedText style={styles.emptyText}>No community cards yet</ThemedText>
          ) : (
            communityCards.map((card, index) => (
              <View key={index} style={styles.card}>
                <ThemedText style={styles.cardText}>{formatCard(card)}</ThemedText>
              </View>
            ))
          )}
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
  communityCardsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
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
});
