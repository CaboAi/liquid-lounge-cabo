import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  useCall,
  useSubscription,
  useScenario,
  useUser,
} from '../stores';
import { colors, spacing, typography } from '../theme';
import { Scenario, CALLER_ICONS } from '@bailout/shared/types/scenario.types';

interface HomeScreenProps {
  navigation: any; // TODO: Type this with proper navigation type
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useUser();
  const {
    triggerCall,
    isTriggering,
    activeCall,
    error: callError,
    clearError: clearCallError
  } = useCall();

  const {
    currentTier,
    callsRemaining,
    canMakeCall,
    isUnlimited,
    loadSubscription,
    consumeCall,
  } = useSubscription();

  const {
    loadScenarios,
    markAsUsed,
    getScenarioById,
    isLoading: scenariosLoading,
  } = useScenario();

  const recentScenarios = useScenario().recentlyUsed
    .map(id => getScenarioById(id))
    .filter((scenario): scenario is Scenario => scenario !== undefined)
    .slice(0, 4);

  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadSubscription();
    loadScenarios();
  }, []);

  // Show error toast
  useEffect(() => {
    if (callError) {
      Toast.show({
        type: 'error',
        text1: 'Call Failed',
        text2: callError,
        onHide: clearCallError,
      });
    }
  }, [callError]);

  const handleEmergencyCall = async () => {
    if (!canMakeCall) {
      Alert.alert(
        'No Calls Remaining',
        'You have no calls remaining this month. Upgrade to continue using BailOut.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    // Haptic feedback
    Vibration.vibrate(100);

    try {
      // Use first scenario as default emergency scenario
      const defaultScenario = 'scenario_1'; // Emergency - Family Issue

      const result = await triggerCall({
        scenarioId: defaultScenario,
        timing: 'immediate',
      });

      if (result.success) {
        markAsUsed(defaultScenario);
        consumeCall();

        Toast.show({
          type: 'success',
          text1: 'Emergency Call Triggered!',
          text2: 'You should receive a call shortly.',
        });
      }
    } catch (error) {
      console.error('Emergency call failed:', error);
    }
  };

  const handleQuickCall = async (delayMinutes: number) => {
    if (!canMakeCall) {
      Alert.alert(
        'No Calls Remaining',
        'You have no calls remaining this month. Upgrade to continue using BailOut.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    try {
      const defaultScenario = 'scenario_1';

      const result = await triggerCall({
        scenarioId: defaultScenario,
        timing: 'timed',
        delayMinutes,
      });

      if (result.success) {
        markAsUsed(defaultScenario);
        consumeCall();

        Toast.show({
          type: 'success',
          text1: 'Call Scheduled',
          text2: `You'll receive a call in ${delayMinutes} minutes.`,
        });
      }
    } catch (error) {
      console.error('Quick call failed:', error);
    }
  };

  const handleScenarioPress = (scenario: Scenario) => {
    navigation.navigate('ScenarioDetails', { scenarioId: scenario.id });
  };

  const renderRecentScenario = ({ item: scenario }: { item: Scenario }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: spacing.radius.md,
        padding: spacing.md,
        marginRight: spacing.sm,
        width: 140,
        minHeight: 100,
      }}
      onPress={() => handleScenarioPress(scenario)}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>
        {CALLER_ICONS[scenario.callerType]}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.fontSize.subhead,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.xs,
        }}
        numberOfLines={2}
      >
        {scenario.title}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.caption1,
        }}
        numberOfLines={2}
      >
        {scenario.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.container.padding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.title1,
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing.xs,
            }}
          >
            Hi {user?.name || 'there'}! 👋
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.body,
            }}
          >
            Need to escape? We've got you covered.
          </Text>
        </View>

        {/* Active Call Banner */}
        {activeCall && (
          <View
            style={{
              backgroundColor: colors.warning,
              borderRadius: spacing.radius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                color: colors.textInverse,
                fontSize: typography.fontSize.headline,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.xs,
              }}
            >
              🔄 Call in Progress
            </Text>
            <Text
              style={{
                color: colors.textInverse,
                fontSize: typography.fontSize.body,
              }}
            >
              Your bailout call is currently active.
            </Text>
          </View>
        )}

        {/* Emergency Button */}
        <View style={{ marginBottom: spacing.xl }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: spacing.radius.lg,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xl,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 80,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleEmergencyCall}
            disabled={isTriggering || !canMakeCall}
            activeOpacity={0.8}
          >
            {isTriggering ? (
              <ActivityIndicator color={colors.text} size="large" />
            ) : (
              <>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.title2,
                    fontWeight: typography.fontWeight.bold,
                    textAlign: 'center',
                  }}
                >
                  🚨 BAIL ME OUT NOW
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.subhead,
                    marginTop: spacing.xs,
                    opacity: 0.9,
                  }}
                >
                  Emergency escape call
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Trigger Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: spacing.radius.md,
            padding: spacing.md,
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.headline,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Quick Escape
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.secondary,
                borderRadius: spacing.radius.sm,
                paddingVertical: spacing.sm,
                alignItems: 'center',
              }}
              onPress={() => handleQuickCall(5)}
              disabled={isTriggering || !canMakeCall}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                5 min
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.secondary,
                borderRadius: spacing.radius.sm,
                paddingVertical: spacing.sm,
                alignItems: 'center',
              }}
              onPress={() => handleQuickCall(10)}
              disabled={isTriggering || !canMakeCall}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                10 min
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ScenarioSelector')}
          >
            <Text
              style={{
                color: colors.link,
                fontSize: typography.fontSize.body,
                textAlign: 'center',
              }}
            >
              Schedule for later →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recently Used Scenarios */}
        {recentScenarios.length > 0 && (
          <View style={{ marginBottom: spacing.xl }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.headline,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Recently Used
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ScenarioSelector')}
              >
                <Text
                  style={{
                    color: colors.link,
                    fontSize: typography.fontSize.body,
                  }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={recentScenarios}
              renderItem={renderRecentScenario}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing.md }}
            />
          </View>
        )}

        {/* Subscription Status Banner */}
        {currentTier === 'free' && showUpgradeBanner && (
          <View
            style={{
              backgroundColor: colors.surfaceSecondary,
              borderRadius: spacing.radius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: spacing.xs,
                right: spacing.xs,
                padding: spacing.xs,
              }}
              onPress={() => setShowUpgradeBanner(false)}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>×</Text>
            </TouchableOpacity>

            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs,
                marginRight: spacing.lg,
              }}
            >
              {isUnlimited ? '∞' : callsRemaining} calls remaining this month
            </Text>

            {!isUnlimited && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.secondary,
                  borderRadius: spacing.radius.sm,
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  alignSelf: 'flex-start',
                }}
                onPress={() => navigation.navigate('Subscription')}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.caption1,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Upgrade
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State for Recent Scenarios */}
        {recentScenarios.length === 0 && !scenariosLoading && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.radius.md,
              padding: spacing.xl,
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>📱</Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.headline,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.xs,
                textAlign: 'center',
              }}
            >
              Ready for Your First Bailout?
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
                textAlign: 'center',
                marginBottom: spacing.md,
              }}
            >
              Browse scenarios to get started, or hit the emergency button for an instant escape call.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.secondary,
                borderRadius: spacing.radius.sm,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
              onPress={() => navigation.navigate('ScenarioSelector')}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Browse Scenarios
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
};

export default HomeScreen;