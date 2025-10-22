import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Slider,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  useAuth,
  useSubscription,
} from '../stores';
import SettingsCard from '../components/SettingsCard';
import SettingsRow from '../components/SettingsRow';
import { colors, spacing, typography } from '../theme';
import {
  VoicePreferences,
  CallerIdSettings,
  NotificationPreferences,
  CALLER_TYPE_OPTIONS,
  VOICE_GENDER_OPTIONS,
  ACCENT_OPTIONS,
} from '@bailout/shared/types';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const {
    currentTier,
    callsRemaining,
    renewalDate,
    loadSubscription,
  } = useSubscription();

  // Local state for preferences
  const [voicePrefs, setVoicePrefs] = useState<VoicePreferences>({
    defaultCallerType: 'mom',
    voiceGender: 'female',
    accent: 'us',
    callDurationMinutes: 2,
    voiceSpeed: 1.0,
    voiceStability: 0.75,
  });

  const [callerIdSettings, setCallerIdSettings] = useState<CallerIdSettings>({
    defaultContactName: 'Mom',
    defaultPhoneNumber: '(555) 123-4567',
    useRandomNumbers: false,
    showAsUnknown: false,
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    callReminders: true,
    subscriptionUpdates: true,
    tipsAndTricks: false,
    pushNotifications: true,
    emailNotifications: false,
  });

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCallerIdModal, setShowCallerIdModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Navigate to account deletion confirmation screen
            navigation.navigate('DeleteAccount');
          },
        },
      ]
    );
  };

  const handlePreviewVoice = () => {
    Toast.show({
      type: 'info',
      text1: 'Voice Preview',
      text2: 'Playing sample with current settings...',
    });
    // TODO: Implement actual voice preview
  };

  const saveVoicePreferences = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      Toast.show({
        type: 'success',
        text1: 'Settings Saved',
        text2: 'Voice preferences updated successfully',
      });
      setShowVoiceModal(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Could not save voice preferences',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveCallerIdSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      Toast.show({
        type: 'success',
        text1: 'Settings Saved',
        text2: 'Caller ID settings updated successfully',
      });
      setShowCallerIdModal(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Could not save caller ID settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPhoneForDisplay = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return phone;
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.container.padding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSize.title1,
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.xl,
          }}
        >
          Settings
        </Text>

        {/* Account Section */}
        <SettingsCard title="Account" icon="👤" marginBottom={spacing.lg}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 24,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {getInitials(user?.name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.headline,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {user?.name || 'User'}
                </Text>
                {user?.verifiedAt && (
                  <Text
                    style={{
                      color: colors.success,
                      fontSize: 14,
                      marginLeft: spacing.xs,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.body,
                }}
              >
                {user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : 'Phone not set'}
              </Text>
              {user?.email && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.footnote,
                  }}
                >
                  {user.email}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.secondary,
              borderRadius: spacing.radius.sm,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </SettingsCard>

        {/* Voice Preferences */}
        <SettingsCard title="Voice Preferences" icon="🎤" marginBottom={spacing.lg}>
          <SettingsRow
            label="Default Caller"
            value={CALLER_TYPE_OPTIONS.find(o => o.value === voicePrefs.defaultCallerType)?.label}
            onPress={() => setShowVoiceModal(true)}
          />
          <SettingsRow
            label="Voice Gender"
            value={VOICE_GENDER_OPTIONS.find(o => o.value === voicePrefs.voiceGender)?.label}
            onPress={() => setShowVoiceModal(true)}
          />
          <SettingsRow
            label="Call Duration"
            value={`${voicePrefs.callDurationMinutes} minutes`}
            onPress={() => setShowVoiceModal(true)}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.surfaceSecondary,
              borderRadius: spacing.radius.sm,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              marginTop: spacing.sm,
            }}
            onPress={handlePreviewVoice}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.body,
              }}
            >
              🔊 Preview Voice
            </Text>
          </TouchableOpacity>
        </SettingsCard>

        {/* Caller ID Settings */}
        <SettingsCard title="Caller ID Settings" icon="📞" marginBottom={spacing.lg}>
          <SettingsRow
            label="Default Name"
            value={callerIdSettings.defaultContactName}
            onPress={() => setShowCallerIdModal(true)}
          />
          <SettingsRow
            label="Default Number"
            value={callerIdSettings.defaultPhoneNumber}
            onPress={() => setShowCallerIdModal(true)}
          />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.caption1,
              marginTop: spacing.sm,
            }}
          >
            This is how the call will appear on your phone
          </Text>
        </SettingsCard>

        {/* Subscription Section */}
        <SettingsCard title="Subscription" icon="💎" marginBottom={spacing.lg}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <View
              style={{
                backgroundColor: currentTier === 'pro' ? colors.warning : colors.surfaceSecondary,
                borderRadius: spacing.radius.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.caption1,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {currentTier === 'pro' ? '⭐ Pro Member' : 'Free Plan'}
              </Text>
            </View>
          </View>

          {currentTier === 'free' ? (
            <>
              <View style={{ marginBottom: spacing.md }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.body,
                    marginBottom: spacing.xs,
                  }}
                >
                  {callsRemaining} calls remaining this month
                </Text>
                <View
                  style={{
                    height: 8,
                    backgroundColor: colors.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${(callsRemaining / 3) * 100}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: spacing.radius.sm,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                }}
                onPress={() => navigation.navigate('Upgrade')}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.body,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Upgrade to Pro
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <SettingsRow
                label="Manage Subscription"
                onPress={() => navigation.navigate('ManageSubscription')}
                type="navigation"
              />
              {renewalDate && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.caption1,
                  }}
                >
                  Next billing: {new Date(renewalDate).toLocaleDateString()}
                </Text>
              )}
            </>
          )}
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard title="Notifications" icon="🔔" marginBottom={spacing.lg}>
          <SettingsRow
            label="Call Reminders"
            type="toggle"
            isToggled={notifications.callReminders}
            onToggle={(value) => setNotifications(prev => ({ ...prev, callReminders: value }))}
          />
          <SettingsRow
            label="Subscription Updates"
            type="toggle"
            isToggled={notifications.subscriptionUpdates}
            onToggle={(value) => setNotifications(prev => ({ ...prev, subscriptionUpdates: value }))}
          />
          <SettingsRow
            label="Tips & Tricks"
            type="toggle"
            isToggled={notifications.tipsAndTricks}
            onToggle={(value) => setNotifications(prev => ({ ...prev, tipsAndTricks: value }))}
            last
          />
        </SettingsCard>

        {/* App Section */}
        <SettingsCard title="About" icon="ℹ️" marginBottom={spacing.lg}>
          <SettingsRow
            label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            type="navigation"
          />
          <SettingsRow
            label="Terms of Service"
            onPress={() => navigation.navigate('TermsOfService')}
            type="navigation"
          />
          <SettingsRow
            label="Help & Support"
            onPress={() => navigation.navigate('Support')}
            type="navigation"
          />
          <SettingsRow
            label="Rate BailOut"
            onPress={() => {
              // TODO: Open app store rating
              Toast.show({
                type: 'success',
                text1: 'Thanks!',
                text2: 'Opening app store...',
              });
            }}
            type="action"
          />
          <SettingsRow
            label="Version"
            value="1.0.0"
            type="text"
            last
          />
        </SettingsCard>

        {/* Danger Zone */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: colors.error,
              borderRadius: spacing.radius.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
            onPress={handleLogout}
          >
            <Text
              style={{
                color: colors.error,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              paddingVertical: spacing.sm,
            }}
            onPress={handleDeleteAccount}
          >
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: typography.fontSize.footnote,
              }}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Voice Preferences Modal */}
      <Modal
        visible={showVoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1, padding: spacing.container.padding }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <Text style={{ color: colors.link, fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.headline,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Voice Settings
              </Text>
              <TouchableOpacity onPress={saveVoicePreferences} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.link, fontSize: 16 }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              {/* Caller Type Selection */}
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.md,
                }}
              >
                Default Caller Type
              </Text>
              {CALLER_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                  onPress={() => setVoicePrefs(prev => ({ ...prev, defaultCallerType: option.value }))}
                >
                  <Text style={{ fontSize: 24, marginRight: spacing.md }}>{option.emoji}</Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.fontSize.body,
                      flex: 1,
                    }}
                  >
                    {option.label}
                  </Text>
                  {voicePrefs.defaultCallerType === option.value && (
                    <Text style={{ color: colors.primary, fontSize: 20 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              {/* Voice Gender */}
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginTop: spacing.xl,
                  marginBottom: spacing.md,
                }}
              >
                Voice Gender
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {VOICE_GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      flex: 1,
                      backgroundColor:
                        voicePrefs.voiceGender === option.value ? colors.primary : colors.surface,
                      borderRadius: spacing.radius.sm,
                      paddingVertical: spacing.sm,
                      alignItems: 'center',
                    }}
                    onPress={() => setVoicePrefs(prev => ({ ...prev, voiceGender: option.value }))}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: typography.fontSize.body,
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Call Duration */}
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginTop: spacing.xl,
                  marginBottom: spacing.md,
                }}
              >
                Call Duration: {voicePrefs.callDurationMinutes} minutes
              </Text>
              <Slider
                style={{ height: 40 }}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={voicePrefs.callDurationMinutes}
                onValueChange={(value) => setVoicePrefs(prev => ({ ...prev, callDurationMinutes: value as 1 | 2 | 3 | 4 | 5 }))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Caller ID Modal */}
      <Modal
        visible={showCallerIdModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCallerIdModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1, padding: spacing.container.padding }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <TouchableOpacity onPress={() => setShowCallerIdModal(false)}>
                <Text style={{ color: colors.link, fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.headline,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Caller ID Settings
              </Text>
              <TouchableOpacity onPress={saveCallerIdSettings} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.link, fontSize: 16 }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.sm,
                }}
              >
                Default Contact Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: spacing.radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  marginBottom: spacing.lg,
                }}
                placeholder="e.g., Mom, John from Work"
                placeholderTextColor={colors.textSecondary}
                value={callerIdSettings.defaultContactName}
                onChangeText={(text) => setCallerIdSettings(prev => ({ ...prev, defaultContactName: text.slice(0, 25) }))}
                maxLength={25}
              />

              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.sm,
                }}
              >
                Default Phone Number
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: spacing.radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  marginBottom: spacing.lg,
                }}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textSecondary}
                value={callerIdSettings.defaultPhoneNumber}
                onChangeText={(text) => setCallerIdSettings(prev => ({ ...prev, defaultPhoneNumber: text }))}
                keyboardType="phone-pad"
              />

              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: spacing.radius.md,
                  padding: spacing.md,
                  marginTop: spacing.md,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.caption1,
                  }}
                >
                  💡 Tip: This is how the bailout call will appear on your phone's caller ID
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

export default SettingsScreen;