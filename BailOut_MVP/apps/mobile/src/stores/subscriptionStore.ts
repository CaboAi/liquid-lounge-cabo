import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionTier,
  SubscriptionFeatures,
  SUBSCRIPTION_FEATURES,
} from '@bailout/shared/types/auth.types';
import {
  Subscription,
  SubscriptionUsage,
  CheckoutSessionResponse,
} from '@bailout/shared/types/subscription.types';

// Subscription store state interface
interface SubscriptionState {
  // State
  subscription: Subscription | null;
  usage: SubscriptionUsage | null;
  currentTier: SubscriptionTier;
  callsRemaining: number;
  callsUsedThisMonth: number;
  billingCycle: 'monthly' | 'yearly' | null;
  renewalDate: Date | null;
  isTrialing: boolean;
  trialEndsAt: Date | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSubscription: () => Promise<void>;
  loadUsage: () => Promise<void>;
  upgradeToPro: () => Promise<{ success: boolean; checkoutUrl?: string; message: string }>;
  upgradeTier: (tier: SubscriptionTier, billingCycle?: 'monthly' | 'yearly') => Promise<{ success: boolean; message: string }>;
  cancelSubscription: () => Promise<{ success: boolean; message: string }>;
  restorePurchase: () => Promise<{ success: boolean; message: string }>;
  consumeCall: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Computed getters
  getCurrentFeatures: () => SubscriptionFeatures;
  canMakeCall: () => boolean;
  isUnlimited: () => boolean;
  daysUntilRenewal: () => number | null;
  daysUntilTrialEnd: () => number | null;
}

// Mock subscription service
const mockSubscriptionService = {
  async getSubscription(): Promise<{
    success: boolean;
    data?: {
      subscription: Subscription;
      usage: SubscriptionUsage;
    };
    error?: { message: string };
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const subscription: Subscription = {
      userId: 'user_123',
      tier: 'free',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
    };

    const usage: SubscriptionUsage = {
      callsUsedThisMonth: 1,
      callsRemaining: 2,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      unlimitedCalls: false,
    };

    return {
      success: true,
      data: { subscription, usage }
    };
  },

  async createCheckoutSession(): Promise<{
    success: boolean;
    data?: CheckoutSessionResponse;
    error?: { message: string };
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock checkout session creation
    return {
      success: true,
      data: {
        sessionId: 'cs_test_123456789',
        url: 'https://checkout.stripe.com/pay/cs_test_123456789#fidkdWxOYHwnPyd1blpxYHZxWjA0SkJvNnNgf1V',
      }
    };
  },

  async upgrade(tier: SubscriptionTier, billingCycle?: 'monthly' | 'yearly'): Promise<{
    success: boolean;
    data?: {
      subscription: Subscription;
    };
    error?: { message: string };
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const renewalDate = new Date();
    if (billingCycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const subscription: Subscription = {
      userId: 'user_123',
      tier,
      status: tier === 'pro' ? 'trialing' : 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: renewalDate,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: 'sub_123456789',
      stripeCustomerId: 'cus_123456789',
      trialEndsAt: tier === 'pro' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
    };

    return {
      success: true,
      data: { subscription }
    };
  },

  async cancel(): Promise<{ success: boolean; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async restore(): Promise<{
    success: boolean;
    data?: { subscription: Subscription };
    error?: { message: string };
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock no previous purchases found
    return {
      success: false,
      error: { message: 'No previous purchases found' }
    };
  },
};

// Initial state
const initialState = {
  subscription: null,
  usage: null,
  currentTier: 'free' as SubscriptionTier,
  callsRemaining: 3,
  callsUsedThisMonth: 0,
  billingCycle: null,
  renewalDate: null,
  isTrialing: false,
  trialEndsAt: null,
  isLoading: false,
  error: null,
};

// Create the subscription store
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Load subscription data
      loadSubscription: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockSubscriptionService.getSubscription();

          if (response.success && response.data) {
            const { subscription, usage } = response.data;

            set({
              subscription,
              usage,
              currentTier: subscription.tier,
              callsRemaining: usage.callsRemaining,
              callsUsedThisMonth: usage.callsUsedThisMonth,
              billingCycle: subscription.status === 'active' ? 'monthly' : null,
              renewalDate: subscription.currentPeriodEnd,
              isTrialing: subscription.status === 'trialing',
              trialEndsAt: subscription.trialEndsAt || null,
              isLoading: false,
            });
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to load subscription' });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load subscription';
          set({ isLoading: false, error: errorMessage });
        }
      },

      // Load usage data separately
      loadUsage: async () => {
        try {
          const response = await mockSubscriptionService.getSubscription();
          if (response.success && response.data) {
            const { usage } = response.data;
            set({
              usage,
              callsRemaining: usage.callsRemaining,
              callsUsedThisMonth: usage.callsUsedThisMonth,
            });
          }
        } catch (error) {
          console.error('Failed to load usage:', error);
        }
      },

      // Upgrade to Pro (creates checkout session)
      upgradeToPro: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockSubscriptionService.createCheckoutSession();

          if (response.success && response.data) {
            set({ isLoading: false });

            return {
              success: true,
              checkoutUrl: response.data.url,
              message: 'Checkout session created successfully',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to create checkout session' });
            return {
              success: false,
              message: response.error?.message || 'Failed to create checkout session',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Upgrade subscription tier
      upgradeTier: async (tier: SubscriptionTier, billingCycle?: 'monthly' | 'yearly') => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockSubscriptionService.upgrade(tier, billingCycle);

          if (response.success && response.data) {
            set({
              currentTier: response.data.tier,
              billingCycle: response.data.billingCycle,
              renewalDate: response.data.renewalDate,
              callsRemaining: tier === 'free' ? 3 : -1, // Unlimited for paid tiers
              isLoading: false,
            });

            return {
              success: true,
              message: `Successfully upgraded to ${tier} plan`,
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to upgrade subscription' });
            return {
              success: false,
              message: response.error?.message || 'Failed to upgrade subscription',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Cancel subscription
      cancelSubscription: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockSubscriptionService.cancel();

          if (response.success) {
            // Set to downgrade at renewal
            set((state) => ({
              subscription: state.subscription ? {
                ...state.subscription,
                cancelAtPeriodEnd: true,
              } : null,
              isLoading: false,
            }));

            return {
              success: true,
              message: 'Subscription will be canceled at the end of the billing period',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to cancel subscription' });
            return {
              success: false,
              message: response.error?.message || 'Failed to cancel subscription',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Restore purchase
      restorePurchase: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockSubscriptionService.restore();

          if (response.success && response.data) {
            const { subscription } = response.data;

            set({
              subscription,
              currentTier: subscription.tier,
              isTrialing: subscription.status === 'trialing',
              trialEndsAt: subscription.trialEndsAt || null,
              renewalDate: subscription.currentPeriodEnd,
              isLoading: false,
            });

            return {
              success: true,
              message: 'Purchase restored successfully',
            };
          } else {
            set({ isLoading: false });
            return {
              success: false,
              message: response.error?.message || 'No previous purchases found',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to restore purchase';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Consume a call (decrement remaining calls)
      consumeCall: () => {
        set((state) => {
          if (state.currentTier === 'free' && state.callsRemaining > 0) {
            return {
              callsRemaining: state.callsRemaining - 1,
              callsUsedThisMonth: state.callsUsedThisMonth + 1,
            };
          } else if (state.currentTier !== 'free') {
            return {
              callsUsedThisMonth: state.callsUsedThisMonth + 1,
            };
          }
          return state;
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Get current tier features
      getCurrentFeatures: () => {
        const { currentTier } = get();
        return SUBSCRIPTION_FEATURES[currentTier];
      },

      // Check if user can make a call
      canMakeCall: () => {
        const { currentTier, callsRemaining } = get();
        return currentTier !== 'free' || callsRemaining > 0;
      },

      // Check if user has unlimited calls
      isUnlimited: () => {
        const { currentTier } = get();
        return currentTier !== 'free';
      },

      // Get days until renewal
      daysUntilRenewal: () => {
        const { renewalDate } = get();
        if (!renewalDate) return null;

        const now = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = renewal.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
      },

      // Get days until trial ends
      daysUntilTrialEnd: () => {
        const { trialEndsAt } = get();
        if (!trialEndsAt) return null;

        const now = new Date();
        const trialEnd = new Date(trialEndsAt);
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
      },
    }),
    {
      name: 'subscription-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist subscription data
        currentTier: state.currentTier,
        callsRemaining: state.callsRemaining,
        callsUsedThisMonth: state.callsUsedThisMonth,
        billingCycle: state.billingCycle,
        renewalDate: state.renewalDate,
      }),
      onRehydrateStorage: () => (state) => {
        // Reset loading states on rehydration
        if (state) {
          state.isLoading = false;
          state.error = null;
        }
      },
    }
  )
);

// Hook for subscription state
export const useSubscription = () => {
  const store = useSubscriptionStore();
  return {
    // State
    subscription: store.subscription,
    usage: store.usage,
    currentTier: store.currentTier,
    callsRemaining: store.callsRemaining,
    callsUsedThisMonth: store.callsUsedThisMonth,
    billingCycle: store.billingCycle,
    renewalDate: store.renewalDate,
    isTrialing: store.isTrialing,
    trialEndsAt: store.trialEndsAt,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    loadSubscription: store.loadSubscription,
    loadUsage: store.loadUsage,
    upgradeToPro: store.upgradeToPro,
    upgradeTier: store.upgradeTier,
    cancelSubscription: store.cancelSubscription,
    restorePurchase: store.restorePurchase,
    consumeCall: store.consumeCall,
    clearError: store.clearError,
    setLoading: store.setLoading,

    // Computed
    currentFeatures: store.getCurrentFeatures(),
    canMakeCall: store.canMakeCall(),
    isUnlimited: store.isUnlimited(),
    daysUntilRenewal: store.daysUntilRenewal(),
    daysUntilTrialEnd: store.daysUntilTrialEnd(),
  };
};

// Selector hooks for specific data
export const useCurrentTier = () => useSubscriptionStore((state) => state.currentTier);
export const useCallsRemaining = () => useSubscriptionStore((state) => state.callsRemaining);
export const useCanMakeCall = () => useSubscriptionStore((state) => state.canMakeCall());
export const useSubscriptionLoading = () => useSubscriptionStore((state) => state.isLoading);
export const useSubscriptionError = () => useSubscriptionStore((state) => state.error);

export default useSubscriptionStore;