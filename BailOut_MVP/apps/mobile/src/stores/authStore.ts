import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  AuthTokens,
  AuthState,
  LoginFlowState,
  LoginStep,
  UpdateProfileRequest,
} from '@bailout/shared/types/auth.types';
import { authService } from '../services/auth.service';

// Auth store state interface
interface AuthStore extends AuthState {
  // Login flow state
  loginFlow: LoginFlowState;

  // Actions
  sendVerificationCode: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyCode: (phoneNumber: string, code: string) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success: boolean; message: string }>;

  // Login flow actions
  setLoginStep: (step: LoginStep) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setCodeSent: (sent: boolean) => void;
  setCanResendCode: (canResend: boolean) => void;
  setResendCountdown: (countdown: number) => void;
  incrementVerificationAttempts: () => void;
  resetLoginFlow: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const initialLoginFlow: LoginFlowState = {
  currentStep: 'phone_input',
  verificationCodeSent: false,
  canResendCode: true,
  resendCountdown: 0,
  verificationAttempts: 0,
  maxVerificationAttempts: 3,
};

// Create the auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,
      loginFlow: initialLoginFlow,

      // Send verification code
      sendVerificationCode: async (phoneNumber: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.sendVerificationCode(phoneNumber);

          if (response.success) {
            set((state) => ({
              isLoading: false,
              loginFlow: {
                ...state.loginFlow,
                phoneNumber,
                verificationCodeSent: true,
                canResendCode: false,
                resendCountdown: 60,
                currentStep: 'code_verification',
              },
            }));

            // Start countdown timer
            const timer = setInterval(() => {
              const { loginFlow } = get();
              if (loginFlow.resendCountdown > 0) {
                set((state) => ({
                  loginFlow: {
                    ...state.loginFlow,
                    resendCountdown: state.loginFlow.resendCountdown - 1,
                  },
                }));
              } else {
                set((state) => ({
                  loginFlow: {
                    ...state.loginFlow,
                    canResendCode: true,
                  },
                }));
                clearInterval(timer);
              }
            }, 1000);

            return {
              success: true,
              message: response.data?.message || 'Verification code sent',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to send code' });
            return {
              success: false,
              message: response.error?.message || 'Failed to send code',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send code';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Verify code and login
      verifyCode: async (phoneNumber: string, code: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.verifyCode(phoneNumber, code);

          if (response.success && response.data) {
            const { user, tokens } = response.data;

            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              lastLoginAt: new Date(),
              loginFlow: {
                ...get().loginFlow,
                currentStep: 'completed',
              },
            });

            return {
              success: true,
              message: 'Login successful',
            };
          } else {
            // Increment verification attempts
            const { loginFlow } = get();
            const newAttempts = loginFlow.verificationAttempts + 1;

            set((state) => ({
              isLoading: false,
              error: response.error?.message || 'Verification failed',
              loginFlow: {
                ...state.loginFlow,
                verificationAttempts: newAttempts,
              },
            }));

            // If max attempts reached, reset to phone input
            if (newAttempts >= loginFlow.maxVerificationAttempts) {
              setTimeout(() => {
                get().resetLoginFlow();
              }, 2000);
            }

            return {
              success: false,
              message: response.error?.message || 'Verification failed',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Verification failed';
          set({ isLoading: false, error: errorMessage });

          // Increment attempts on error
          set((state) => ({
            loginFlow: {
              ...state.loginFlow,
              verificationAttempts: state.loginFlow.verificationAttempts + 1,
            },
          }));

          return { success: false, message: errorMessage };
        }
      },

      // Refresh token
      refreshToken: async () => {
        try {
          const response = await authService.refreshToken();

          if (response.success && response.data) {
            // Update access token in stored tokens
            const currentTokens = get().tokens;
            if (currentTokens) {
              const updatedTokens: AuthTokens = {
                ...currentTokens,
                accessToken: response.data.accessToken,
                expiresIn: response.data.expiresIn,
              };

              set({ tokens: updatedTokens });
            }

            return true;
          } else {
            // Refresh failed, logout user
            await get().logout();
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          await get().logout();
          return false;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Always clear local state
          set({
            ...initialState,
            loginFlow: initialLoginFlow,
          });
        }
      },

      // Load user from storage
      loadUser: async () => {
        set({ isLoading: true });

        try {
          // Check if we have stored tokens and user data
          const [tokens, user] = await Promise.all([
            authService.getStoredTokens(),
            authService.getStoredUserData(),
          ]);

          if (tokens && user) {
            // Try to refresh the token to ensure it's valid
            const refreshSuccess = await authService.ensureValidToken();

            if (refreshSuccess) {
              // Get fresh user data
              const profileResponse = await authService.getProfile();

              if (profileResponse.success && profileResponse.data) {
                set({
                  user: profileResponse.data.user,
                  tokens,
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              }
            }
          }

          // If we get here, authentication failed
          await authService.clearStoredTokens();
          await authService.clearUserData();
          set({ ...initialState });
        } catch (error) {
          console.error('Load user failed:', error);
          set({ ...initialState });
        }
      },

      // Update profile
      updateProfile: async (data: UpdateProfileRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.updateProfile(data);

          if (response.success) {
            // Refresh user data
            await get().loadUser();

            set({ isLoading: false });
            return {
              success: true,
              message: response.data?.message || 'Profile updated successfully',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Update failed' });
            return {
              success: false,
              message: response.error?.message || 'Update failed',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Update failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Login flow actions
      setLoginStep: (step: LoginStep) => {
        set((state) => ({
          loginFlow: {
            ...state.loginFlow,
            currentStep: step,
          },
        }));
      },

      setPhoneNumber: (phoneNumber: string) => {
        set((state) => ({
          loginFlow: {
            ...state.loginFlow,
            phoneNumber,
          },
        }));
      },

      setCodeSent: (sent: boolean) => {
        set((state) => ({
          loginFlow: {
            ...state.loginFlow,
            verificationCodeSent: sent,
          },
        }));
      },

      setCanResendCode: (canResend: boolean) => {
        set((state) => ({
          loginFlow: {
            ...state.loginFlow,
            canResendCode,
          },
        }));
      },

      setResendCountdown: (countdown: number) => {
        set((state) => ({
          loginFlow: {
            ...state.loginFlow,
            resendCountdown: countdown,
          },
        }));
      },

      incrementVerificationAttempts: () => {
        set((state) => ({
          loginFlow: {
            ...state.loginFlow,
            verificationAttempts: state.loginFlow.verificationAttempts + 1,
          },
        }));
      },

      resetLoginFlow: () => {
        set({ loginFlow: initialLoginFlow });
      },

      // Utility actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist essential data
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        lastLoginAt: state.lastLoginAt,
      }),
      onRehydrateStorage: () => (state) => {
        // Reset loading and error states on rehydration
        if (state) {
          state.isLoading = false;
          state.error = null;
          state.loginFlow = initialLoginFlow;
        }
      },
    }
  )
);

// Hook for auth state
export const useAuth = () => {
  const store = useAuthStore();
  return {
    // State
    user: store.user,
    tokens: store.tokens,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    lastLoginAt: store.lastLoginAt,

    // Actions
    sendVerificationCode: store.sendVerificationCode,
    verifyCode: store.verifyCode,
    refreshToken: store.refreshToken,
    logout: store.logout,
    loadUser: store.loadUser,
    updateProfile: store.updateProfile,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
  };
};

// Hook for login flow state
export const useLoginFlow = () => {
  const store = useAuthStore();
  return {
    // State
    loginFlow: store.loginFlow,

    // Actions
    setLoginStep: store.setLoginStep,
    setPhoneNumber: store.setPhoneNumber,
    setCodeSent: store.setCodeSent,
    setCanResendCode: store.setCanResendCode,
    setResendCountdown: store.setResendCountdown,
    incrementVerificationAttempts: store.incrementVerificationAttempts,
    resetLoginFlow: store.resetLoginFlow,
  };
};

// Selector hooks for specific data
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;