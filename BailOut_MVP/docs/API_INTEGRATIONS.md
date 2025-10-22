# API Integrations Guide

This document provides detailed information about integrating third-party APIs into the BailOut application.

## Table of Contents
- [Twilio Integration](#twilio-integration)
- [ElevenLabs Integration](#elevenlabs-integration)
- [Stripe Integration](#stripe-integration)
- [Uber API Integration](#uber-api-integration)
- [Push Notifications](#push-notifications)

## Twilio Integration

### Overview
Twilio powers our voice calling and SMS capabilities, enabling realistic bail-out calls and text messages.

### Setup

1. **Account Creation**
   - Sign up at [Twilio Console](https://www.twilio.com/console)
   - Verify your email and phone number
   - Note your Account SID and Auth Token

2. **Phone Number Purchase**
   - Navigate to Phone Numbers > Buy a Number
   - Choose a local number with Voice and SMS capabilities
   - Configure webhook URLs for voice and messaging

3. **Environment Variables**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WEBHOOK_URL=https://your-domain.com/webhooks/twilio
   ```

### Implementation

#### Initiating a Voice Call

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const initiateCall = async (
  to: string,
  audioUrl: string,
  callbackUrl?: string
): Promise<string> => {
  try {
    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: audioUrl, // TwiML or audio file URL
      method: 'GET',
      statusCallback: callbackUrl,
      statusCallbackEvent: ['initiated', 'answered', 'completed'],
    });

    return call.sid;
  } catch (error) {
    console.error('Twilio call error:', error);
    throw error;
  }
};
```

#### Sending SMS Messages

```typescript
export const sendSMS = async (
  to: string,
  body: string
): Promise<string> => {
  try {
    const message = await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });

    return message.sid;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw error;
  }
};
```

#### Webhook Handler

```typescript
export const twilioWebhook = (req: Request, res: Response): void => {
  const { CallSid, CallStatus, From, To, Duration } = req.body;

  // Log call status
  console.log(`Call ${CallSid} status: ${CallStatus}`);

  // Update database
  updateCallStatus(CallSid, CallStatus, Duration);

  // Respond with empty TwiML
  res.type('text/xml');
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
};
```

### TwiML for Dynamic Calls

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello, this is an emergency call for John.</Say>
  <Play>https://your-domain.com/audio/emergency-message.mp3</Play>
  <Pause length="2"/>
  <Say>Please come immediately.</Say>
  <Hangup/>
</Response>
```

### Best Practices

1. **Security**
   - Validate webhook signatures
   - Use environment variables for credentials
   - Implement rate limiting

2. **Error Handling**
   - Implement retry logic
   - Log all API responses
   - Handle Twilio-specific errors

3. **Cost Management**
   - Monitor usage through Twilio Console
   - Set up usage triggers
   - Implement call duration limits

## ElevenLabs Integration

### Overview
ElevenLabs provides AI voice synthesis for creating realistic voice messages with various personas.

### Setup

1. **Account Creation**
   - Sign up at [ElevenLabs](https://elevenlabs.io)
   - Subscribe to appropriate tier
   - Get API key from profile settings

2. **Voice Selection**
   - Browse available voices
   - Note voice IDs for your chosen voices
   - Test voices in the playground

3. **Environment Variables**
   ```env
   ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ELEVENLABS_DEFAULT_VOICE_ID=xxxxxxxxxxxxxx
   ```

### Implementation

#### Text-to-Speech Synthesis

```typescript
import axios from 'axios';
import fs from 'fs';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export const synthesizeVoice = async (
  text: string,
  voiceId: string,
  settings?: VoiceSettings
): Promise<Buffer> => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    const response = await axios.post(
      url,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings || {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('ElevenLabs synthesis error:', error);
    throw error;
  }
};
```

#### Streaming Audio

```typescript
export const streamVoice = async (
  text: string,
  voiceId: string
): Promise<ReadableStream> => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      optimize_streaming_latency: 3,
    }),
  });

  return response.body;
};
```

#### Voice Management

```typescript
export const getVoices = async (): Promise<Voice[]> => {
  const response = await axios.get(
    'https://api.elevenlabs.io/v1/voices',
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    }
  );

  return response.data.voices;
};
```

### Voice Personas for BailOut

```typescript
export const VOICE_PERSONAS = {
  professional: {
    id: 'voice_id_1',
    name: 'Sarah (Professional)',
    description: 'Boss or colleague voice',
    settings: {
      stability: 0.85,
      similarity_boost: 0.80,
      style: 0.20,
    },
  },
  casual: {
    id: 'voice_id_2',
    name: 'Mike (Friend)',
    description: 'Casual friend voice',
    settings: {
      stability: 0.70,
      similarity_boost: 0.75,
      style: 0.50,
    },
  },
  urgent: {
    id: 'voice_id_3',
    name: 'Emma (Emergency)',
    description: 'Urgent family member',
    settings: {
      stability: 0.60,
      similarity_boost: 0.85,
      style: 0.80,
    },
  },
};
```

### Best Practices

1. **Performance**
   - Cache synthesized audio
   - Use streaming for real-time
   - Implement request queuing

2. **Quality**
   - Test voice settings thoroughly
   - Use appropriate models
   - Handle different languages

3. **Cost Optimization**
   - Monitor character usage
   - Cache common phrases
   - Use efficient text processing

## Stripe Integration

### Overview
Stripe handles payment processing for premium subscriptions and one-time purchases.

### Setup

1. **Account Creation**
   - Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
   - Complete business verification
   - Set up tax settings

2. **API Keys**
   - Get publishable and secret keys
   - Set up webhook endpoints
   - Configure webhook signing secret

3. **Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
   ```

### Implementation

#### Customer Creation

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const createCustomer = async (
  email: string,
  userId: string
): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
};
```

#### Subscription Management

```typescript
export const createSubscription = async (
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
};

export const cancelSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.cancel(subscriptionId);
};
```

#### Payment Intent

```typescript
export const createPaymentIntent = async (
  amount: number,
  currency: string,
  customerId?: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};
```

#### Webhook Handler

```typescript
export const stripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'subscription.created':
    case 'subscription.updated':
    case 'subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscriptionStatus(subscription);
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailure(invoice);
      break;
  }

  res.json({ received: true });
};
```

### Subscription Tiers

```typescript
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    priceId: null,
    features: {
      callsPerMonth: 3,
      voiceOptions: 1,
      customScripts: false,
      prioritySupport: false,
    },
  },
  premium: {
    name: 'Premium',
    priceId: 'price_premium_monthly',
    price: 999, // $9.99
    features: {
      callsPerMonth: -1, // Unlimited
      voiceOptions: 10,
      customScripts: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    priceId: 'price_enterprise_monthly',
    price: 4999, // $49.99
    features: {
      callsPerMonth: -1,
      voiceOptions: -1, // All voices
      customScripts: true,
      prioritySupport: true,
      apiAccess: true,
      customVoice: true,
    },
  },
};
```

## Uber API Integration

### Overview
Uber API integration allows users to quickly request rides as part of their exit strategy.

### Setup

1. **Developer Account**
   - Register at [Uber Developers](https://developer.uber.com)
   - Create an app
   - Get OAuth credentials

2. **Environment Variables**
   ```env
   UBER_CLIENT_ID=xxxxxxxxxxxxxx
   UBER_CLIENT_SECRET=xxxxxxxxxxxxxx
   UBER_SERVER_TOKEN=xxxxxxxxxxxxxx
   ```

### Implementation

#### OAuth Flow

```typescript
export const getUberAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: process.env.UBER_CLIENT_ID,
    response_type: 'code',
    scope: 'request request_receipt',
    redirect_uri: 'https://your-domain.com/auth/uber/callback',
    state,
  });

  return `https://login.uber.com/oauth/v2/authorize?${params}`;
};

export const exchangeToken = async (code: string): Promise<string> => {
  const response = await axios.post(
    'https://login.uber.com/oauth/v2/token',
    {
      client_id: process.env.UBER_CLIENT_ID,
      client_secret: process.env.UBER_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://your-domain.com/auth/uber/callback',
    }
  );

  return response.data.access_token;
};
```

#### Ride Estimates

```typescript
export const getRideEstimates = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  accessToken: string
): Promise<RideEstimate[]> => {
  const response = await axios.get(
    'https://api.uber.com/v1.2/estimates/price',
    {
      params: {
        start_latitude: startLat,
        start_longitude: startLng,
        end_latitude: endLat,
        end_longitude: endLng,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.prices;
};
```

#### Request Ride

```typescript
export const requestRide = async (
  productId: string,
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  accessToken: string
): Promise<RideRequest> => {
  const response = await axios.post(
    'https://api.uber.com/v1.2/requests',
    {
      product_id: productId,
      start_latitude: startLat,
      start_longitude: startLng,
      end_latitude: endLat,
      end_longitude: endLng,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};
```

## Push Notifications

### Overview
Push notifications keep users informed about bail-out call status and important updates.

### Expo Push Notifications Setup

#### Token Registration

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const registerForPushNotifications = async (): Promise<string> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Failed to get push token');
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to backend
  await saveTokenToBackend(token);

  return token;
};
```

#### Notification Handling

```typescript
// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Handle notification received
Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notification received:', notification);
});

// Handle notification response
Notifications.addNotificationResponseReceivedListener((response) => {
  const { data } = response.notification.request.content;

  // Navigate based on notification data
  if (data.type === 'call_completed') {
    navigation.navigate('CallHistory', { callId: data.callId });
  }
});
```

#### Backend Implementation

```typescript
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid push token: ${pushToken}`);
    return;
  }

  const messages = [{
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
  }];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  // Check receipts later
  setTimeout(() => checkReceipts(tickets), 15000);
};

const checkReceipts = async (tickets: any[]): Promise<void> => {
  const receiptIds = tickets
    .filter(ticket => ticket.id)
    .map(ticket => ticket.id);

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of receiptIdChunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const receiptId in receipts) {
      const { status, message, details } = receipts[receiptId];

      if (status === 'error') {
        console.error(`Error sending notification: ${message}`);

        if (details?.error) {
          // Handle specific errors
          if (details.error === 'DeviceNotRegistered') {
            // Remove invalid token from database
            await removeInvalidToken(receiptId);
          }
        }
      }
    }
  }
};
```

### Notification Types

```typescript
export enum NotificationType {
  CALL_SCHEDULED = 'call_scheduled',
  CALL_INITIATED = 'call_initiated',
  CALL_COMPLETED = 'call_completed',
  CALL_FAILED = 'call_failed',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  PAYMENT_FAILED = 'payment_failed',
  LOW_CREDITS = 'low_credits',
}

export const notificationTemplates = {
  [NotificationType.CALL_SCHEDULED]: {
    title: 'Bail-out Scheduled',
    body: 'Your bail-out call is scheduled for {time}',
  },
  [NotificationType.CALL_INITIATED]: {
    title: 'Calling Now',
    body: 'Your bail-out call is being placed',
  },
  [NotificationType.CALL_COMPLETED]: {
    title: 'Call Complete',
    body: 'Your bail-out call lasted {duration}',
  },
  // ... more templates
};
```

## Error Handling

### Unified Error Handler

```typescript
export class IntegrationError extends Error {
  constructor(
    public service: string,
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export const handleIntegrationError = (
  error: any,
  service: string
): void => {
  // Log to monitoring service
  logger.error({
    service,
    error: error.message,
    stack: error.stack,
    metadata: error.response?.data,
  });

  // Send alert if critical
  if (isCriticalError(error)) {
    sendAlert({
      service,
      error: error.message,
      severity: 'critical',
    });
  }

  // Return user-friendly error
  throw new IntegrationError(
    service,
    error.code || 'UNKNOWN',
    getUserFriendlyMessage(error),
    error
  );
};
```

## Rate Limiting

### Implementation

```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const integrationLimiter = {
  twilio: rateLimit({
    windowMs: 60 * 1000,
    max: 10, // 10 calls per minute
  }),
  elevenLabs: rateLimit({
    windowMs: 60 * 1000,
    max: 20, // 20 synthesis requests per minute
  }),
  stripe: rateLimit({
    windowMs: 60 * 1000,
    max: 30, // 30 payment operations per minute
  }),
};
```

## Testing Integrations

### Mock Services

```typescript
export const mockTwilio = {
  calls: {
    create: jest.fn().mockResolvedValue({
      sid: 'CALL123',
      status: 'queued',
    }),
  },
  messages: {
    create: jest.fn().mockResolvedValue({
      sid: 'MSG123',
      status: 'sent',
    }),
  },
};

export const mockElevenLabs = {
  synthesize: jest.fn().mockResolvedValue(
    Buffer.from('mock audio data')
  ),
};

export const mockStripe = {
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_123',
    }),
  },
  subscriptions: {
    create: jest.fn().mockResolvedValue({
      id: 'sub_123',
      status: 'active',
    }),
  },
};
```

## Monitoring & Logging

### Integration Metrics

```typescript
export const trackIntegrationMetric = (
  service: string,
  operation: string,
  success: boolean,
  duration: number
): void => {
  metrics.track({
    metric: 'integration.request',
    dimensions: {
      service,
      operation,
      success: success.toString(),
    },
    value: duration,
  });
};

// Usage
const start = Date.now();
try {
  const result = await twilioClient.calls.create(params);
  trackIntegrationMetric('twilio', 'create_call', true, Date.now() - start);
  return result;
} catch (error) {
  trackIntegrationMetric('twilio', 'create_call', false, Date.now() - start);
  throw error;
}
```

## Best Practices Summary

1. **Security**
   - Store API keys in environment variables
   - Validate webhook signatures
   - Implement proper authentication
   - Use HTTPS for all communications

2. **Reliability**
   - Implement retry logic with exponential backoff
   - Use circuit breakers for failing services
   - Cache responses when appropriate
   - Have fallback mechanisms

3. **Performance**
   - Use connection pooling
   - Implement request queuing
   - Cache frequently used data
   - Monitor API rate limits

4. **Monitoring**
   - Log all API interactions
   - Track success/failure rates
   - Monitor response times
   - Set up alerts for failures

5. **Cost Management**
   - Monitor API usage
   - Implement usage limits
   - Cache expensive operations
   - Use webhooks instead of polling

6. **Development**
   - Use sandbox/test environments
   - Mock external services in tests
   - Document all integrations
   - Keep SDKs updated