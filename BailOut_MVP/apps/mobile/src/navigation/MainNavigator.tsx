import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  ScenarioSelectorScreen,
  CallHistoryScreen,
  SettingsScreen,
  UpgradeScreen,
  ProfileEditScreen,
} from '../screens';
import { colors, typography } from '../theme';

// Tab navigator param list
export type MainTabParamList = {
  Home: undefined;
  Scenarios: undefined;
  History: undefined;
  Settings: undefined;
};

// Stack navigator param list for nested navigation
export type MainStackParamList = {
  MainTabs: undefined;
  ScenarioDetails: { scenarioId: string };
  CreateScenario: undefined;
  ScheduleCall: { scenarioId: string };
  Upgrade: undefined;
  ProfileEdit: undefined;
  ManageSubscription: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Support: undefined;
  DeleteAccount: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Tab icon components
const TabIcon: React.FC<{ emoji: string; focused: boolean }> = ({ emoji, focused }) => (
  <Text style={{
    fontSize: focused ? 24 : 20,
    opacity: focused ? 1 : 0.6,
  }}>
    {emoji}
  </Text>
);

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 83,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.tab,
          fontWeight: typography.fontWeight.medium,
          marginTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused }) => {
          let emoji = '📱';

          if (route.name === 'Home') {
            emoji = '🏠';
          } else if (route.name === 'Scenarios') {
            emoji = '📋';
          } else if (route.name === 'History') {
            emoji = '📞';
          } else if (route.name === 'Settings') {
            emoji = '⚙️';
          }

          return <TabIcon emoji={emoji} focused={focused} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Scenarios"
        component={ScenarioSelectorScreen}
        options={{ tabBarLabel: 'Scenarios' }}
      />
      <Tab.Screen
        name="History"
        component={CallHistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Placeholder screens for missing routes
const ScenarioDetailsScreen: React.FC = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  }}>
    <Text style={{
      color: colors.text,
      fontSize: typography.fontSize.title2,
      fontWeight: typography.fontWeight.bold,
      marginBottom: 16,
    }}>
      Scenario Details
    </Text>
    <Text style={{
      color: colors.textSecondary,
      fontSize: typography.fontSize.body,
      textAlign: 'center',
    }}>
      This screen will show detailed scenario information
    </Text>
  </View>
);

const CreateScenarioScreen: React.FC = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  }}>
    <Text style={{
      color: colors.text,
      fontSize: typography.fontSize.title2,
      fontWeight: typography.fontWeight.bold,
      marginBottom: 16,
    }}>
      Create Scenario
    </Text>
    <Text style={{
      color: colors.textSecondary,
      fontSize: typography.fontSize.body,
      textAlign: 'center',
    }}>
      This screen will allow creating custom scenarios
    </Text>
  </View>
);

const ScheduleCallScreen: React.FC = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  }}>
    <Text style={{
      color: colors.text,
      fontSize: typography.fontSize.title2,
      fontWeight: typography.fontWeight.bold,
      marginBottom: 16,
    }}>
      Schedule Call
    </Text>
    <Text style={{
      color: colors.textSecondary,
      fontSize: typography.fontSize.body,
      textAlign: 'center',
    }}>
      This screen will allow scheduling calls for later
    </Text>
  </View>
);

const ManageSubscriptionScreen: React.FC = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  }}>
    <Text style={{
      color: colors.text,
      fontSize: typography.fontSize.title2,
      fontWeight: typography.fontWeight.bold,
      marginBottom: 16,
    }}>
      Manage Subscription
    </Text>
    <Text style={{
      color: colors.textSecondary,
      fontSize: typography.fontSize.body,
      textAlign: 'center',
    }}>
      This screen will show billing management and cancellation options
    </Text>
  </View>
);

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="ScenarioDetails"
        component={ScenarioDetailsScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Scenario Details',
        }}
      />
      <Stack.Screen
        name="CreateScenario"
        component={CreateScenarioScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Create Scenario',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ScheduleCall"
        component={ScheduleCallScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Schedule Call',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Upgrade"
        component={UpgradeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ManageSubscription"
        component={ManageSubscriptionScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Manage Subscription',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;