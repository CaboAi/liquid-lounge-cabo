# BailOut Mobile App

React Native mobile application for the BailOut AI-powered social exit strategy platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio

### Installation

1. Install dependencies:
```bash
cd apps/mobile
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
pnpm dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Expo development server |
| `pnpm start` | Start Expo development server |
| `pnpm android` | Run on Android |
| `pnpm ios` | Run on iOS |
| `pnpm web` | Run on web |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm build` | Build for production |

## 📱 App Architecture

### Screen Flow
```
App Launch
├── Auth Stack (if not authenticated)
│   ├── LoginScreen
│   ├── SignupScreen
│   └── ForgotPasswordScreen
└── Main Stack (if authenticated)
    ├── HomeScreen (default)
    ├── CallHistoryScreen
    └── SettingsScreen
```

### Component Structure
```
src/
├── screens/           # App screens
│   ├── Home/
│   │   └── HomeScreen.tsx
│   ├── Auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── CallHistory/
│   │   └── CallHistoryScreen.tsx
│   └── Settings/
│       └── SettingsScreen.tsx
├── components/        # Reusable components
│   ├── Button/
│   │   └── Button.tsx
│   ├── CallTrigger/
│   │   └── CallTrigger.tsx
│   ├── VoiceSelector/
│   │   └── VoiceSelector.tsx
│   └── ScenarioCard/
│       └── ScenarioCard.tsx
├── navigation/        # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── services/         # External service integrations
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── calls.ts
│   │   └── users.ts
│   ├── auth/
│   │   └── authService.ts
│   └── storage/
│       └── secureStorage.ts
├── store/            # State management
│   ├── userStore.ts
│   ├── callStore.ts
│   └── settingsStore.ts
├── hooks/            # Custom React hooks
│   ├── useAuth.ts
│   ├── useCall.ts
│   └── usePermissions.ts
└── utils/           # Utility functions
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

## 🎨 Styling with NativeWind

This app uses NativeWind (Tailwind CSS for React Native) for styling.

### Example Usage
```typescript
import { View, Text, Pressable } from 'react-native';

export const Button = ({ title, onPress, variant = 'primary' }) => {
  const baseClasses = "px-4 py-2 rounded-lg";
  const variantClasses = {
    primary: "bg-blue-500",
    secondary: "bg-gray-500",
    danger: "bg-red-500"
  };

  return (
    <Pressable
      className={`${baseClasses} ${variantClasses[variant]}`}
      onPress={onPress}
    >
      <Text className="text-white font-semibold text-center">
        {title}
      </Text>
    </Pressable>
  );
};
```

### Design System
```typescript
// Color Palette
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  danger: {
    50: '#fef2f2',
    500: '#ef4444',
    900: '#7f1d1d',
  }
};

// Typography
const typography = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold',
  body: 'text-base',
  caption: 'text-sm text-gray-600',
};

// Spacing
const spacing = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};
```

## 🔐 Authentication

### Authentication Flow
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    await secureStorage.setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await secureStorage.removeToken();
    setUser(null);
  };

  return { user, login, logout, loading };
};
```

### Secure Storage
```typescript
// services/storage/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('auth_token');
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  },
};
```

## 📡 API Integration

### API Client Configuration
```typescript
// services/api/client.ts
import axios from 'axios';
import { secureStorage } from '../storage/secureStorage';

const apiClient = axios.create({
  baseURL: process.env.API_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      secureStorage.removeToken();
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

### API Service Example
```typescript
// services/api/calls.ts
import { apiClient } from './client';

export const callsAPI = {
  async scheduleCall(data: ScheduleCallRequest): Promise<Call> {
    const response = await apiClient.post('/calls/schedule', data);
    return response.data;
  },

  async getCallHistory(): Promise<Call[]> {
    const response = await apiClient.get('/calls/history');
    return response.data;
  },

  async cancelCall(callId: string): Promise<void> {
    await apiClient.delete(`/calls/${callId}`);
  },
};
```

## 📊 State Management

### Zustand Store Example
```typescript
// store/userStore.ts
import { create } from 'zustand';

interface UserState {
  user: User | null;
  preferences: UserPreferences;
  updateUser: (user: User) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  preferences: {
    voiceId: 'default',
    defaultScenario: 'emergency',
    enableNotifications: true,
  },
  updateUser: (user) => set({ user }),
  updatePreferences: (newPreferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    })),
}));
```

### React Query Integration
```typescript
// hooks/useCall.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callsAPI } from '../services/api/calls';

export const useCallHistory = () => {
  return useQuery({
    queryKey: ['calls', 'history'],
    queryFn: callsAPI.getCallHistory,
  });
};

export const useScheduleCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: callsAPI.scheduleCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};
```

## 📱 Permissions

### Location Permission
```typescript
// hooks/usePermissions.ts
import * as Location from 'expo-location';

export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  return hasPermission;
};
```

### Microphone Permission
```typescript
import { Audio } from 'expo-av';

export const useMicrophonePermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  return hasPermission;
};
```

## 🔔 Push Notifications

### Setup and Registration
```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Send token to backend
  await apiClient.post('/users/push-token', { token });

  return token;
};
```

### Notification Handling
```typescript
// App.tsx or main component
useEffect(() => {
  // Configure notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Handle notification taps
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { data } = response.notification.request.content;

      if (data?.type === 'call_completed') {
        navigation.navigate('CallHistory');
      }
    }
  );

  return () => subscription.remove();
}, []);
```

## 🧪 Testing

### Component Testing with Jest
```typescript
// components/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

### Hook Testing
```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toBeDefined();
  });
});
```

## 🚀 Building for Production

### iOS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android Build
```bash
# Build for Android
eas build --platform android

# Build both platforms
eas build --platform all
```

### App Store Submission
```bash
# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
API_URL=https://api.bailout.app
API_TIMEOUT=30000

# Feature Flags
ENABLE_VOICE_ACTIVATION=true
ENABLE_LOCATION_TRACKING=true

# Third-party Keys
TWILIO_ACCOUNT_SID=your_twilio_sid
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### App Configuration (app.json)
```json
{
  "expo": {
    "name": "BailOut",
    "slug": "bailout",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.caboai.bailout"
    },
    "android": {
      "package": "com.caboai.bailout"
    }
  }
}
```

## 🐛 Debugging

### React Native Debugger
1. Install React Native Debugger
2. Enable Debug JS Remotely in app
3. Use Chrome DevTools for debugging

### Flipper Integration
1. Install Flipper
2. Run app with `npx react-native run-ios --simulator`
3. Connect to Flipper for advanced debugging

### Common Issues

#### Metro Bundler Issues
```bash
# Clear cache
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache
```

#### iOS Simulator Issues
```bash
# Reset iOS Simulator
npx expo run:ios --device
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [NativeWind Documentation](https://nativewind.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [React Query Documentation](https://tanstack.com/query)