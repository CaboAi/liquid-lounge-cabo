import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  SwipeableRow,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  useCall,
  useScenario,
} from '../stores';
import { colors, spacing, typography } from '../theme';
import { Call } from '@bailout/shared/types/call.types';
import { CALLER_ICONS } from '@bailout/shared/types/scenario.types';

interface CallHistoryScreenProps {
  navigation: any;
}

const CallHistoryScreen: React.FC<CallHistoryScreenProps> = ({ navigation }) => {
  const {
    callHistory,
    isLoading,
    error,
    pagination,
    loadHistory,
    deleteCall,
    clearError,
  } = useCall();

  const { getScenarioById } = useScenario();

  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'canceled' | 'failed'>('all');

  // Load history on mount
  useEffect(() => {
    if (callHistory.length === 0) {
      loadHistory();
    }
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
    await loadHistory(20, 0); // Reset pagination
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (pagination.hasMore && !loadingMore && !isLoading) {
      setLoadingMore(true);
      await loadHistory(20, pagination.offset);
      setLoadingMore(false);
    }
  };

  const handleCallPress = (call: Call) => {
    setSelectedCall(call);
    setShowDetailsModal(true);
  };

  const handleDeleteCall = async (call: Call) => {
    Alert.alert(
      'Delete Call',
      'Are you sure you want to delete this call from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCall(call.id);
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: 'Call Deleted',
                text2: 'Call removed from history',
              });
            }
          },
        },
      ]
    );
  };

  const handleUseAgain = (call: Call) => {
    setShowDetailsModal(false);

    // Navigate to scenario selector with the scenario pre-selected
    navigation.navigate('ScenarioSelector', {
      preselectedScenarioId: call.scenarioId,
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const callDate = new Date(date);
    const diffTime = now.getTime() - callDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return callDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return colors.callStatus.completed;
      case 'scheduled':
        return colors.callStatus.scheduled;
      case 'in_progress':
        return colors.callStatus.in_progress;
      case 'canceled':
        return colors.callStatus.canceled;
      case 'failed':
        return colors.callStatus.failed;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'scheduled':
        return 'Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'canceled':
        return 'Canceled';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const filteredHistory = useMemo(() => {
    if (statusFilter === 'all') {
      return callHistory;
    }
    return callHistory.filter(call => call.status === statusFilter);
  }, [callHistory, statusFilter]);

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'canceled', label: 'Canceled' },
  ] as const;

  const renderCallItem = ({ item: call }: { item: Call }) => {
    const scenario = getScenarioById(call.scenarioId);
    const callerIcon = scenario ? CALLER_ICONS[scenario.callerType] : '📞';

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          marginBottom: spacing.sm,
          borderRadius: spacing.radius.md,
          overflow: 'hidden',
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
          }}
          onPress={() => handleCallPress(call)}
          activeOpacity={0.7}
        >
          {/* Caller Icon */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}
          >
            <Text style={{ fontSize: 24 }}>{callerIcon}</Text>
          </View>

          {/* Call Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.headline,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.xs,
              }}
              numberOfLines={1}
            >
              {scenario?.title || 'Unknown Scenario'}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
                marginBottom: spacing.xs,
              }}
            >
              {formatDate(call.triggeredAt)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  backgroundColor: getStatusColor(call.status),
                  borderRadius: spacing.radius.xs,
                  paddingHorizontal: spacing.xs,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: call.status === 'canceled' ? colors.textSecondary : colors.text,
                    fontSize: typography.fontSize.caption1,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {getStatusText(call.status)}
                </Text>
              </View>
              {call.duration && (
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: typography.fontSize.caption1,
                  }}
                >
                  {formatDuration(call.duration)}
                </Text>
              )}
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={{
              padding: spacing.sm,
              marginLeft: spacing.sm,
            }}
            onPress={() => handleDeleteCall(call)}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              🗑️
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading && callHistory.length === 0) {
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
            Loading call history...
          </Text>
        </View>
      );
    }

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
          📞
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
          No bailouts yet
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.body,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}
        >
          Hope you never need them! 😊{'\n'}When you do, they'll show up here.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.secondary,
            borderRadius: spacing.radius.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.body,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary} />
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
          Call History
        </Text>

        {/* Status Filter */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={{
                backgroundColor: statusFilter === filter.key ? colors.primary : colors.surface,
                borderRadius: spacing.radius.sm,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
              }}
              onPress={() => setStatusFilter(filter.key)}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  fontWeight: statusFilter === filter.key
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

      {/* Call History List */}
      <View style={{ flex: 1 }}>
        {filteredHistory.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredHistory}
            renderItem={renderCallItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{
              padding: spacing.container.padding,
              paddingBottom: spacing.xl,
            }}
          />
        )}
      </View>

      {/* Call Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {selectedCall && (
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
                  <Text style={{ color: colors.link, fontSize: 16 }}>Close</Text>
                </TouchableOpacity>

                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.headline,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Call Details
                </Text>

                <View style={{ width: 60 }} />
              </View>

              {/* Call Content */}
              <View style={{ flex: 1 }}>
                {(() => {
                  const scenario = getScenarioById(selectedCall.scenarioId);
                  const callerIcon = scenario ? CALLER_ICONS[scenario.callerType] : '📞';

                  return (
                    <>
                      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
                        <Text style={{ fontSize: 64, marginBottom: spacing.md }}>
                          {callerIcon}
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
                          {scenario?.title || 'Unknown Scenario'}
                        </Text>
                        <View
                          style={{
                            backgroundColor: getStatusColor(selectedCall.status),
                            borderRadius: spacing.radius.sm,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
                            marginBottom: spacing.md,
                          }}
                        >
                          <Text
                            style={{
                              color: selectedCall.status === 'canceled' ? colors.textSecondary : colors.text,
                              fontSize: typography.fontSize.body,
                              fontWeight: typography.fontWeight.semibold,
                            }}
                          >
                            {getStatusText(selectedCall.status)}
                          </Text>
                        </View>
                      </View>

                      {/* Call Details */}
                      <View
                        style={{
                          backgroundColor: colors.surface,
                          borderRadius: spacing.radius.md,
                          padding: spacing.md,
                          marginBottom: spacing.xl,
                        }}
                      >
                        <View style={{ marginBottom: spacing.md }}>
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: typography.fontSize.caption1,
                              marginBottom: spacing.xs,
                            }}
                          >
                            Triggered
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: typography.fontSize.body,
                            }}
                          >
                            {formatDate(selectedCall.triggeredAt)}
                          </Text>
                        </View>

                        {selectedCall.duration && (
                          <View style={{ marginBottom: spacing.md }}>
                            <Text
                              style={{
                                color: colors.textSecondary,
                                fontSize: typography.fontSize.caption1,
                                marginBottom: spacing.xs,
                              }}
                            >
                              Duration
                            </Text>
                            <Text
                              style={{
                                color: colors.text,
                                fontSize: typography.fontSize.body,
                              }}
                            >
                              {formatDuration(selectedCall.duration)}
                            </Text>
                          </View>
                        )}

                        <View>
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: typography.fontSize.caption1,
                              marginBottom: spacing.xs,
                            }}
                          >
                            Caller Type
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: typography.fontSize.body,
                            }}
                          >
                            {selectedCall.callerType.charAt(0).toUpperCase() + selectedCall.callerType.slice(1)}
                          </Text>
                        </View>
                      </View>

                      {scenario?.customMessage && (
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
                            Call Script Used:
                          </Text>
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: typography.fontSize.body,
                              lineHeight: typography.lineHeight.relaxed * typography.fontSize.body,
                              fontStyle: 'italic',
                            }}
                          >
                            "{scenario.customMessage}"
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }} />

                      {/* Action Button */}
                      {scenario && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: colors.secondary,
                            borderRadius: spacing.radius.md,
                            paddingVertical: spacing.md,
                            alignItems: 'center',
                          }}
                          onPress={() => handleUseAgain(selectedCall)}
                        >
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: typography.fontSize.button,
                              fontWeight: typography.fontWeight.semibold,
                            }}
                          >
                            Use Again
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                })()}
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

export default CallHistoryScreen;