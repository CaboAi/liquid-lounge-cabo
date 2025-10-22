import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../stores';
import { colors, spacing, typography } from '../theme';
import { UpdateProfileRequest } from '@bailout/shared/types';

interface ProfileEditScreenProps {
  navigation: any;
}

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are changes
    const nameChanged = formData.name !== (user?.name || '');
    const emailChanged = formData.email !== (user?.email || '');
    setHasChanges(nameChanged || emailChanged);
  }, [formData, user]);

  useEffect(() => {
    // Set up navigation header with save button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || !isFormValid() || isLoading}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={{
                color: hasChanges && isFormValid() ? colors.primary : colors.textSecondary,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, hasChanges, isLoading, formData]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation (optional, but must be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    return newErrors;
  };

  const isFormValid = (): boolean => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const fieldErrors = validateForm();
    setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleSave = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UpdateProfileRequest = {};

      // Only include changed fields
      if (formData.name !== (user?.name || '')) {
        updateData.name = formData.name.trim();
      }

      if (formData.email !== (user?.email || '')) {
        updateData.email = formData.email.trim() || undefined;
      }

      if (Object.keys(updateData).length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Changes',
          text2: 'No changes were made to your profile',
        });
        navigation.goBack();
        return;
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile has been updated successfully',
        });
        navigation.goBack();
      } else {
        Alert.alert(
          'Update Failed',
          result.message || 'Could not update your profile. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Update Failed',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const formatPhoneForDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.container.padding }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: spacing.xl }}>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                alignSelf: 'flex-start',
                padding: spacing.sm,
                marginLeft: -spacing.sm,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ color: colors.link, fontSize: 16 }}>← Cancel</Text>
            </TouchableOpacity>

            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.title2,
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing.sm,
              }}
            >
              Edit Profile
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
              }}
            >
              Update your personal information
            </Text>
          </View>

          {/* Profile Avatar */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 36,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {formData.name
                  ? formData.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '?'}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderRadius: spacing.radius.sm,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
              }}
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Photo upload will be available in a future update',
                });
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.caption1,
                }}
              >
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{ marginBottom: spacing.xl }}>
            {/* Name Field */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.sm,
                }}
              >
                Name *
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: spacing.radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  borderWidth: errors.name ? 1 : 0,
                  borderColor: errors.name ? colors.error : 'transparent',
                }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                onBlur={() => handleBlur('name')}
                maxLength={50}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.name && (
                <Text
                  style={{
                    color: colors.error,
                    fontSize: typography.fontSize.caption1,
                    marginTop: spacing.xs,
                  }}
                >
                  {errors.name}
                </Text>
              )}
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: typography.fontSize.caption1,
                  marginTop: spacing.xs,
                  textAlign: 'right',
                }}
              >
                {formData.name.length}/50
              </Text>
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.sm,
                }}
              >
                Email
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: spacing.radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  color: colors.text,
                  fontSize: typography.fontSize.body,
                  borderWidth: errors.email ? 1 : 0,
                  borderColor: errors.email ? colors.error : 'transparent',
                }}
                placeholder="Enter your email (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text
                  style={{
                    color: colors.error,
                    fontSize: typography.fontSize.caption1,
                    marginTop: spacing.xs,
                  }}
                >
                  {errors.email}
                </Text>
              )}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.caption1,
                  marginTop: spacing.xs,
                }}
              >
                Used for account recovery and updates
              </Text>
            </View>

            {/* Phone Field (Read-only) */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.subhead,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.sm,
                }}
              >
                Phone Number
              </Text>
              <View
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: spacing.radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.body,
                  }}
                >
                  {user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : 'Not set'}
                </Text>
                {user?.verifiedAt && (
                  <Text style={{ color: colors.success, fontSize: 16 }}>✓</Text>
                )}
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.caption1,
                  marginTop: spacing.xs,
                }}
              >
                Contact support to change your phone number
              </Text>
            </View>
          </View>

          {/* Save Button (Mobile) */}
          <TouchableOpacity
            style={{
              backgroundColor: hasChanges && isFormValid() ? colors.primary : colors.surfaceSecondary,
              borderRadius: spacing.radius.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}
            onPress={handleSave}
            disabled={!hasChanges || !isFormValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text
                style={{
                  color: hasChanges && isFormValid() ? colors.text : colors.textSecondary,
                  fontSize: typography.fontSize.button,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.radius.md,
              padding: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.caption1,
                textAlign: 'center',
              }}
            >
              💡 Your profile information is used to personalize your BailOut experience and for account security.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
};

export default ProfileEditScreen;