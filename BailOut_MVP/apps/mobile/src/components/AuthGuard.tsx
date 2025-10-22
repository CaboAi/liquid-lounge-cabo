import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard component that handles authentication state and redirects
 *
 * @param children - Components to render when authenticated
 * @param fallback - Component to render when not authenticated (optional)
 * @param requireAuth - Whether authentication is required (default: true)
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading, loadUser, user } = useAuth();

  useEffect(() => {
    // Load user data when component mounts
    if (!user && !isLoading) {
      loadUser();
    }
  }, [user, isLoading, loadUser]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4 text-base">
          Loading...
        </Text>
      </View>
    );
  }

  // If authentication is not required, always render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If authenticated, render children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If not authenticated and fallback provided, render fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: render loading state (shouldn't reach here in normal flow)
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Text className="text-gray-600 text-base">
        Please authenticate to continue
      </Text>
    </View>
  );
};

export default AuthGuard;