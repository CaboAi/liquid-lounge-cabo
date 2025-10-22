export interface Subscription {
  userId: string;
  tier: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  trialEndsAt?: Date;
}

export interface SubscriptionUsage {
  callsUsedThisMonth: number;
  callsRemaining: number;
  resetDate: Date;
  unlimitedCalls: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionPricing {
  monthly: {
    price: number;
    currency: string;
    interval: 'month';
  };
  features: string[];
  trialDays: number;
}

export const SUBSCRIPTION_PRICING: Record<'free' | 'pro', SubscriptionPricing> = {
  free: {
    monthly: {
      price: 0,
      currency: 'USD',
      interval: 'month',
    },
    features: [
      '3 calls per month',
      'Basic AI voices',
      'Standard scenarios',
      'Email support',
    ],
    trialDays: 0,
  },
  pro: {
    monthly: {
      price: 4.99,
      currency: 'USD',
      interval: 'month',
    },
    features: [
      'Unlimited calls',
      'Premium AI voices',
      'Custom scenarios',
      'Priority support',
      'Advanced scheduling',
      'Voice customization',
      'Call history export',
    ],
    trialDays: 7,
  },
};

export interface SubscriptionFeatureComparison {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
}

export const FEATURE_COMPARISON: SubscriptionFeatureComparison[] = [
  {
    feature: 'Calls per month',
    free: '3',
    pro: 'Unlimited',
  },
  {
    feature: 'Voice quality',
    free: 'Basic',
    pro: 'Premium HD',
  },
  {
    feature: 'Custom scenarios',
    free: false,
    pro: true,
  },
  {
    feature: 'Support',
    free: 'Email',
    pro: 'Priority 24/7',
  },
  {
    feature: 'Advanced scheduling',
    free: false,
    pro: true,
  },
  {
    feature: 'Voice customization',
    free: false,
    pro: true,
  },
  {
    feature: 'Export history',
    free: false,
    pro: true,
  },
];