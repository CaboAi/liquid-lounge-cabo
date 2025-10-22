# BailOut Backend API

Express.js backend API server for the BailOut AI-powered social exit strategy platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. Install dependencies:
```bash
cd apps/backend
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
# Create database
createdb bailout_db

# Run migrations (when implemented)
pnpm db:migrate

# Seed database (when implemented)
pnpm db:seed
```

4. Start the development server:
```bash
pnpm dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm start` | Start production server |
| `pnpm build` | Build TypeScript to JavaScript |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code |
| `pnpm typecheck` | Check TypeScript types |

## 🏗️ API Architecture

### Project Structure
```
src/
├── controllers/       # Request handlers
│   ├── authController.ts
│   ├── callController.ts
│   ├── userController.ts
│   └── paymentController.ts
├── services/          # Business logic
│   ├── authService.ts
│   ├── callService.ts
│   ├── twilioService.ts
│   ├── elevenLabsService.ts
│   └── stripeService.ts
├── middleware/        # Express middleware
│   ├── auth.ts
│   ├── validation.ts
│   ├── rateLimit.ts
│   └── errorHandler.ts
├── models/            # Data models
│   ├── User.ts
│   ├── Call.ts
│   ├── Scenario.ts
│   └── Payment.ts
├── routes/            # API route definitions
│   ├── auth.routes.ts
│   ├── call.routes.ts
│   ├── user.routes.ts
│   └── payment.routes.ts
├── utils/            # Utility functions
│   ├── logger.ts
│   ├── validation.ts
│   └── constants.ts
├── config/           # Configuration
│   ├── database.ts
│   ├── redis.ts
│   └── app.ts
├── db/               # Database utilities
│   ├── migrations/
│   └── seeds/
├── types/            # TypeScript types
│   └── index.ts
└── index.ts          # Application entry point
```

## 🔐 Authentication & Authorization

### JWT Authentication
```typescript
// middleware/auth.ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### User Registration & Login
```typescript
// controllers/authController.ts
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, phone } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      phone,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    next(error);
  }
};
```

## 📞 Call Management

### Call Scheduling
```typescript
// services/callService.ts
export class CallService {
  async scheduleCall(userId: string, data: ScheduleCallData): Promise<Call> {
    const { scenarioId, scheduledFor, voiceId } = data;

    // Validate user has enough credits
    const user = await User.findById(userId);
    if (!user.hasCredits()) {
      throw new Error('Insufficient credits');
    }

    // Create call record
    const call = await Call.create({
      userId,
      scenarioId,
      scheduledFor,
      voiceId,
      status: 'scheduled',
    });

    // Schedule the call execution
    await this.scheduleCallExecution(call);

    return call;
  }

  async executeCall(callId: string): Promise<void> {
    const call = await Call.findById(callId);
    if (!call) throw new Error('Call not found');

    try {
      // Update call status
      await call.updateStatus('executing');

      // Generate voice message
      const scenario = await Scenario.findById(call.scenarioId);
      const audioBuffer = await elevenLabsService.synthesizeVoice(
        scenario.script,
        call.voiceId
      );

      // Upload audio and get URL
      const audioUrl = await this.uploadAudio(audioBuffer);

      // Initiate Twilio call
      const twilioSid = await twilioService.initiateCall(
        call.user.phone,
        audioUrl
      );

      // Update call with Twilio SID
      await call.update({
        twilioSid,
        status: 'in_progress',
        executedAt: new Date(),
      });

    } catch (error) {
      await call.updateStatus('failed');
      throw error;
    }
  }
}
```

## 🔊 Voice Synthesis Integration

### ElevenLabs Service
```typescript
// services/elevenLabsService.ts
export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
  }

  async synthesizeVoice(
    text: string,
    voiceId: string,
    settings?: VoiceSettings
  ): Promise<Buffer> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
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
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('ElevenLabs synthesis error:', error);
      throw new Error('Voice synthesis failed');
    }
  }

  async getVoices(): Promise<Voice[]> {
    const response = await axios.get(`${this.baseUrl}/voices`, {
      headers: { 'xi-api-key': this.apiKey },
    });

    return response.data.voices;
  }
}
```

## 📱 Twilio Integration

### Voice Calls & SMS
```typescript
// services/twilioService.ts
export class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async initiateCall(to: string, audioUrl: string): Promise<string> {
    try {
      const call = await this.client.calls.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: audioUrl,
        statusCallback: `${process.env.API_URL}/webhooks/twilio/status`,
        statusCallbackEvent: ['initiated', 'answered', 'completed'],
      });

      return call.sid;
    } catch (error) {
      logger.error('Twilio call error:', error);
      throw new Error('Failed to initiate call');
    }
  }

  async sendSMS(to: string, body: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        body,
      });

      return message.sid;
    } catch (error) {
      logger.error('Twilio SMS error:', error);
      throw new Error('Failed to send SMS');
    }
  }

  handleStatusWebhook(data: TwilioStatusCallback): void {
    const { CallSid, CallStatus, Duration } = data;

    // Update call status in database
    Call.updateByTwilioSid(CallSid, {
      status: this.mapTwilioStatus(CallStatus),
      duration: Duration ? parseInt(Duration) : null,
      completedAt: CallStatus === 'completed' ? new Date() : null,
    });
  }
}
```

## 💳 Payment Processing

### Stripe Integration
```typescript
// services/stripeService.ts
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string, userId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async handleWebhook(body: Buffer, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'subscription.created':
        case 'subscription.updated':
          await this.updateUserSubscription(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
          break;
      }
    } catch (error) {
      logger.error('Stripe webhook error:', error);
      throw error;
    }
  }
}
```

## 🗄️ Database Models

### User Model
```typescript
// models/User.ts
export class User {
  id: string;
  email: string;
  phone: string;
  password: string;
  stripeCustomerId?: string;
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  creditsRemaining: number;
  createdAt: Date;
  updatedAt: Date;

  static async findById(id: string): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async create(data: CreateUserData): Promise<User> {
    const { email, password, phone } = data;
    const id = uuidv4();

    const result = await db.query(
      `INSERT INTO users (id, email, password, phone, credits_remaining)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, email, password, phone, 3] // Free tier gets 3 credits
    );

    return new User(result.rows[0]);
  }

  hasCredits(): boolean {
    return this.subscriptionStatus !== 'free' || this.creditsRemaining > 0;
  }

  async useCredit(): Promise<void> {
    if (this.subscriptionStatus === 'free') {
      await db.query(
        'UPDATE users SET credits_remaining = credits_remaining - 1 WHERE id = $1',
        [this.id]
      );
      this.creditsRemaining -= 1;
    }
  }
}
```

### Call Model
```typescript
// models/Call.ts
export class Call {
  id: string;
  userId: string;
  scenarioId: string;
  voiceId: string;
  status: 'scheduled' | 'executing' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  scheduledFor: Date;
  executedAt?: Date;
  completedAt?: Date;
  duration?: number;
  twilioSid?: string;
  createdAt: Date;
  updatedAt: Date;

  static async create(data: CreateCallData): Promise<Call> {
    const { userId, scenarioId, voiceId, scheduledFor } = data;
    const id = uuidv4();

    const result = await db.query(
      `INSERT INTO calls (id, user_id, scenario_id, voice_id, scheduled_for, status)
       VALUES ($1, $2, $3, $4, $5, 'scheduled') RETURNING *`,
      [id, userId, scenarioId, voiceId, scheduledFor]
    );

    return new Call(result.rows[0]);
  }

  async updateStatus(status: Call['status']): Promise<void> {
    await db.query(
      'UPDATE calls SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, this.id]
    );
    this.status = status;
  }

  static async findByUserId(userId: string): Promise<Call[]> {
    const result = await db.query(
      'SELECT * FROM calls WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(row => new Call(row));
  }
}
```

## 🛡️ Security & Validation

### Request Validation
```typescript
// middleware/validation.ts
import { z } from 'zod';

const CreateCallSchema = z.object({
  scenarioId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  voiceId: z.string(),
  customMessage: z.string().max(500).optional(),
});

export const validateCreateCall = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    CreateCallSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.errors,
    });
  }
};
```

### Rate Limiting
```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const callLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 calls per minute
  keyGenerator: (req) => req.user?.userId || req.ip,
});
```

## 📊 Logging & Monitoring

### Winston Logger Configuration
```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bailout-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };
```

### Request Logging Middleware
```typescript
// middleware/requestLogger.ts
import morgan from 'morgan';
import { logger } from '../utils/logger';

export const requestLogger = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
});
```

## 🧪 Testing

### Controller Testing
```typescript
// controllers/__tests__/authController.test.ts
import request from 'supertest';
import app from '../../app';

describe('Auth Controller', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should return 400 for duplicate email', async () => {
      // Create user first
      await User.create({
        email: 'test@example.com',
        password: 'hashed',
        phone: '+1234567890',
      });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });
});
```

### Service Testing
```typescript
// services/__tests__/callService.test.ts
import { CallService } from '../callService';
import { mockElevenLabs, mockTwilio } from '../../__mocks__';

describe('CallService', () => {
  let callService: CallService;

  beforeEach(() => {
    callService = new CallService();
  });

  describe('scheduleCall', () => {
    it('should schedule a call successfully', async () => {
      const callData = {
        scenarioId: 'scenario-123',
        scheduledFor: new Date('2024-01-01T10:00:00Z'),
        voiceId: 'voice-456',
      };

      const call = await callService.scheduleCall('user-123', callData);

      expect(call.status).toBe('scheduled');
      expect(call.userId).toBe('user-123');
    });

    it('should throw error for insufficient credits', async () => {
      // Mock user with no credits
      const mockUser = { hasCredits: () => false };
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      await expect(
        callService.scheduleCall('user-123', {})
      ).rejects.toThrow('Insufficient credits');
    });
  });
});
```

## 🚀 Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

### Environment Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/bailout
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=bailout
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Scripts
```bash
# Build and deploy
npm run build
npm run start

# Database migrations
npm run db:migrate

# Health check
curl http://localhost:3000/health
```

## 📋 API Documentation

### Base URL
```
Production: https://api.bailout.app
Development: http://localhost:3000
```

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Core Endpoints

#### Authentication
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

#### Calls
```typescript
GET    /api/calls           # Get call history
POST   /api/calls/schedule  # Schedule a new call
DELETE /api/calls/:id       # Cancel a call
GET    /api/calls/:id       # Get call details
```

#### Users
```typescript
GET    /api/users/profile   # Get user profile
PUT    /api/users/profile   # Update user profile
POST   /api/users/credits   # Purchase credits
```

#### Scenarios
```typescript
GET    /api/scenarios       # Get available scenarios
GET    /api/scenarios/:id   # Get scenario details
POST   /api/scenarios       # Create custom scenario
```

#### Webhooks
```typescript
POST   /webhooks/twilio/status  # Twilio status updates
POST   /webhooks/stripe         # Stripe payment events
```

### Error Response Format
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation details"
  }
}
```

## 🔧 Environment Variables

### Required Variables
```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bailout
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Third-party APIs
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

ELEVENLABS_API_KEY=xxxxxxxxx

STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Twilio API Reference](https://www.twilio.com/docs/api)
- [ElevenLabs API Documentation](https://docs.elevenlabs.io)
- [Stripe API Documentation](https://stripe.com/docs/api)