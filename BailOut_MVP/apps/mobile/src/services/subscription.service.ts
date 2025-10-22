import {
  Subscription,
  SubscriptionUsage,
  CheckoutSessionResponse,
} from '@bailout/shared/types';

class SubscriptionService {
  private apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

  // Get current subscription
  async getSubscription(): Promise<{
    success: boolean;
    data?: {
      subscription: Subscription;
      usage: SubscriptionUsage;
    };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.apiUrl}/api/subscription`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      // });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock subscription data
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
        resetDate: subscription.currentPeriodEnd,
        unlimitedCalls: false,
      };

      return {
        success: true,
        data: { subscription, usage },
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return {
        success: false,
        error: { message: 'Failed to load subscription' },
      };
    }
  }

  // Create Stripe checkout session
  async createCheckoutSession(priceId?: string): Promise<{
    success: boolean;
    data?: CheckoutSessionResponse;
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.apiUrl}/api/subscription/checkout`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      //   body: JSON.stringify({ priceId }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock checkout session
      const sessionData: CheckoutSessionResponse = {
        sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
        url: 'https://checkout.stripe.com/pay/cs_test_123456789#fidkdWxOYHwnPyd1blpxYHZxWjA0SkJvNnNgf1V',
      };

      return {
        success: true,
        data: sessionData,
      };
    } catch (error) {
      console.error('Create checkout session error:', error);
      return {
        success: false,
        error: { message: 'Failed to create checkout session' },
      };
    }
  }

  // Handle successful payment (webhook would normally call this)
  async confirmPayment(sessionId: string): Promise<{
    success: boolean;
    data?: { subscription: Subscription };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock successful subscription creation
      const subscription: Subscription = {
        userId: 'user_123',
        tier: 'pro',
        status: 'trialing',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_' + Math.random().toString(36).substr(2, 9),
        stripeCustomerId: 'cus_' + Math.random().toString(36).substr(2, 9),
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      };

      return {
        success: true,
        data: { subscription },
      };
    } catch (error) {
      console.error('Confirm payment error:', error);
      return {
        success: false,
        error: { message: 'Failed to confirm payment' },
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(cancelAtPeriodEnd = true): Promise<{
    success: boolean;
    data?: { subscription: Subscription };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.apiUrl}/api/subscription/cancel`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      //   body: JSON.stringify({ cancelAtPeriodEnd }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock canceled subscription
      const subscription: Subscription = {
        userId: 'user_123',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123456789',
        stripeCustomerId: 'cus_123456789',
      };

      return {
        success: true,
        data: { subscription },
      };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return {
        success: false,
        error: { message: 'Failed to cancel subscription' },
      };
    }
  }

  // Reactivate canceled subscription
  async reactivateSubscription(): Promise<{
    success: boolean;
    data?: { subscription: Subscription };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock reactivated subscription
      const subscription: Subscription = {
        userId: 'user_123',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123456789',
        stripeCustomerId: 'cus_123456789',
      };

      return {
        success: true,
        data: { subscription },
      };
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      return {
        success: false,
        error: { message: 'Failed to reactivate subscription' },
      };
    }
  }

  // Restore purchase (for App Store/Google Play)
  async restorePurchase(): Promise<{
    success: boolean;
    data?: { subscription: Subscription };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual store validation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock: 80% chance of no purchase found
      if (Math.random() > 0.2) {
        return {
          success: false,
          error: { message: 'No previous purchases found on this device' },
        };
      }

      // Mock found purchase
      const subscription: Subscription = {
        userId: 'user_123',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_restored_123',
        stripeCustomerId: 'cus_123456789',
      };

      return {
        success: true,
        data: { subscription },
      };
    } catch (error) {
      console.error('Restore purchase error:', error);
      return {
        success: false,
        error: { message: 'Failed to restore purchase' },
      };
    }
  }

  // Get billing history
  async getBillingHistory(): Promise<{
    success: boolean;
    data?: {
      invoices: Array<{
        id: string;
        date: Date;
        amount: number;
        status: 'paid' | 'pending' | 'failed';
        description: string;
        downloadUrl?: string;
      }>;
    };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));

      const invoices = [
        {
          id: 'inv_123456',
          date: new Date('2024-01-15'),
          amount: 4.99,
          status: 'paid' as const,
          description: 'BailOut Pro - Monthly',
          downloadUrl: 'https://example.com/invoice-123456.pdf',
        },
        {
          id: 'inv_123455',
          date: new Date('2023-12-15'),
          amount: 4.99,
          status: 'paid' as const,
          description: 'BailOut Pro - Monthly',
          downloadUrl: 'https://example.com/invoice-123455.pdf',
        },
      ];

      return {
        success: true,
        data: { invoices },
      };
    } catch (error) {
      console.error('Get billing history error:', error);
      return {
        success: false,
        error: { message: 'Failed to load billing history' },
      };
    }
  }

  // Update payment method
  async updatePaymentMethod(): Promise<{
    success: boolean;
    data?: { setupIntentSecret: string };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual Stripe setup intent creation
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        data: {
          setupIntentSecret: 'seti_' + Math.random().toString(36).substr(2, 15),
        },
      };
    } catch (error) {
      console.error('Update payment method error:', error);
      return {
        success: false,
        error: { message: 'Failed to update payment method' },
      };
    }
  }

  // Get available plans
  async getPlans(): Promise<{
    success: boolean;
    data?: {
      plans: Array<{
        id: string;
        name: string;
        price: number;
        interval: 'month' | 'year';
        features: string[];
        stripePriceId: string;
      }>;
    };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const plans = [
        {
          id: 'pro-monthly',
          name: 'Pro Monthly',
          price: 4.99,
          interval: 'month' as const,
          features: [
            'Unlimited calls',
            'Premium AI voices',
            'Custom scenarios',
            'Priority support',
            'Advanced scheduling',
            'Voice customization',
            'Call history export',
          ],
          stripePriceId: 'price_pro_monthly_123',
        },
        {
          id: 'pro-yearly',
          name: 'Pro Yearly',
          price: 49.99,
          interval: 'year' as const,
          features: [
            'Unlimited calls',
            'Premium AI voices',
            'Custom scenarios',
            'Priority support',
            'Advanced scheduling',
            'Voice customization',
            'Call history export',
            '2 months free',
          ],
          stripePriceId: 'price_pro_yearly_123',
        },
      ];

      return {
        success: true,
        data: { plans },
      };
    } catch (error) {
      console.error('Get plans error:', error);
      return {
        success: false,
        error: { message: 'Failed to load plans' },
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;