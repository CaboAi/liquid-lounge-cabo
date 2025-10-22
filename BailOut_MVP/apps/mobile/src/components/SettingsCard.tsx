import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface SettingsCardProps {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  showDivider?: boolean;
  marginBottom?: number;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  icon,
  children,
  showDivider = false,
  marginBottom = spacing.md,
}) => {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: spacing.radius.md,
        marginBottom,
        overflow: 'hidden',
      }}
    >
      {title && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
          }}
        >
          {icon && (
            <Text
              style={{
                fontSize: 20,
                marginRight: spacing.sm,
              }}
            >
              {icon}
            </Text>
          )}
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.headline,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {title}
          </Text>
        </View>
      )}

      {showDivider && title && (
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: spacing.md,
          }}
        />
      )}

      <View
        style={{
          padding: spacing.md,
          paddingTop: title ? (showDivider ? spacing.md : 0) : spacing.md,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default SettingsCard;