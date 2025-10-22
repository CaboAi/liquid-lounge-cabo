import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../stores/authStore';
import { VoicePersona, ConsentLevel } from '@bailout/shared/types/auth.types';
import { AuthValidation } from '@bailout/shared/schemas/auth.schemas';

type AuthStackParamList = {
  Home: undefined;
  Onboarding: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface VoiceOption {
  id: VoicePersona;
  title: string;
  description: string;
  emoji: string;
}

const voiceOptions: VoiceOption[] = [
  {
    id: 'family_mom',
    title: 'Mom',
    description: 'Caring and concerned mother calling',
    emoji: '👩‍👧‍👦',
  },
  {
    id: 'family_dad',
    title: 'Dad',
    description: 'Supportive father checking in',
    emoji: '👨‍👧‍👦',
  },
  {
    id: 'work_boss',
    title: 'Boss',
    description: 'Professional urgent work call',
    emoji: '👔',
  },
  {
    id: 'friend_close',
    title: 'Best Friend',
    description: 'Close friend with important news',
    emoji: '👯‍♀️',
  },
  {
    id: 'service_doctor',
    title: 'Doctor\'s Office',
    description: 'Medical appointment reminder',
    emoji: '🏥',
  },
  {
    id: 'emergency_contact',
    title: 'Emergency Contact',
    description: 'Urgent family emergency',
    emoji: '🚨',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { updateProfile, isLoading, user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('family_mom');
  const [callerName, setCallerName] = useState('Mom');
  const [useRandomNumbers, setUseRandomNumbers] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;

  const handleNameNext = () => {
    if (name.trim() && AuthValidation.isValidName(name.trim())) {
      setCurrentStep(2);
    } else {
      Alert.alert('Invalid Name', 'Please enter a valid name.');
    }
  };

  const handleVoiceNext = () => {
    // Update caller name based on selected voice
    const selectedOption = voiceOptions.find(option => option.id === selectedVoice);
    if (selectedOption) {
      setCallerName(selectedOption.title);
    }
    setCurrentStep(3);
  };

  const handleComplete = async () => {
    const profileData = {
      name: name.trim(),
      profileSettings: {
        voicePreferences: {
          preferredPersona: selectedVoice,
          voiceSpeed: 1.0,
          voiceStability: 0.8,
          voiceSimilarity: 0.8,
        },
        callerIdDefaults: {
          defaultCallerName: callerName,
          useRandomNumbers,
        },
        notifications: {
          smsNotifications: false,
          emailNotifications: false,
          pushNotifications: true,
          callReminders: true,
          subscriptionUpdates: true,
        },
        privacy: {
          shareUsageData: false,
          allowLocationTracking: false,
          emergencyLocationSharing: true,
          dataRetentionDays: 90,
          consentLevel: 'minimal' as ConsentLevel,
        },
      },
    };

    const result = await updateProfile(profileData);

    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const renderProgressBar = () => (
    <View className="flex-row mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          className={`flex-1 h-2 mx-1 rounded-full ${
            index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        />
      ))}
    </View>
  );

  const renderNameStep = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold text-gray-900 mb-4">
        What's your name?
      </Text>
      <Text className="text-lg text-gray-600 mb-8">
        We'll use this to personalize your experience
      </Text>

      <View className="mb-8">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your first name"
          placeholderTextColor="#9CA3AF"
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-base text-gray-900"
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        onPress={handleNameNext}
        disabled={!name.trim() || isLoading}
        className={`w-full py-4 rounded-lg ${
          name.trim() && !isLoading ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <Text
          className={`text-center font-semibold ${
            name.trim() ? 'text-white' : 'text-gray-500'
          }`}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVoiceStep = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold text-gray-900 mb-4">
        Choose Your Voice
      </Text>
      <Text className="text-lg text-gray-600 mb-8">
        Pick who you'd like to call you most often
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} className="mb-8">
        {voiceOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setSelectedVoice(option.id)}
            className={`flex-row items-center p-4 mb-3 rounded-lg border-2 ${
              selectedVoice === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text className="text-2xl mr-4">{option.emoji}</Text>
            <View className="flex-1">
              <Text
                className={`text-lg font-semibold ${
                  selectedVoice === option.id ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {option.title}
              </Text>
              <Text
                className={`text-sm ${
                  selectedVoice === option.id ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                {option.description}
              </Text>
            </View>
            {selectedVoice === option.id && (
              <View className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Text className="text-white text-xs">✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={handleVoiceNext}
        className="w-full py-4 bg-blue-600 rounded-lg"
      >
        <Text className="text-center font-semibold text-white">
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCallerIdStep = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold text-gray-900 mb-4">
        Caller ID Settings
      </Text>
      <Text className="text-lg text-gray-600 mb-8">
        Customize how the call will appear on your phone
      </Text>

      <View className="mb-6">
        <Text className="text-base font-medium text-gray-700 mb-3">
          Caller Name
        </Text>
        <TextInput
          value={callerName}
          onChangeText={setCallerName}
          placeholder="Enter caller name"
          placeholderTextColor="#9CA3AF"
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-base text-gray-900"
          editable={!isLoading}
        />
      </View>

      <View className="mb-8">
        <Text className="text-base font-medium text-gray-700 mb-4">
          Phone Number Display
        </Text>

        <TouchableOpacity
          onPress={() => setUseRandomNumbers(true)}
          className={`flex-row items-center p-4 mb-3 rounded-lg border-2 ${
            useRandomNumbers
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <View
            className={`w-5 h-5 rounded-full border-2 mr-3 ${
              useRandomNumbers
                ? 'border-blue-500 bg-blue-600'
                : 'border-gray-300'
            }`}
          >
            {useRandomNumbers && (
              <View className="w-full h-full flex items-center justify-center">
                <Text className="text-white text-xs">•</Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Random Numbers (Recommended)
            </Text>
            <Text className="text-sm text-gray-600">
              Different number each call for privacy
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setUseRandomNumbers(false)}
          className={`flex-row items-center p-4 rounded-lg border-2 ${
            !useRandomNumbers
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <View
            className={`w-5 h-5 rounded-full border-2 mr-3 ${
              !useRandomNumbers
                ? 'border-blue-500 bg-blue-600'
                : 'border-gray-300'
            }`}
          >
            {!useRandomNumbers && (
              <View className="w-full h-full flex items-center justify-center">
                <Text className="text-white text-xs">•</Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Consistent Number
            </Text>
            <Text className="text-sm text-gray-600">
              Same number for familiarity
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        disabled={!callerName.trim() || isLoading}
        className={`w-full py-4 rounded-lg mb-4 ${
          callerName.trim() && !isLoading ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            className={`text-center font-semibold ${
              callerName.trim() ? 'text-white' : 'text-gray-500'
            }`}
          >
            Complete Setup
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content */}
        {currentStep === 1 && renderNameStep()}
        {currentStep === 2 && renderVoiceStep()}
        {currentStep === 3 && renderCallerIdStep()}

        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          className="mt-4"
          disabled={isLoading}
        >
          <Text className="text-center text-gray-500 font-medium">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;