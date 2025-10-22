import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useLoginFlow } from '../../stores/authStore';
import { AuthValidation } from '@bailout/shared/schemas/auth.schemas';

type AuthStackParamList = {
  PhoneInput: undefined;
  Verification: { phoneNumber: string };
  Onboarding: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PhoneInput'>;

const PhoneInputScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { sendVerificationCode, isLoading, error, clearError } = useAuth();
  const { loginFlow, setPhoneNumber } = useLoginFlow();

  const [phoneNumber, setPhoneNumberLocal] = useState(loginFlow.phoneNumber || '');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Format phone number as user types
    const formatted = formatPhoneNumber(phoneNumber);
    setFormattedPhone(formatted);

    // Validate phone number
    const sanitized = AuthValidation.sanitizePhoneNumber(phoneNumber);
    const isValid = AuthValidation.isValidPhoneNumber(sanitized);
    setIsValidPhone(isValid && phoneNumber.length >= 10);
  }, [phoneNumber]);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Apply formatting: (XXX) XXX-XXXX
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneNumberChange = (text: string) => {
    // Remove formatting and keep only digits
    const cleaned = text.replace(/\D/g, '');

    // Limit to 10 digits
    if (cleaned.length <= 10) {
      setPhoneNumberLocal(cleaned);
    }
  };

  const handleSendCode = async () => {
    if (!isValidPhone) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    const sanitized = AuthValidation.sanitizePhoneNumber(phoneNumber);
    setPhoneNumber(sanitized);

    const result = await sendVerificationCode(sanitized);

    if (result.success) {
      navigation.navigate('Verification', { phoneNumber: sanitized });
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleResendCode = async () => {
    if (loginFlow.phoneNumber) {
      const result = await sendVerificationCode(loginFlow.phoneNumber);
      if (result.success) {
        navigation.navigate('Verification', { phoneNumber: loginFlow.phoneNumber });
      } else {
        Alert.alert('Error', result.message);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to BailOut
            </Text>
            <Text className="text-lg text-gray-600">
              Enter your phone number to get started
            </Text>
          </View>

          {/* Phone Input Section */}
          <View className="mb-8">
            <Text className="text-base font-medium text-gray-700 mb-3">
              Phone Number
            </Text>

            <View className="relative">
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-4">
                <Text className="text-base text-gray-700 mr-2">+1</Text>
                <TextInput
                  value={formattedPhone}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  maxLength={14} // (XXX) XXX-XXXX
                  className="flex-1 text-base text-gray-900"
                  editable={!isLoading}
                />
              </View>

              {/* Validation indicator */}
              {phoneNumber.length > 0 && (
                <View className="absolute right-3 top-4">
                  <View
                    className={`w-3 h-3 rounded-full ${
                      isValidPhone ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </View>
              )}
            </View>

            {/* Error message */}
            {error && (
              <Text className="text-sm text-red-600 mt-2">{error}</Text>
            )}

            {/* Help text */}
            <Text className="text-sm text-gray-500 mt-2">
              We'll send you a verification code via SMS
            </Text>
          </View>

          {/* Send Code Button */}
          <TouchableOpacity
            onPress={handleSendCode}
            disabled={!isValidPhone || isLoading}
            className={`w-full py-4 rounded-lg mb-4 ${
              isValidPhone && !isLoading
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-center font-semibold ${
                  isValidPhone ? 'text-white' : 'text-gray-500'
                }`}
              >
                Send Verification Code
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend option if code was previously sent */}
          {loginFlow.verificationCodeSent && loginFlow.phoneNumber && (
            <View className="mb-6">
              <Text className="text-sm text-gray-600 text-center mb-3">
                Already have a code for {AuthValidation.formatPhoneForDisplay(loginFlow.phoneNumber)}?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Verification', { phoneNumber: loginFlow.phoneNumber! })}
                className="bg-gray-100 py-3 rounded-lg"
              >
                <Text className="text-center font-medium text-gray-700">
                  Enter Verification Code
                </Text>
              </TouchableOpacity>

              {loginFlow.canResendCode && (
                <TouchableOpacity
                  onPress={handleResendCode}
                  className="mt-3"
                  disabled={isLoading}
                >
                  <Text className="text-center text-blue-600 font-medium">
                    Resend Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Footer */}
          <View className="flex-1 justify-end">
            <Text className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <Text className="text-blue-600">Terms of Service</Text> and{' '}
              <Text className="text-blue-600">Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneInputScreen;