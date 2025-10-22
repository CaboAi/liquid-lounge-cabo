import React, { useState, useEffect, useRef } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useLoginFlow } from '../../stores/authStore';
import { AuthValidation } from '@bailout/shared/schemas/auth.schemas';

type AuthStackParamList = {
  PhoneInput: undefined;
  Verification: { phoneNumber: string };
  Onboarding: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Verification'>;
type RouteProp = RouteProp<AuthStackParamList, 'Verification'>;

const VerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { phoneNumber } = route.params;

  const {
    verifyCode,
    sendVerificationCode,
    isLoading,
    error,
    clearError,
    isAuthenticated,
  } = useAuth();
  const { loginFlow, setCanResendCode, setResendCountdown } = useLoginFlow();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isValidCode, setIsValidCode] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();

    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [clearError]);

  useEffect(() => {
    // Validate code
    const codeString = code.join('');
    setIsValidCode(AuthValidation.isValidVerificationCode(codeString));

    // Auto-submit when 6 digits are entered
    if (codeString.length === 6 && AuthValidation.isValidVerificationCode(codeString)) {
      handleVerifyCode(codeString);
    }
  }, [code]);

  useEffect(() => {
    // Navigate to home if authenticated
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isAuthenticated, navigation]);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if digit entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Move to previous input on backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');

    if (!AuthValidation.isValidVerificationCode(verificationCode)) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit code.');
      return;
    }

    const result = await verifyCode(phoneNumber, verificationCode);

    if (!result.success) {
      // Clear the code inputs on error
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      Alert.alert('Verification Failed', result.message);
    }
    // Success case is handled by useEffect watching isAuthenticated
  };

  const handleResendCode = async () => {
    if (!loginFlow.canResendCode) {
      return;
    }

    const result = await sendVerificationCode(phoneNumber);

    if (result.success) {
      Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');

      // Start countdown
      setCanResendCode(false);
      setResendCountdown(60);

      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResendCode(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
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
            <TouchableOpacity
              onPress={handleGoBack}
              className="mb-6"
              disabled={isLoading}
            >
              <Text className="text-lg text-blue-600">← Back</Text>
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Enter Verification Code
            </Text>
            <Text className="text-lg text-gray-600">
              We sent a 6-digit code to{'\n'}
              <Text className="font-medium">
                {AuthValidation.formatPhoneForDisplay(phoneNumber)}
              </Text>
            </Text>
          </View>

          {/* Code Input Section */}
          <View className="mb-8">
            <View className="flex-row justify-center space-x-3 mb-6">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  placeholder="•"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={1}
                  selectTextOnFocus
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg ${
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : error
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  editable={!isLoading}
                />
              ))}
            </View>

            {/* Error message */}
            {error && (
              <Text className="text-sm text-red-600 text-center mb-4">
                {error}
              </Text>
            )}

            {/* Attempts warning */}
            {loginFlow.verificationAttempts > 0 && (
              <Text className="text-sm text-amber-600 text-center mb-4">
                {loginFlow.maxVerificationAttempts - loginFlow.verificationAttempts} attempts remaining
              </Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={() => handleVerifyCode()}
            disabled={!isValidCode || isLoading}
            className={`w-full py-4 rounded-lg mb-6 ${
              isValidCode && !isLoading
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-center font-semibold ${
                  isValidCode ? 'text-white' : 'text-gray-500'
                }`}
              >
                Verify Code
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 text-center mb-3">
              Didn't receive the code?
            </Text>

            {loginFlow.canResendCode ? (
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={isLoading}
                className="bg-gray-100 py-3 rounded-lg"
              >
                <Text className="text-center font-medium text-gray-700">
                  Resend Code
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 py-3 rounded-lg">
                <Text className="text-center font-medium text-gray-500">
                  Resend in {loginFlow.resendCountdown}s
                </Text>
              </View>
            )}
          </View>

          {/* Help Section */}
          <View className="flex-1 justify-end">
            <View className="bg-blue-50 p-4 rounded-lg">
              <Text className="text-sm text-blue-800 text-center leading-relaxed">
                💡 <Text className="font-medium">Tip:</Text> The code will auto-submit when you enter all 6 digits
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert(
                'Need Help?',
                'If you\'re not receiving SMS codes, please check:\n\n• Your phone has signal\n• SMS is not blocked\n• The number is correct\n\nFor further assistance, contact support.'
              )}
              className="mt-4"
            >
              <Text className="text-center text-gray-500 text-sm">
                Need help? Tap here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerificationScreen;