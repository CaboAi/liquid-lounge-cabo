import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface SettingsRowProps {
  label: string;
  value?: string | React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  icon?: string;
  type?: 'navigation' | 'toggle' | 'text' | 'action';
  isToggled?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
  textColor?: string;
  last?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  onPress,
  showChevron = false,
  icon,
  type = 'navigation',
  isToggled = false,
  onToggle,
  disabled = false,
  textColor,
  last = false,
}) => {
  const isInteractive = type === 'navigation' || type === 'action' || (type === 'toggle' && !disabled);

  const content = (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {icon && (
          <Text
            style={{
              fontSize: 20,
              marginRight: spacing.md,
            }}
          >
            {icon}
          </Text>
        )}
        <Text
          style={{
            color: textColor || (disabled ? colors.textSecondary : colors.text),
            fontSize: typography.fontSize.body,
            fontWeight: type === 'action' ? typography.fontWeight.medium : typography.fontWeight.regular,
            flex: 1,
          }}
        >
          {label}
        </Text>
      </View>

      {type === 'toggle' && (
        <Switch
          value={isToggled}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={colors.text}
        />
      )}

      {type === 'text' && value && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.body,
            marginLeft: spacing.sm,
          }}
        >
          {value}
        </Text>
      )}

      {type === 'navigation' && (
        <>
          {typeof value === 'string' ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
                marginRight: spacing.xs,
              }}
            >
              {value}
            </Text>
          ) : (
            value
          )}
          {(showChevron || type === 'navigation') && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                marginLeft: spacing.xs,
              }}
            >
              ›
            </Text>
          )}
        </>
      )}

      {type === 'action' && showChevron && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            marginLeft: spacing.xs,
          }}
        >
          ›
        </Text>
      )}
    </>
  );

  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    marginBottom: last ? 0 : spacing.xs,
    minHeight: 48,
  };

  if (isInteractive && onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  if (type === 'toggle') {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onToggle?.(!isToggled)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

export default SettingsRow;