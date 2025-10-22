import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  User,
  AuthTokens,
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  AUTH_ERROR_CODES,
  DeviceInfo,
} from '@bailout/shared/types/auth.types';
import { AuthValidation } from '@bailout/shared/schemas/auth.schemas';

// API configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const AUTH_ENDPOINTS = {
  SEND_CODE: '/auth/send-code',
  VERIFY_CODE: '/auth/verify-code',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
} as const;

// Secure storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  DEVICE_ID: 'device_id',
} as const;

// Error classes
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

// API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Set default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if access token exists
    const accessToken = await this.getStoredAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthError(
          data.error?.code || 'NETWORK_ERROR',
          data.error?.message || 'Request failed',
          response.status,
          data.error?.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new NetworkError('Network connection failed');
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async getStoredAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.warn('Failed to get access token from secure storage:', error);
      return null;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Main auth service class
export class AuthService {
  private api: ApiClient;

  constructor() {
    this.api = new ApiClient(API_BASE_URL);
  }

  /**
   * Send verification code to phone number
   */
  async sendVerificationCode(phoneNumber: string): Promise<SendCodeResponse> {
    try {
      // Validate and sanitize phone number
      const sanitizedPhone = AuthValidation.sanitizePhoneNumber(phoneNumber);

      const request: SendCodeRequest = {
        phoneNumber: sanitizedPhone,
      };

      const response = await this.api.post<SendCodeResponse>(
        AUTH_ENDPOINTS.SEND_CODE,
        request
      );

      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.SEND_CODE_FAILED,
          message: 'Failed to send verification code',
        },
      };
    }
  }

  /**
   * Verify code and get JWT tokens
   */
  async verifyCode(
    phoneNumber: string,
    verificationCode: string
  ): Promise<VerifyCodeResponse> {
    try {
      // Validate inputs
      const sanitizedPhone = AuthValidation.sanitizePhoneNumber(phoneNumber);

      if (!AuthValidation.isValidVerificationCode(verificationCode)) {
        return {
          success: false,
          error: {
            code: AUTH_ERROR_CODES.INVALID_VERIFICATION_CODE,
            message: 'Invalid verification code format',
          },
        };
      }

      const request: VerifyCodeRequest = {
        phoneNumber: sanitizedPhone,
        verificationCode,
      };

      const response = await this.api.post<VerifyCodeResponse>(
        AUTH_ENDPOINTS.VERIFY_CODE,
        request
      );

      // Store tokens and user data if successful
      if (response.success && response.data) {
        await this.storeTokens(response.data.tokens);
        await this.storeUserData(response.data.user);
      }

      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.VERIFICATION_FAILED,
          message: 'Verification failed',
        },
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await this.getStoredRefreshToken();

      if (!refreshToken) {
        return {
          success: false,
          error: {
            code: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
            message: 'No refresh token available',
          },
        };
      }

      const request: RefreshTokenRequest = {
        refreshToken,
      };

      const response = await this.api.post<RefreshTokenResponse>(
        AUTH_ENDPOINTS.REFRESH,
        request
      );

      // Update stored access token if successful
      if (response.success && response.data) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.data.accessToken
        );
      }

      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        // If refresh token is invalid, clear stored tokens
        if (error.code === AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN) {
          await this.clearStoredTokens();
        }

        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INTERNAL_ERROR,
          message: 'Token refresh failed',
        },
      };
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await this.api.post<LogoutResponse>(AUTH_ENDPOINTS.LOGOUT);

      // Always clear local tokens regardless of API response
      await this.clearStoredTokens();
      await this.clearUserData();

      return response;
    } catch (error) {
      // Clear local tokens even if API call fails
      await this.clearStoredTokens();
      await this.clearUserData();

      return {
        success: true,
        data: {
          message: 'Logged out locally',
        },
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<GetProfileResponse> {
    try {
      const response = await this.api.get<GetProfileResponse>(AUTH_ENDPOINTS.PROFILE);

      // Update stored user data if successful
      if (response.success && response.data) {
        await this.storeUserData(response.data.user);
      }

      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        // If unauthorized, clear tokens
        if (error.code === AUTH_ERROR_CODES.UNAUTHORIZED) {
          await this.clearStoredTokens();
        }

        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to get profile',
        },
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await this.api.put<UpdateProfileResponse>(
        AUTH_ENDPOINTS.UPDATE_PROFILE,
        data
      );

      // Refresh user data after successful update
      if (response.success) {
        await this.getProfile();
      }

      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to update profile',
        },
      };
    }
  }

  /**
   * Store authentication tokens securely
   */
  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Get stored authentication tokens
   */
  async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (!accessToken || !refreshToken) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresIn: 0, // Will be set when refreshing
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Clear stored authentication tokens
   */
  async clearStoredTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Store user data securely
   */
  async storeUserData(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get stored user data:', error);
      return null;
    }
  }

  /**
   * Clear stored user data
   */
  async clearUserData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getStoredTokens();
    return !!tokens?.accessToken;
  }

  /**
   * Get or generate device ID
   */
  async getDeviceId(): Promise<string> {
    try {
      let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);

      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return this.generateDeviceId();
    }
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    return `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get device info for session tracking
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    const deviceId = await this.getDeviceId();

    return {
      deviceId,
      deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
      appVersion: '1.0.0', // Should come from app.json or build config
      osVersion: Platform.Version.toString(),
    };
  }

  /**
   * Auto-refresh token if needed
   */
  async ensureValidToken(): Promise<boolean> {
    const tokens = await this.getStoredTokens();

    if (!tokens) {
      return false;
    }

    // Try to refresh token
    const refreshResult = await this.refreshToken();

    return refreshResult.success;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;