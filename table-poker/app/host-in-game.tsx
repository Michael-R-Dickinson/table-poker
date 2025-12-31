import { HostCard } from '@/components/host-card';
import { HostCardBack } from '@/components/host-card-back';
import { RecentActions } from '@/components/recent-actions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHostGameplay } from '@/hooks/host/use-host-gameplay';
import { useWebRTCHost } from '@/hooks/host/use-webrtc-host';
import { useSignalingConnection } from '@/hooks/shared/use-signaling-connection';
import { pokerGameAtom } from '@/store/poker-game';
import { createGameControl } from '@/utils/host/game-control';
import {
  calculateCurrentBet,
  calculatePotSize,
  mapCard,
} from '@/utils/poker-utils/poker-utils';
import { logger } from '@/utils/shared/logger';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useAtom } from 'jotai';
import { Table } from 'poker-ts';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
export default function HostInGameScreen() {
  const params = useLocalSearchParams();
  const { smallBlind, bigBlind, buyIn } = params;
  const { height } = useWindowDimensions();

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

  const {
    startGame,
    handlePlayerAction,
    gameStarted,
    lastCommunityCards,
    handEndWinners,
    startNextHand,
    actionHistory,
  } = useHostGameplay({
    pokerGame,
    gameControl,
    connectedPlayers,
    sendToPlayer,
    broadcastToPlayers,
    buyIn: Number(buyIn),
  });

  // Lock to landscape orientation
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      };
    }, []),
  );

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
  }, [smallBlind, bigBlind, buyIn, setPokerGame]);

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

  const handleBackPress = () => {
    Alert.alert(
      'End Game',
      'Are you sure you want to exit? This will end the game and kick all players.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Game',
          style: 'destructive',
          onPress: handleEndGame,
        },
      ],
      { cancelable: true },
    );
  };

  const communityCards = useMemo(() => {
    if (!pokerGame.table) {
      return [];
    }

    if (!pokerGame.table.isHandInProgress()) {
      // Hand ended - show last community cards
      logger.debug('Short circuiting community cards - using last community cards');
      return lastCommunityCards;
    }

    const cards = pokerGame.table.communityCards();
    logger.debug('Computing community cards from table', {
      version: pokerGame.version,
      cardsLength: cards.length,
      cards: cards,
    });
    return cards;
  }, [pokerGame, lastCommunityCards]);

  const potSize = calculatePotSize(pokerGame.table);
  const currentBet = calculateCurrentBet(pokerGame.table);

  // Prepare community cards for display (max 5, fill with card backs)
  const displayCards = useMemo(() => {
    const mapped = communityCards.map(mapCard).filter(Boolean);
    const remaining = 5 - mapped.length;
    return [...mapped, ...Array(remaining).fill(null)];
  }, [communityCards]);

  // Show 1 previous action on smaller screens, 2 on larger screens (based on height since we're in landscape)
  const hasSpaceForTwoActions = height >= 600;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        {/* Top info row (rotated 180deg) */}
        <View style={styles.topInfoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <ThemedText
                style={styles.labelText}
                lightColor="#fcd34d"
                darkColor="#fcd34d"
              >
                POT
              </ThemedText>
              <ThemedText style={styles.valueText}>
                ${potSize.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionCardCenter}>
            <View style={styles.actionCardContent}>
              <ThemedText
                style={styles.actionLabelText}
                lightColor="#93c5fd"
                darkColor="#93c5fd"
              >
                ACTION
              </ThemedText>
              <RecentActions
                actionHistory={actionHistory}
                hasSpaceForTwoActions={hasSpaceForTwoActions}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <ThemedText
                style={styles.labelText}
                lightColor="#6ee7b7"
                darkColor="#6ee7b7"
              >
                TO CALL
              </ThemedText>
              <ThemedText style={styles.valueText}>
                ${currentBet.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Community cards */}
        <View style={styles.communityCardsContainer}>
          {displayCards.map((card, index) =>
            card ? (
              <HostCard key={index} suit={card.suit} value={card.value} />
            ) : (
              <HostCardBack key={index} />
            ),
          )}
        </View>

        {/* Bottom info row */}
        <View style={styles.bottomInfoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <ThemedText
                style={styles.labelText}
                lightColor="#fcd34d"
                darkColor="#fcd34d"
              >
                POT
              </ThemedText>
              <ThemedText style={styles.valueText}>
                ${potSize.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionCardCenter}>
            <View style={styles.actionCardContent}>
              <ThemedText
                style={styles.actionLabelText}
                lightColor="#93c5fd"
                darkColor="#93c5fd"
              >
                ACTION
              </ThemedText>
              <RecentActions
                actionHistory={actionHistory}
                hasSpaceForTwoActions={hasSpaceForTwoActions}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <ThemedText
                style={styles.labelText}
                lightColor="#6ee7b7"
                darkColor="#6ee7b7"
              >
                TO CALL
              </ThemedText>
              <ThemedText style={styles.valueText}>
                ${currentBet.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Winner overlay */}
      {handEndWinners && handEndWinners.length > 0 && (
        <TouchableOpacity
          style={styles.winnerOverlay}
          activeOpacity={1}
          onPress={startNextHand}
        >
          <ThemedView style={styles.winnerSection}>
            {handEndWinners.map((winner) => (
              <ThemedView key={winner.seatIndex} style={styles.winnerItem}>
                <ThemedText style={styles.winnerText}>
                  {winner.playerName} won {winner.amount} chips
                </ThemedText>
              </ThemedView>
            ))}
            <ThemedText style={styles.tapToNextHandText}>
              tap to deal next hand
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0D12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    alignItems: 'center',
    gap: 24,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    maxWidth: 768,
    width: '100%',
    transform: [{ rotate: '180deg' }],
  },
  bottomInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    maxWidth: 768,
    width: '100%',
  },
  infoCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 120,
  },
  infoContent: {
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionCardCenter: {
    flex: 1,
  },
  actionCardContent: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  actionLabelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  communityCardsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  winnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    zIndex: 5,
  },
  winnerSection: {
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    gap: 10,
    maxWidth: 500,
    width: '90%',
  },
  winnerItem: {
    padding: 10,
    backgroundColor: '#c8e6c9',
    borderRadius: 8,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1b5e20',
  },
  tapToNextHandText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#2e7d32',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
