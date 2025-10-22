# BailOut System Architecture

## Overview

BailOut is built as a modern, scalable monorepo application using a microservices-oriented architecture. The system consists of a React Native mobile application, an Express.js backend API, and various third-party service integrations.

## System Components

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                       │
│                  (React Native + Expo)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Screens  │  │Components│  │ Services │  │  Store   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS/WebSocket
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│                    (Express.js)                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┬──────────┬─────────────┐
        ▼                   ▼          ▼             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
│   Auth       │  │   Call       │  │ Payment  │  │  User    │
│  Service     │  │  Service     │  │ Service  │  │ Service  │
└──────┬───────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘
       │                 │                │              │
       └─────────────────┴────────────────┴──────────────┘
                                │
                ┌───────────────┼────────────────┐
                ▼               ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │      AI AGENTS LAYER          │ │              │
        │  ┌──────────────────────────┐  │ │              │
        │  │    TRIGGER-DETECTOR      │  │ │   Backend    │
        │  │  • Signal Validation     │  │ │   Services   │
        │  │  • Context Analysis      │  │ │              │
        │  │  • Risk Assessment       │  │ │              │
        │  └──────────┬───────────────┘  │ │              │
        │            │ Validated Trigger │ │              │
        │            ▼                   │ │              │
        │  ┌──────────────────────────┐  │ │              │
        │  │   CALL-ORCHESTRATOR     │  │ │              │
        │  │  • Scenario Selection    │◄─┼─┤              │
        │  │  • Timing Coordination   │  │ │              │
        │  │  • Resource Management   │  │ │              │
        │  └──────────┬───────────────┘  │ │              │
        │            │ Voice Request     │ │              │
        │            ▼                   │ │              │
        │  ┌──────────────────────────┐  │ │              │
        │  │    VOICE-GENERATOR      │  │ │              │
        │  │  • Script Processing    │  │ │              │
        │  │  • Voice Synthesis      │  │ │              │
        │  │  • Quality Validation   │  │ │              │
        │  └──────────┬───────────────┘  │ │              │
        │            │ Audio URL         │ │              │
        └────────────┼───────────────────┘ └──────────────┘
                     ▼
                                │
                ┌───────────────┴────────────────┐
                ▼                                ▼
        ┌──────────────┐                ┌──────────────┐
        │  PostgreSQL  │                │    Redis     │
        │   Database   │                │    Cache     │
        └──────────────┘                └──────────────┘

                        External Services
        ┌──────────┬──────────┬──────────┬──────────┐
        ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Twilio  │ │ElevenLabs│ │  Stripe  │ │   Uber   │ │   Push   │
│   API    │ │   API    │ │   API    │ │   API    │ │   Notif  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## AI Agents Layer

### Overview
The BailOut platform features a sophisticated AI agents architecture that enables intelligent, parallel workflows for optimal bailout call execution. This layer consists of six specialized agents that work together to deliver rapid, contextually appropriate, and safe responses while managing personalization, payments, and safety protocols.

### Agent Architecture Benefits
- **Parallel Processing**: Simultaneous execution reduces total response time by ~23%
- **Specialized Intelligence**: Each agent optimized for specific domain expertise
- **Fault Tolerance**: Graceful degradation when individual agents encounter issues
- **Independent Scaling**: Horizontal scaling based on individual agent load patterns
- **Safety-First Design**: Comprehensive safety protocols and emergency response
- **Privacy Compliance**: GDPR and CCPA compliant personalization and data handling

### Core Agents

#### 1. Call Orchestrator Agent
**Purpose**: Central coordinator managing complete bailout call flow

**Key Capabilities**:
- Master coordination of all agent interactions and dependencies
- Context-aware scenario selection and timing optimization
- Resource management (credits, API limits, capacity)
- End-to-end quality assurance and monitoring
- Emergency response coordination and safety protocol activation

**Performance**: < 2 seconds for scenario selection and coordination
**Dependencies**: voice-generator, scenario-writer, payment-handler, user-profiler, safety-coordinator

#### 2. Voice Generator Agent
**Purpose**: Creates realistic, contextually appropriate AI voice content

**Key Capabilities**:
- Extensive persona library (family, professional, social, service)
- Natural language script processing and personalization
- High-quality voice synthesis via ElevenLabs integration
- Multi-level caching and quality optimization
- Real-time voice generation with fallback options

**Performance**: < 8 seconds for voice generation and delivery
**Voice Library**: 20+ personas across multiple emotional states and relationships

#### 3. Scenario Writer Agent
**Purpose**: Dynamic generation and personalization of bailout scenarios

**Key Capabilities**:
- Context-aware scenario generation using Claude Sonnet 4
- Dynamic personalization with user-specific variables
- Multi-category scenario library (emergency, work, family, social, safety)
- Real-time adaptation based on situational context
- Quality assurance and appropriateness validation

**Performance**: < 3 seconds for scenario generation and personalization
**Scenario Types**: Emergency, Professional, Social, Personal, Custom

#### 4. Payment Handler Agent
**Purpose**: Subscription management and billing operations

**Key Capabilities**:
- Real-time subscription tier verification and credit management
- Stripe payment processing integration with secure webhooks
- Usage tracking and billing cycle management
- Premium feature access control and entitlement validation
- Payment failure handling and retry logic

**Performance**: < 1 second for subscription validation
**Subscription Tiers**: Free (3 calls/month), Pro ($9.99/unlimited), Enterprise (custom)

#### 5. User Profiler Agent
**Purpose**: Privacy-compliant personalization and user behavior learning

**Key Capabilities**:
- Privacy-first personalization with explicit consent management
- Behavioral pattern learning and preference adaptation
- Context-aware recommendations for scenarios and voices
- GDPR and CCPA compliant data handling with automatic retention limits
- Real-time preference updates and profile optimization

**Performance**: < 1.5 seconds for profile analysis and recommendations
**Privacy Features**: Explicit consent, data minimization, automatic deletion

#### 6. Safety Coordinator Agent
**Purpose**: Comprehensive safety protocols and emergency response

**Key Capabilities**:
- Risk assessment and safety threat detection
- Emergency contact management and notification systems
- Crisis intervention protocols with professional escalation
- Privacy-compliant location sharing for emergencies
- Legal compliance with safety regulations and mandatory reporting

**Performance**: < 30 seconds for emergency response activation
**Safety Features**: Emergency contacts, panic button, check-in systems, crisis detection

### Agent Communication Flow

```
User Trigger → Call Orchestrator (coordinate) → Parallel Processing:
                      ├── Scenario Writer (generate) ──┐
                      ├── Voice Generator (synthesize) ─┤
                      ├── Payment Handler (verify) ─────┤
                      ├── User Profiler (personalize) ──┤ → Execution
                      └── Safety Coordinator (assess) ──┘
                                      ↓
                              Twilio API (execute call)
```

**Parallel Processing Optimization**:
- Traditional Sequential: 16.5 seconds total
- 6-Agent Parallel Approach: 12.5 seconds total (24% improvement)
- Emergency Mode: < 5 seconds with precomputed resources

### Agent Dependencies and Integration

#### High-Priority Dependencies (Required)
- **voice-generator**: Required for all call executions (15s timeout)
- **scenario-writer**: Required for dynamic content generation (5s timeout)
- **payment-handler**: Required for subscription validation (3s timeout)

#### Medium-Priority Dependencies (Optional)
- **user-profiler**: Enhances personalization but not required (2s timeout)
- **safety-coordinator**: Activates for high-risk situations (5s timeout)

#### Service Dependencies
- **Twilio**: Voice call execution (30s timeout)
- **User Service**: Profile and emergency contact data (5s timeout)
- **Subscription Service**: Billing and entitlement verification (5s timeout)

### Safety and Compliance Features

#### Emergency Response Protocol
1. **Risk Assessment**: Real-time safety threat evaluation
2. **Emergency Contacts**: Automated notification system with 4-tier escalation
3. **Crisis Intervention**: Professional support coordination
4. **Legal Compliance**: Mandatory reporting and regulatory adherence

#### Privacy Protection
- **Consent Management**: Granular consent for each data type and agent
- **Data Minimization**: Agents only access necessary data for their function
- **Automatic Retention**: Data automatically deleted per user preferences and legal requirements
- **Encryption**: All agent communications encrypted in transit and at rest

### Performance Monitoring and Quality Assurance

#### Agent-Specific Metrics
- **Response Time**: Per-agent performance tracking
- **Success Rate**: Agent reliability and error handling
- **Resource Usage**: Memory, CPU, and API consumption
- **Safety Effectiveness**: Emergency response success rates

#### Quality Assurance
- **Content Validation**: Scenario appropriateness and safety checks
- **Voice Quality**: Audio quality and naturalness validation
- **Payment Security**: PCI compliance and fraud detection
- **Privacy Compliance**: GDPR/CCPA adherence monitoring

### Integration with Backend Services
The agents layer integrates seamlessly with existing backend services:
- **User Service**: Profile data, emergency contacts, and preference management
- **Subscription Service**: Tier verification, credit management, and billing coordination
- **Analytics Service**: Performance tracking, usage analytics, and optimization insights
- **Notification Service**: Real-time status updates and emergency notifications
- **Legal/Compliance Service**: Regulatory compliance verification and incident reporting

For detailed agent documentation, see the [Agents Architecture Guide](../agents/README.md).

## Mobile Application Architecture

### Technology Stack
- **Framework**: React Native 0.74+ with Expo SDK 50
- **Language**: TypeScript
- **State Management**: Zustand (local), React Query (server)
- **Navigation**: React Navigation 6
- **Styling**: NativeWind (Tailwind for React Native)
- **Storage**: Expo Secure Store

### Application Structure

```
mobile/
├── screens/           # Screen components
│   ├── HomeScreen     # Main dashboard
│   ├── CallHistory    # Previous bail-outs
│   ├── Settings       # User preferences
│   └── Auth/          # Authentication screens
├── components/        # Reusable UI components
│   ├── CallTrigger    # Emergency button component
│   ├── VoiceSelector  # Voice persona picker
│   └── ScenarioCard   # Scenario template display
├── services/          # External service integrations
│   ├── api/           # Backend API client
│   ├── auth/          # Authentication logic
│   └── storage/       # Local data persistence
├── store/             # State management
│   ├── userStore      # User state
│   └── callStore      # Call state
├── hooks/             # Custom React hooks
└── utils/             # Helper functions
```

### Key Design Patterns

1. **Component Composition**: Small, focused components combined to create complex UIs
2. **Custom Hooks**: Encapsulated business logic and state management
3. **Service Layer**: Abstracted API calls and external integrations
4. **Type Safety**: Full TypeScript coverage with shared types

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT tokens
- **Validation**: Zod schemas

### Service Architecture

```
backend/
├── controllers/       # Request handlers
│   ├── authController
│   ├── callController
│   ├── userController
│   └── paymentController
├── services/          # Business logic
│   ├── twilioService  # Voice call generation
│   ├── elevenLabsService # Voice synthesis
│   ├── stripeService  # Payment processing
│   └── notificationService
├── middleware/        # Express middleware
│   ├── auth           # JWT verification
│   ├── validation     # Request validation
│   ├── rateLimit      # API rate limiting
│   └── errorHandler   # Global error handling
├── models/            # Data models
│   ├── User
│   ├── Call
│   ├── Scenario
│   └── Payment
├── routes/            # API route definitions
└── db/                # Database utilities
    ├── migrations/    # Schema migrations
    └── seeds/         # Test data
```

### API Design Principles

1. **RESTful Design**: Standard HTTP methods and status codes
2. **Versioning**: API versioned through URL path (`/api/v1`)
3. **Authentication**: Bearer token authentication with JWT
4. **Rate Limiting**: Configurable per-endpoint rate limits
5. **Error Handling**: Consistent error response format
6. **Validation**: Request/response validation with Zod

### Database Schema

```sql
-- Core Tables
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  phone_number VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

calls (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  scenario_id UUID REFERENCES scenarios,
  status VARCHAR,
  scheduled_for TIMESTAMP,
  executed_at TIMESTAMP,
  duration_seconds INTEGER
)

scenarios (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  script TEXT,
  voice_id VARCHAR,
  category VARCHAR,
  is_premium BOOLEAN
)

payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  stripe_payment_id VARCHAR,
  amount DECIMAL,
  status VARCHAR,
  created_at TIMESTAMP
)
```

## Security Architecture

### Authentication Flow

```
1. User Registration/Login
   └─> Validate credentials
   └─> Generate JWT token
   └─> Return token + refresh token

2. Authenticated Request
   └─> Extract JWT from header
   └─> Verify token signature
   └─> Check token expiration
   └─> Process request

3. Token Refresh
   └─> Validate refresh token
   └─> Generate new JWT
   └─> Rotate refresh token
```

### Security Measures

1. **Data Encryption**
   - HTTPS for all communications
   - Database encryption at rest
   - Sensitive data encrypted in Redis

2. **Authentication & Authorization**
   - JWT tokens with short expiration
   - Refresh token rotation
   - Role-based access control (RBAC)

3. **Input Validation**
   - Zod schema validation
   - SQL injection prevention
   - XSS protection

4. **Rate Limiting**
   - Per-IP rate limiting
   - Per-user rate limiting
   - DDoS protection

5. **Secure Storage**
   - Environment variables for secrets
   - Expo Secure Store for mobile
   - Encrypted database connections

## Integration Architecture

### Twilio Integration

```typescript
interface TwilioCallFlow {
  initiate(): CallSid;
  synthesizeVoice(): AudioUrl;
  executeCall(): CallStatus;
  handleCallback(): void;
}
```

**Flow:**
1. User triggers bail-out
2. Backend generates script
3. ElevenLabs synthesizes voice
4. Twilio initiates call
5. Call status tracked

### ElevenLabs Integration

```typescript
interface VoiceSynthesis {
  text: string;
  voiceId: string;
  settings: {
    stability: number;
    similarity: number;
    style: number;
  };
}
```

**Features:**
- Multiple voice personas
- Real-time synthesis
- Cached voice clips
- Emotional variations

### Stripe Integration

```typescript
interface PaymentFlow {
  createCustomer(): CustomerId;
  createSubscription(): SubscriptionId;
  processPayment(): PaymentIntent;
  handleWebhook(): void;
}
```

**Subscription Tiers:**
- Free: 3 calls/month
- Premium: Unlimited calls
- Enterprise: Custom features

## Deployment Architecture

### Infrastructure

```
Production Environment
├── Mobile App
│   ├── iOS App Store
│   └── Google Play Store
├── Backend Services
│   ├── Load Balancer
│   ├── API Servers (Auto-scaling)
│   └── Background Workers
├── Database Layer
│   ├── PostgreSQL (Primary)
│   ├── PostgreSQL (Read Replica)
│   └── Redis Cluster
└── CDN
    └── Static Assets
```

### Deployment Pipeline

1. **Development**
   - Local development
   - Unit testing
   - Integration testing

2. **Staging**
   - Deploy to staging
   - E2E testing
   - Performance testing

3. **Production**
   - Blue-green deployment
   - Health checks
   - Rollback capability

### Monitoring & Observability

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics

2. **Infrastructure Monitoring**
   - Server metrics
   - Database performance
   - API response times

3. **Logging**
   - Centralized logging
   - Log aggregation
   - Alert configuration

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Database read replicas
- Redis clustering
- CDN for static assets

### Performance Optimization
- Database query optimization
- Redis caching strategy
- API response caching
- Image optimization

### Load Handling
- Queue-based processing for calls
- Rate limiting per user/IP
- Circuit breakers for external services
- Graceful degradation

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up

# Run mobile app
pnpm dev:mobile

# Run backend
pnpm dev:backend
```

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for scalability

### CI/CD Pipeline
```yaml
pipeline:
  - lint
  - typecheck
  - test
  - build
  - deploy
```

## Future Architecture Considerations

### Microservices Migration
- Separate call service
- Independent payment service
- Voice synthesis service
- Notification service

### Real-time Features
- WebSocket for live updates
- Push notifications
- Real-time call status

### AI Enhancements
- Natural language processing
- Conversation flow AI
- Voice cloning technology
- Sentiment analysis

### International Expansion
- Multi-region deployment
- Localization support
- International phone numbers
- Currency conversion

## Technology Decisions

### Why React Native?
- Cross-platform development
- Large ecosystem
- Native performance
- Hot reload development

### Why PostgreSQL?
- ACID compliance
- Complex queries support
- JSON data types
- PostGIS for location data

### Why Redis?
- Fast caching
- Session management
- Pub/sub capabilities
- Data structures

### Why TypeScript?
- Type safety
- Better IDE support
- Reduced runtime errors
- Improved maintainability

## Conclusion

The BailOut architecture is designed to be scalable, maintainable, and secure. The modular structure allows for independent scaling of components and easy integration of new features. The use of modern technologies and best practices ensures a robust foundation for future growth.