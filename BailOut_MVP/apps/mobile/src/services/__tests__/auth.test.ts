import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AuthService } from '../auth.service';
import * as SecureStore from 'expo-secure-store';
import { AuthValidation } from '@bailout/shared/schemas/auth.schemas';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('@bailout/shared/schemas/auth.schemas');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockAuthValidation = AuthValidation as jest.Mocked<typeof AuthValidation>;

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();

    // Set up default mocks
    mockAuthValidation.sanitizePhoneNumber.mockImplementation((phone) => `+1${phone.replace(/\D/g, '')}`);
    mockAuthValidation.isValidVerificationCode.mockImplementation((code) => /^\d{6}$/.test(code));
    mockAuthValidation.formatPhoneForDisplay.mockImplementation((phone) => {
      const cleaned = phone.replace(/\D/g, '');
      return `(${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      const phoneNumber = '5551234567';
      const sanitizedPhone = '+15551234567';

      mockAuthValidation.sanitizePhoneNumber.mockReturnValue(sanitizedPhone);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'Verification code sent successfully',
            phoneNumber: '(555) 123-4567'
          }
        })
      } as Response);

      const result = await authService.sendVerificationCode(phoneNumber);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Verification code sent successfully');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/send-code',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: sanitizedPhone
          })
        })
      );
    });

    it('should handle API error response', async () => {
      const phoneNumber = '5551234567';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many SMS requests'
          }
        })
      } as Response);

      const result = await authService.sendVerificationCode(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.error?.message).toBe('Too many SMS requests');
    });

    it('should handle network errors', async () => {
      const phoneNumber = '5551234567';

      mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

      const result = await authService.sendVerificationCode(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SEND_CODE_FAILED');
      expect(result.error?.message).toBe('Failed to send verification code');
    });
  });

  describe('verifyCode', () => {
    it('should verify code and store tokens successfully', async () => {
      const phoneNumber = '+15551234567';
      const verificationCode = '123456';
      const mockUser = {
        id: 'user123',
        phoneNumber: '+15551234567',
        subscriptionTier: 'free'
      };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer' as const
      };

      mockAuthValidation.sanitizePhoneNumber.mockReturnValue(phoneNumber);
      mockAuthValidation.isValidVerificationCode.mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: mockUser,
            tokens: mockTokens
          }
        })
      } as Response);

      mockSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.verifyCode(phoneNumber, verificationCode);

      expect(result.success).toBe(true);
      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.tokens).toEqual(mockTokens);

      // Check that tokens were stored
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_access_token',
        mockTokens.accessToken
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_refresh_token',
        mockTokens.refreshToken
      );
    });

    it('should reject invalid verification code format', async () => {
      const phoneNumber = '+15551234567';
      const invalidCode = '12345'; // Only 5 digits

      mockAuthValidation.isValidVerificationCode.mockReturnValue(false);

      const result = await authService.verifyCode(phoneNumber, invalidCode);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_VERIFICATION_CODE');
      expect(result.error?.message).toBe('Invalid verification code format');
    });

    it('should handle verification failure from API', async () => {
      const phoneNumber = '+15551234567';
      const verificationCode = '123456';

      mockAuthValidation.sanitizePhoneNumber.mockReturnValue(phoneNumber);
      mockAuthValidation.isValidVerificationCode.mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'Verification code is invalid'
          }
        })
      } as Response);

      const result = await authService.verifyCode(phoneNumber, verificationCode);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CODE');
      expect(result.error?.message).toBe('Verification code is invalid');
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'refresh-token';
      const newAccessToken = 'new-access-token';

      mockSecureStore.getItemAsync.mockResolvedValue(refreshToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accessToken: newAccessToken,
            expiresIn: 900,
            tokenType: 'Bearer'
          }
        })
      } as Response);

      mockSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.refreshToken();

      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBe(newAccessToken);

      // Check that new access token was stored
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_access_token',
        newAccessToken
      );
    });

    it('should handle missing refresh token', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await authService.refreshToken();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_REFRESH_TOKEN');
      expect(result.error?.message).toBe('No refresh token available');
    });

    it('should clear tokens on invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockSecureStore.getItemAsync.mockResolvedValue(refreshToken);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Refresh token is invalid'
          }
        })
      } as Response);

      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const result = await authService.refreshToken();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_REFRESH_TOKEN');

      // Check that tokens were cleared
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_access_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
    });
  });

  describe('logout', () => {
    it('should logout and clear all stored data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { message: 'Logged out successfully' }
        })
      } as Response);

      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Logged out successfully');

      // Check that all stored data was cleared
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_access_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user_data');
    });

    it('should clear local data even if API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Logged out locally');

      // Check that local data was still cleared
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_access_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user_data');
    });
  });

  describe('token storage', () => {
    it('should store tokens securely', async () => {
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer' as const
      };

      mockSecureStore.setItemAsync.mockResolvedValue();

      await authService.storeTokens(tokens);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_access_token',
        tokens.accessToken
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_refresh_token',
        tokens.refreshToken
      );
    });

    it('should retrieve stored tokens', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const tokens = await authService.getStoredTokens();

      expect(tokens).toEqual({
        accessToken,
        refreshToken,
        expiresIn: 0,
        tokenType: 'Bearer'
      });
    });

    it('should return null when no tokens stored', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const tokens = await authService.getStoredTokens();

      expect(tokens).toBeNull();
    });

    it('should clear stored tokens', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      await authService.clearStoredTokens();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_access_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
    });
  });

  describe('user data storage', () => {
    it('should store user data securely', async () => {
      const userData = {
        id: 'user123',
        phoneNumber: '+15551234567',
        subscriptionTier: 'free'
      };

      mockSecureStore.setItemAsync.mockResolvedValue();

      await authService.storeUserData(userData as any);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_user_data',
        JSON.stringify(userData)
      );
    });

    it('should retrieve stored user data', async () => {
      const userData = {
        id: 'user123',
        phoneNumber: '+15551234567',
        subscriptionTier: 'free'
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(userData));

      const result = await authService.getStoredUserData();

      expect(result).toEqual(userData);
    });

    it('should return null when no user data stored', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await authService.getStoredUserData();

      expect(result).toBeNull();
    });

    it('should clear stored user data', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      await authService.clearUserData();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user_data');
    });
  });

  describe('authentication check', () => {
    it('should return true when user is authenticated', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('should return false when no tokens are stored', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('device management', () => {
    it('should generate and store device ID', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockSecureStore.setItemAsync.mockResolvedValue();

      const deviceId = await authService.getDeviceId();

      expect(deviceId).toMatch(/^(ios|android)_\d+_[a-z0-9]+$/);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'device_id',
        deviceId
      );
    });

    it('should return existing device ID', async () => {
      const existingDeviceId = 'ios_1234567890_abcdef123';

      mockSecureStore.getItemAsync.mockResolvedValue(existingDeviceId);

      const deviceId = await authService.getDeviceId();

      expect(deviceId).toBe(existingDeviceId);
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should get device info', async () => {
      const deviceId = 'ios_1234567890_abcdef123';

      mockSecureStore.getItemAsync.mockResolvedValue(deviceId);

      const deviceInfo = await authService.getDeviceInfo();

      expect(deviceInfo).toEqual({
        deviceId,
        deviceType: expect.stringMatching(/^(ios|android)$/),
        deviceName: expect.any(String),
        appVersion: '1.0.0',
        osVersion: expect.any(String)
      });
    });
  });
});