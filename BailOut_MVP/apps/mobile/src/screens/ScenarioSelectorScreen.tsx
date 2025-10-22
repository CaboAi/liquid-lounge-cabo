import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  useScenario,
  useCall,
  useSubscription,
} from '../stores';
import { colors, spacing, typography } from '../theme';
import { Scenario, CALLER_ICONS } from '@bailout/shared/types/scenario.types';

interface ScenarioSelectorScreenProps {
  navigation: any;
}

const ScenarioSelectorScreen: React.FC<ScenarioSelectorScreenProps> = ({ navigation }) => {
  const {
    scenarios,
    searchQuery,
    activeFilter,
    isLoading,
    error,
    loadScenarios,
    searchScenarios,
    setActiveFilter,
    toggleFavorite,
    markAsUsed,
    clearError,
    filteredScenarios,
  } = useScenario();

  const {
    triggerCall,
    isTriggering,
    clearError: clearCallError,
  } = useCall();

  const {
    canMakeCall,
    consumeCall,
  } = useSubscription();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load scenarios on mount
  useEffect(() => {
    loadScenarios();
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        onHide: clearError,
      });
    }
  }, [error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScenarios();
    setRefreshing(false);
  };

  const handleScenarioPress = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setShowDetailsModal(true);
  };

  const handleUseNow = async (scenario: Scenario) => {
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

    setShowDetailsModal(false);

    try {
      const result = await triggerCall({
        scenarioId: scenario.id,
        timing: 'immediate',
      });

      if (result.success) {
        markAsUsed(scenario.id);
        consumeCall();

        Toast.show({
          type: 'success',
          text1: 'Call Triggered!',
          text2: 'You should receive a call shortly.',
        });

        // Navigate back to home
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Failed to trigger call:', error);
    }
  };

  const handleToggleFavorite = (scenario: Scenario) => {
    toggleFavorite(scenario.id);
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'recent', label: 'Recent' },
    { key: 'favorites', label: 'Favorites' },
  ] as const;

  const groupedScenarios = useMemo(() => {
    if (activeFilter === 'all' && !searchQuery) {
      // Group by caller type for "All" filter
      const groups = filteredScenarios.reduce((acc, scenario) => {
        if (!acc[scenario.callerType]) {
          acc[scenario.callerType] = [];
        }
        acc[scenario.callerType].push(scenario);
        return acc;
      }, {} as Record<string, Scenario[]>);

      return Object.entries(groups).map(([callerType, scenarios]) => ({
        title: callerType.charAt(0).toUpperCase() + callerType.slice(1),
        icon: CALLER_ICONS[callerType as keyof typeof CALLER_ICONS],
        data: scenarios,
      }));
    }

    // For other filters or search, return flat list
    return [{
      title: '',
      icon: '',
      data: filteredScenarios,
    }];
  }, [filteredScenarios, activeFilter, searchQuery]);

  const renderScenarioCard = ({ item: scenario }: { item: Scenario }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: spacing.radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => handleScenarioPress(scenario)}
      activeOpacity={0.7}
    >
      <View style={{ marginRight: spacing.md }}>
        <Text style={{ fontSize: 32 }}>
          {CALLER_ICONS[scenario.callerType]}
        </Text>
      </View>

      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSize.headline,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.xs,
          }}
          numberOfLines={1}
        >
          {scenario.title}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.body,
            lineHeight: typography.lineHeight.normal * typography.fontSize.body,
          }}
          numberOfLines={2}
        >
          {scenario.description}
        </Text>
        {scenario.usageCount > 0 && (
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: typography.fontSize.caption1,
              marginTop: spacing.xs,
            }}
          >
            Used {scenario.usageCount} times
          </Text>
        )}
      </View>

      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <TouchableOpacity
          onPress={() => handleToggleFavorite(scenario)}
          style={{ padding: spacing.xs }}
        >
          <Text style={{ fontSize: 20 }}>
            {scenario.isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: spacing.radius.sm,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            minWidth: 60,
            alignItems: 'center',
          }}
          onPress={() => handleUseNow(scenario)}
          disabled={isTriggering || !canMakeCall}
        >
          {isTriggering ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.caption1,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Use Now
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string; icon: string } }) => {
    if (!section.title) return null;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 24, marginRight: spacing.sm }}>
          {section.icon}
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSize.title3,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {section.title}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.body,
              marginTop: spacing.md,
            }}
          >
            Loading scenarios...
          </Text>
        </View>
      );
    }

    const emptyMessages = {
      all: {
        icon: '📱',
        title: 'No scenarios available',
        subtitle: 'Check your connection and try again.',
      },
      recent: {
        icon: '🕒',
        title: 'No recent scenarios',
        subtitle: 'Use some scenarios and they\'ll appear here.',
      },
      favorites: {
        icon: '⭐',
        title: 'No favorite scenarios',
        subtitle: 'Tap the star on scenarios to add them to favorites.',
      },
    };

    const message = emptyMessages[activeFilter];

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <Text style={{ fontSize: 64, marginBottom: spacing.lg }}>
          {message.icon}
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSize.title3,
            fontWeight: typography.fontWeight.semibold,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}
        >
          {message.title}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.body,
            textAlign: 'center',
          }}
        >
          {message.subtitle}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing.container.padding,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSize.title2,
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.md,
          }}
        >
          Choose Your Scenario
        </Text>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: spacing.radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <TextInput
            style={{
              color: colors.text,
              fontSize: typography.fontSize.body,
              padding: 0,
            }}
            placeholder="Search scenarios..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={searchScenarios}
          />
        </View>

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={{
                flex: 1,
                backgroundColor: activeFilter === filter.key ? colors.primary : colors.surface,
                borderRadius: spacing.radius.sm,
                paddingVertical: spacing.sm,
                alignItems: 'center',
              }}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  fontWeight: activeFilter === filter.key
                    ? typography.fontWeight.semibold
                    : typography.fontWeight.regular,
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scenarios List */}
      <View style={{ flex: 1 }}>
        {filteredScenarios.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={groupedScenarios}
            renderItem={({ item: section }) => (
              <View>
                {renderSectionHeader({ section })}
                <FlatList
                  data={section.data}
                  renderItem={renderScenarioCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={{
                    paddingHorizontal: spacing.container.padding,
                  }}
                />
              </View>
            )}
            keyExtractor={(item, index) => `section-${index}`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          right: spacing.xl,
          backgroundColor: colors.secondary,
          borderRadius: 28,
          width: 56,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => navigation.navigate('CreateScenario')}
      >
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
          +
        </Text>
      </TouchableOpacity>

      {/* Scenario Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {selectedScenario && (
            <View style={{ flex: 1, padding: spacing.container.padding }}>
              {/* Modal Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.xl,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowDetailsModal(false)}
                  style={{ padding: spacing.sm }}
                >
                  <Text style={{ color: colors.link, fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>

                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.headline,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Scenario Details
                </Text>

                <TouchableOpacity
                  onPress={() => handleToggleFavorite(selectedScenario)}
                  style={{ padding: spacing.sm }}
                >
                  <Text style={{ fontSize: 20 }}>
                    {selectedScenario.isFavorite ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Scenario Content */}
              <View style={{ flex: 1 }}>
                <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
                  <Text style={{ fontSize: 64, marginBottom: spacing.md }}>
                    {CALLER_ICONS[selectedScenario.callerType]}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.fontSize.title2,
                      fontWeight: typography.fontWeight.bold,
                      textAlign: 'center',
                      marginBottom: spacing.sm,
                    }}
                  >
                    {selectedScenario.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.body,
                      textAlign: 'center',
                      lineHeight: typography.lineHeight.relaxed * typography.fontSize.body,
                    }}
                  >
                    {selectedScenario.description}
                  </Text>
                </View>

                {selectedScenario.customMessage && (
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
                        fontSize: typography.fontSize.subhead,
                        fontWeight: typography.fontWeight.semibold,
                        marginBottom: spacing.sm,
                      }}
                    >
                      Call Script:
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.body,
                        lineHeight: typography.lineHeight.relaxed * typography.fontSize.body,
                        fontStyle: 'italic',
                      }}
                    >
                      "{selectedScenario.customMessage}"
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }} />

                {/* Action Buttons */}
                <View style={{ gap: spacing.md }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: spacing.radius.md,
                      paddingVertical: spacing.md,
                      alignItems: 'center',
                    }}
                    onPress={() => handleUseNow(selectedScenario)}
                    disabled={isTriggering || !canMakeCall}
                  >
                    {isTriggering ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: typography.fontSize.button,
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      >
                        Use Now
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: spacing.radius.md,
                      paddingVertical: spacing.md,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowDetailsModal(false);
                      navigation.navigate('ScheduleCall', { scenarioId: selectedScenario.id });
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: typography.fontSize.button,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Schedule for Later
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

export default ScenarioSelectorScreen;