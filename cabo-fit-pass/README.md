# 🏋️‍♀️ CaboFitPass

**Your Comprehensive Fitness Journey Platform in Los Cabos**

[![CI Pipeline](https://github.com/caboai/cabo-fit-pass/actions/workflows/ci.yml/badge.svg)](https://github.com/caboai/cabo-fit-pass/actions/workflows/ci.yml)
[![Deploy to Production](https://github.com/caboai/cabo-fit-pass/actions/workflows/deploy.yml/badge.svg)](https://github.com/caboai/cabo-fit-pass/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

CaboFitPass is a modern, accessible, and user-friendly fitness class booking platform designed specifically for Los Cabos. Book classes, manage memberships, track your fitness journey, and discover the best fitness studios in paradise.

## 🌟 Features

### 🎯 Core Features
- **Class Booking System**: Real-time class scheduling with waitlist management
- **Multi-Studio Support**: Browse and book classes across multiple fitness studios
- **Credit-Based System**: Flexible payment system with various credit packages
- **User Profiles**: Personalized fitness tracking and booking history
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Real-time Updates**: Live class availability and booking confirmations

### 💳 Payment & Credits
- **Stripe Integration**: Secure payment processing
- **Flexible Credit Packages**: Various options from single classes to monthly unlimited
- **Automatic Refunds**: Smart refund system for cancellations
- **Subscription Management**: Recurring payment options

### 🎨 User Experience
- **Accessible Design**: WCAG 2.1 AA compliant with screen reader support
- **Dark/Light Mode**: Automatic theme detection with manual override
- **Offline Support**: Progressive Web App with offline capabilities
- **Multi-language**: English and Spanish language support
- **Touch Optimized**: 44px minimum touch targets for mobile accessibility

### 📊 Analytics & Management
- **Studio Dashboard**: Comprehensive analytics for studio owners
- **Booking Analytics**: Track popular classes and peak times
- **Revenue Reporting**: Financial insights and reporting tools
- **User Engagement**: Member activity and retention metrics

### 🔒 Security & Privacy
- **Supabase Authentication**: Secure user authentication with social logins
- **Row Level Security**: Database-level security for user data protection
- **GDPR Compliant**: Privacy-first approach with data export/deletion
- **Audit Logging**: Complete audit trail for all transactions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Supabase** account for backend services
- **Stripe** account for payments (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/caboai/cabo-fit-pass.git
   cd cabo-fit-pass
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=CaboFitPass
   NEXT_PUBLIC_SUPPORT_EMAIL=support@cabofitpass.com
   
   # Payment Processing (Optional)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Email Service (Optional)
   RESEND_API_KEY=your_resend_api_key
   
   # File Uploads (Optional)
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   
   # AI Services (Optional)
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Development Guide

### 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Payments**: [Stripe](https://stripe.com/)
- **Email**: [Resend](https://resend.com/)
- **File Uploads**: [UploadThing](https://uploadthing.com/)
- **State Management**: React Context + Custom Hooks
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: [Vercel](https://vercel.com/)

### 📁 Project Structure

```
cabo-fit-pass/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Layout components
│   │   ├── forms/             # Form components
│   │   ├── cards/             # Card components
│   │   ├── accessibility/     # Accessibility components
│   │   └── error/             # Error handling components
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-auth.ts        # Authentication hook
│   │   ├── use-classes.ts     # Classes data hook
│   │   └── use-bookings.ts    # Bookings data hook
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/          # Supabase client and utilities
│   │   ├── stripe/            # Stripe utilities
│   │   ├── utils/             # General utilities
│   │   └── validations/       # Zod schemas
│   ├── types/                 # TypeScript type definitions
│   │   ├── database.ts        # Database types
│   │   ├── api.ts             # API types
│   │   └── components.ts      # Component prop types
│   └── config/                # Configuration files
│       ├── constants.ts       # App constants
│       ├── env.ts             # Environment validation
│       └── features.ts        # Feature flags
├── public/                    # Static assets
├── scripts/                   # Build and utility scripts
├── tests/                     # Test files
│   ├── __mocks__/            # Test mocks
│   ├── e2e/                  # End-to-end tests
│   ├── integration/          # Integration tests
│   └── unit/                 # Unit tests
├── .github/                   # GitHub Actions workflows
├── docker/                    # Docker configuration
└── docs/                      # Documentation
```

### 🎯 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test suites
   npm run test:unit
   npm run test:integration
   npm run test:e2e
   
   # Run accessibility tests
   npm run test:a11y
   ```

4. **Check code quality**
   ```bash
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   
   # Type check
   npm run type-check
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### 🧪 Testing

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions and API endpoints
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance
- **Performance Tests**: Monitor bundle size and runtime performance

```bash
# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run accessibility audit
npm run test:a11y
```

### 🎨 Design System

CaboFitPass uses a comprehensive design system built on:

- **Shadcn/ui Components**: Pre-built, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Design Tokens**: Consistent spacing, colors, and typography
- **Accessibility First**: WCAG 2.1 AA compliant components
- **Mobile First**: Responsive design optimized for mobile devices

#### Color Palette
- **Primary**: Blue tones representing ocean and sky
- **Secondary**: Warm sand and coral colors
- **Accent**: Vibrant tropical colors
- **Neutral**: Balanced grays for readability

#### Typography
- **Headings**: Inter font family
- **Body**: System font stack for performance
- **Monospace**: JetBrains Mono for code

## 🚀 Deployment

### Vercel (Recommended)

CaboFitPass is optimized for deployment on Vercel:

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on git push to main**

### Docker Deployment

For containerized deployments:

```bash
# Build the Docker image
docker build -t cabo-fit-pass .

# Run with environment variables
docker run -p 3000:3000 --env-file .env cabo-fit-pass

# Or use Docker Compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 API Documentation

### Authentication Endpoints

```typescript
// Sign up
POST /api/auth/signup
{
  email: string
  password: string
  full_name: string
}

// Sign in
POST /api/auth/signin
{
  email: string
  password: string
}

// Sign out
POST /api/auth/signout
```

### Classes Endpoints

```typescript
// Get all classes
GET /api/classes
Query: {
  studio_id?: string
  date?: string
  category?: string
  limit?: number
  offset?: number
}

// Get class by ID
GET /api/classes/[id]

// Book a class
POST /api/classes/[id]/book
{
  user_id: string
  credits_to_use: number
}

// Cancel booking
DELETE /api/classes/[id]/book
```

### Studios Endpoints

```typescript
// Get all studios
GET /api/studios
Query: {
  location?: string
  search?: string
  limit?: number
}

// Get studio by ID
GET /api/studios/[id]

// Get studio classes
GET /api/studios/[id]/classes
```

### Credits Endpoints

```typescript
// Get user credits
GET /api/credits

// Purchase credits
POST /api/credits/purchase
{
  package_id: string
  payment_method: string
}

// Credit history
GET /api/credits/history
```

### Webhooks

```typescript
// Stripe webhook
POST /api/webhooks/stripe

// Supabase webhook
POST /api/webhooks/supabase
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application URL | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | 🟡 |
| `STRIPE_SECRET_KEY` | Stripe secret key | 🟡 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | 🟡 |
| `RESEND_API_KEY` | Resend email API key | 🟡 |
| `UPLOADTHING_SECRET` | UploadThing secret | 🟡 |
| `OPENAI_API_KEY` | OpenAI API key | 🟡 |

✅ Required | 🟡 Optional (for full functionality)

### Feature Flags

CaboFitPass uses feature flags for controlled rollout:

```typescript
// In config/features.ts
export const FEATURES = {
  STRIPE_PAYMENTS: process.env.NODE_ENV === 'production',
  AI_RECOMMENDATIONS: false,
  SOCIAL_SHARING: true,
  DARK_MODE: true,
  OFFLINE_MODE: true,
}
```

### Database Schema

The application uses Supabase with the following main tables:

- **users**: User profiles and authentication
- **studios**: Fitness studios and their information
- **classes**: Fitness classes with scheduling
- **bookings**: User class bookings
- **credits**: User credit transactions
- **packages**: Available credit packages

See `supabase/migrations/` for complete schema definitions.

## 🤝 Contributing

We welcome contributions to CaboFitPass! Please follow these guidelines:

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (Prettier + ESLint)
- Write meaningful commit messages using [Conventional Commits](https://conventionalcommits.org/)
- Add tests for new features
- Update documentation for API changes

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests and ensure they pass
5. Update documentation
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🐛 Bug Reports

If you find a bug, please create an issue with:

- **Clear description** of the problem
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Browser/device** information
- **Error messages** or logs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Vercel** for hosting and deployment platform
- **Supabase** for the backend infrastructure
- **Next.js** team for the amazing framework
- **Los Cabos** fitness community for inspiration

## 📞 Support

- **Documentation**: [docs.cabofitpass.com](https://docs.cabofitpass.com)
- **Email**: [support@cabofitpass.com](mailto:support@cabofitpass.com)
- **GitHub Issues**: [Report a bug](https://github.com/caboai/cabo-fit-pass/issues)
- **Discord**: [Join our community](https://discord.gg/cabofitpass)

## 🎯 Roadmap

### Version 2.0 (Q2 2024)
- [ ] Mobile App (React Native)
- [ ] AI-Powered Class Recommendations
- [ ] Social Features and Community
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support (Spanish)

### Version 2.1 (Q3 2024)
- [ ] Wearable Device Integration
- [ ] Nutrition Tracking
- [ ] Virtual Classes Support
- [ ] Gamification Features
- [ ] Instructor Portal

### Version 3.0 (Q4 2024)
- [ ] Marketplace for Equipment
- [ ] Corporate Wellness Programs
- [ ] API for Third-party Integrations
- [ ] Advanced Reporting Tools
- [ ] White-label Solutions

---

<div align="center">
  <p><strong>Built with ❤️ in Los Cabos 🌴</strong></p>
  <p>
    <a href="https://cabofitpass.com">Website</a> •
    <a href="https://docs.cabofitpass.com">Documentation</a> •
    <a href="https://github.com/caboai/cabo-fit-pass/issues">Issues</a> •
    <a href="https://discord.gg/cabofitpass">Discord</a>
  </p>
</div>