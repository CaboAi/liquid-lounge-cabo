import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme';

interface SubscriptionBannerProps {
  tier: 'free' | 'pro';
  callsRemaining: number;
  onUpgrade: () => void;
  variant?: 'info' | 'warning' | 'success';
  dismissible?: boolean;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  tier,
  callsRemaining,
  onUpgrade,
  variant = 'info',
  dismissible = true,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_KEY = `subscription_banner_dismissed_${new Date().getMonth()}_${new Date().getFullYear()}`;

  useEffect(() => {
    checkDismissedState();
  }, []);

  const checkDismissedState = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
      setIsDismissed(dismissed === 'true');
    } catch (error) {
      console.error('Failed to check banner dismissed state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setIsDismissed(true);
    } catch (error) {
      console.error('Failed to save banner dismissed state:', error);
    }
  };

  // Don't show banner for Pro users or if dismissed or loading
  if (tier === 'pro' || isDismissed || isLoading) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'warning':
        return colors.warning;
      case 'success':
        return colors.success;
      case 'info':
      default:
        return colors.secondary;
    }
  };

  const getTextColor = () => {
    return variant === 'warning' ? colors.textInverse : colors.text;
  };

  const getProgressPercentage = () => {
    const totalCalls = 3; // Free tier limit
    const usedCalls = totalCalls - callsRemaining;
    return (usedCalls / totalCalls) * 100;
  };

  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const progressPercentage = getProgressPercentage();

  return (
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
      {dismissible && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: spacing.xs,
            right: spacing.xs,
            padding: spacing.xs,
            zIndex: 1,
          }}
          onPress={handleDismiss}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 20 }}>×</Text>
        </TouchableOpacity>
      )}

      <View style={{ paddingRight: dismissible ? spacing.lg : 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.body,
              fontWeight: typography.fontWeight.medium,
              flex: 1,
            }}
          >
            {callsRemaining > 0
              ? `${callsRemaining} ${callsRemaining === 1 ? 'call' : 'calls'} remaining this month`
              : 'No calls remaining this month'}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            marginBottom: spacing.md,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: callsRemaining === 0 ? colors.error : backgroundColor,
              borderRadius: 2,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.caption1,
            }}
          >
            {callsRemaining === 0
              ? 'Upgrade for unlimited calls'
              : 'Want unlimited bailouts?'}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: backgroundColor,
              borderRadius: spacing.radius.sm,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
            }}
            onPress={onUpgrade}
          >
            <Text
              style={{
                color: textColor,
                fontSize: typography.fontSize.caption1,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Upgrade to Pro
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SubscriptionBanner;