import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { HostCard } from '@/components/host-card';
import { HostCardBack } from '@/components/host-card-back';

export default function HostDeviceDraftScreen() {
  const potSize = 1250;
  const currentBet = 30;
  const mostRecentAction = 'Michael + $15';
  const previousActions = ['Sarah + $10', 'John calls'];

  useFocusEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  });

  const handleBackPress = () => {
    Alert.alert(
      'Exit Preview',
      'Are you sure you want to exit the host device UI preview?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
      { cancelable: true },
    );
  };

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
              <View style={styles.actionHistory}>
                <ThemedText style={styles.recentActionText}>
                  {mostRecentAction}
                </ThemedText>
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

        <View style={styles.communityCardsContainer}>
          <HostCard suit="heart" value="A" />
          <HostCard suit="spade" value="K" />
          <HostCard suit="diamond" value="Q" />
          <HostCardBack />
          <HostCardBack />
        </View>

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
              <View style={styles.actionHistory}>
                <ThemedText style={styles.recentActionText}>
                  {mostRecentAction}
                </ThemedText>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingTop: 16,
  },
  actionCardContent: {
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionLabelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  actionHistory: {
    alignItems: 'center',
    gap: 4,
  },
  recentActionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  previousActionText: {
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  communityCardsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
