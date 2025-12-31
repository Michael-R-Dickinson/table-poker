import { ThemedText } from '@/components/themed-text';
import type { PlayerActionInfo } from '@/utils/poker-utils/poker-utils';
import { formatPlayerAction } from '@/utils/poker-utils/poker-utils';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface RecentActionsProps {
  actionHistory: PlayerActionInfo[];
  hasSpaceForTwoActions: boolean;
}

export function RecentActions({
  actionHistory,
  hasSpaceForTwoActions,
}: RecentActionsProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Format actions for display
  const formattedActions = useMemo(
    () => actionHistory.map(formatPlayerAction),
    [actionHistory],
  );

  const mostRecentAction = formattedActions[0] || 'Waiting...';
  const previousActions = formattedActions.slice(1, hasSpaceForTwoActions ? 3 : 2);

  // Animate when new action arrives
  useEffect(() => {
    if (actionHistory.length === 0) return;

    // Reset opacity to 0
    fadeAnim.setValue(0);

    // Fade in the new action
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [actionHistory.length, fadeAnim]);

  return (
    <View style={styles.actionHistory}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ThemedText style={styles.recentActionText}>{mostRecentAction}</ThemedText>
      </Animated.View>
      {previousActions.map((action, index) => {
        const opacity = 0.8 - index * 0.15;
        const fontSize = index === 0 ? 18 : index === 1 ? 16 : 14;
        return (
          <ThemedText
            key={index}
            style={[styles.previousActionText, { opacity, fontSize }]}
          >
            {action}
          </ThemedText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  actionHistory: {
    alignItems: 'center',
    gap: 4,
  },
  recentActionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
  },
  previousActionText: {
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});
