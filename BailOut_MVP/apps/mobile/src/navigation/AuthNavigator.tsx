import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneInputScreen from '../screens/Auth/PhoneInputScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';

export type AuthStackParamList = {
  PhoneInput: undefined;
  Verification: { phoneNumber: string };
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PhoneInput"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="PhoneInput"
        component={PhoneInputScreen}
        options={{
          title: 'Phone Number',
        }}
      />
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{
          title: 'Verification',
          gestureEnabled: false, // Prevent going back during verification
        }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          title: 'Setup',
          gestureEnabled: false, // Prevent going back during onboarding
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;