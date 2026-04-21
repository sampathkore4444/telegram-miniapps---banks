# Telegram Mini App - Bank Growth Funnel Toolkit
## Technical Specification Document (SPEC_KILO.md)

**Version:** 1.1  
**Created:** 2026-04-20  
**Status:** In Progress  
**Last Updated:** 2026-04-21  
**Based On:** SPEC.md

---

# 🔧 TECHSTACK

This section provides a comprehensive overview of the technology stack used in the Telegram Mini App banking solution.

---

## Frontend Technologies

### Core Framework

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Vanilla JavaScript | ES2022 | UI Framework | Lightweight (5-15KB), fastest load time, no build overhead |
| HTML5 | Latest | Markup | Semantic structure, native elements |
| CSS3 | Latest | Styling | Modern features, animations, responsive design |
| Vite | 5.x | Build Tool | Fast HMR, optimized production builds (optional for bundling) |

### State Management & Data Fetching

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Native Fetch API | ES2022 | HTTP Client | Built-in, no dependencies |
| Custom Event Bus | N/A | State Management | Lightweight pub/sub for component communication |
| URLSearchParams | Native | Query Params | Parsing URL parameters |
| LocalStorage | Native | Client Storage | Persist user preferences, session data |

### UI & Styling

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Tailwind CSS | 3.x | Utility-first CSS | Rapid development, consistent design system |
| Native Dialog | Latest | Modals | Built-in modal support |
| Custom Components | N/A | Reusable UI | Lightweight custom elements |
| CSS Variables | Native | Theming | Easy dark/light mode support |

### Telegram Integration

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Telegram WebApp JS | Latest | Mini App SDK | Official Telegram WebApp API |
| Telegram Bot API | Latest | Bot Integration | Messaging, commands, webhooks |

---

## Backend Technologies

### API Layer

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Python | 3.11+ | Runtime | Modern, performant, data science friendly |
| FastAPI | 0.109+ | Web Framework | High performance, async, auto-documentation |
| Uvicorn | 0.27+ | ASGI Server | Production-ready ASGI server |
| Gunicorn | 21.x | Process Manager | Worker management for production |

### Database & Storage

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| PostgreSQL | 16.x | Primary Database | ACID compliance, complex queries, JSON support |
| Redis | 7.x | Caching & Sessions | In-memory speed, pub/sub, session store |
| SQLAlchemy | 2.x | ORM | Python ORM with type annotations |
| Alembic | 1.x | Database Migrations | Schema version control |
| Supabase | Latest | BaaS Alternative | Real-time, auth, storage for MVP |

### Message Queue & Async Processing

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| RabbitMQ | 3.x | Message Broker | Reliable delivery, routing flexibility |
| Celery | 5.x | Task Queue | Python-native, distributed task processing |
| Socket.io | 4.x | Real-time | WebSocket abstraction, rooms |

### Authentication & Security

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Python-Jose | Latest | JWT Token | Python JWT handling |
| Passlib | 1.x | Password Hashing | Secure password hashing |
| Cryptography | 41.x | Encryption | Encryption primitives |
| Starlette | Latest | Security Middleware | Built-in security features |
| rate-limit-flexible | 3.x | Rate Limiting | DDoS protection |

---

## DevOps & Infrastructure

### Containerization

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Docker | 24.x | Container Runtime | Consistent environments |
| Docker Compose | 2.x | Local Dev | Multi-container orchestration |

### Orchestration

| Technology | Version | Purpose | Justification |
|------------|---------|---------|----------------|
| Kubernetes | 1.28 | Container Orchestration | Auto-scaling, self-healing |
| Helm | 3.x | Package Manager | Kubernetes manifests management |
| ArgoCD | Latest | GitOps | Declarative, automated deployment |

### Cloud & Hosting

| Technology | Purpose | Justification |
|------------|---------|----------------|
| AWS / GCP / Azure | Cloud Provider | Choose based on regional presence |
| Cloudflare | CDN & DDoS | Edge caching, security |
| DigitalOcean | Alternative Cloud | Cost-effective for startups |

### CI/CD

| Technology | Purpose | Justification |
|------------|---------|----------------|
| GitHub Actions | CI/CD Pipeline | Integrated with repo, free tier |
| GitLab CI | Alternative CI | Self-hosted option |
| SonarQube | Code Quality | Static analysis, coverage |

---

## External Integrations

### Payment & Banking

| Integration | Type | Purpose |
|-------------|------|---------|
| KHQR / Bakong | Payment Network | Cambodia QR payments |
| Local Bank APIs | Core Banking | Account, transactions |
| Payment Gateways | PSP | Card processing, payouts |
| Credit Bureaus | CBC | Credit checks |

### Communications

| Integration | Type | Purpose |
|-------------|------|---------|
| Twilio | SMS | OTP, notifications |
| SendGrid | Email | Marketing, statements |
| Telegram API | Messaging | Bot, notifications |

### Identity & Verification

| Integration | Type | Purpose |
|-------------|------|---------|
| Stripe Identity | ID Verification | Document verification |
| Onfido | Identity Verification | Biometric, liveness |
| AWS Rekognition | Image Analysis | OCR, face detection |

---

## Development Tools

### IDE & Editor

| Tool | Purpose |
|------|---------|
| VS Code | Primary IDE |
| WebStorm | Advanced TypeScript |
| DataGrip | Database management |

### Testing

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 1.x | Unit testing (works with Vanilla JS) |
| Playwright | Latest | E2E testing |
| WebPageTest | Online | Performance testing |
| Lighthouse | Latest | Performance auditing |

### Code Quality

| Tool | Purpose |
|------|---------|
| ESLint | JavaScript linting |
| Prettier | Code formatting |
| Ruff | Python linting |
| Black | Python formatting |
| Mypy | Python type checking |
| Husky | Git hooks |
| lint-staged | Pre-commit checks |

---

## Project Structure

```
telegram-miniapp-banks/
├── apps/
│   ├── frontend/                 # Vanilla JS Mini App
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI components (web components)
│   │   │   ├── pages/            # Page modules
│   │   │   ├── services/         # API clients
│   │   │   ├── store/            # State management
│   │   │   ├── utils/            # Helper functions
│   │   │   ├── router.js         # Simple client-side router
│   │   │   ├── app.js            # Main application entry
│   │   │   └── styles/           # CSS files
│   │   ├── public/               # Public assets
│   │   │   ├── icons/            # SVG icons
│   │   │   └── images/           # Static images
│   │   ├── index.html            # Entry HTML
│   │   ├── styles/
│   │   │   ├── main.css          # Main stylesheet
│   │   │   └── variables.css     # CSS custom properties
│   │   ├── package.json
│   │   └── vite.config.js        # Vite config (optional)
│   │
│   └── backend/                  # FastAPI Application
│       ├── app/
│       │   ├── api/              # API routes
│       │   │   └── v1/           # API version 1
│       │   │       ├── endpoints/# Endpoint handlers
│       │   │       └── router.py # Router configuration
│       │   ├── core/             # Core configurations
│       │   │   ├── config.py     # Application settings
│       │   │   ├── security.py   # Authentication & security
│       │   │   └── constants.py  # Application constants
│       │   ├── db/               # Database
│       │   │   ├── base.py       # Base classes
│       │   │   ├── session.py    # Database sessions
│       │   │   └── models/       # SQLAlchemy models
│       │   ├── schemas/          # Pydantic schemas
│       │   │   ├── user/         # User schemas
│       │   │   ├── loan/         # Loan schemas
│       │   │   └── common/       # Shared schemas
│       │   ├── services/         # Business logic
│       │   ├── tasks/            # Celery tasks
│       │   └── utils/            # Utility functions
│       ├── alembic/              # Database migrations
│       ├── tests/                # Test files
│       ├── docker/               # Docker configs
│       ├── requirements.txt      # Python dependencies
│       ├── main.py               # Application entry point
│       └── .env.example          # Environment template
│
├── packages/
│   ├── shared/                   # Shared types/utils
│   └── config/                   # Shared configuration
│
├── infrastructure/               # DevOps configs
│   ├── kubernetes/
│   ├── docker/
│   └── terraform/
│
├── docs/                         # Documentation
│
├── .github/                      # GitHub workflows
│
├── docker-compose.yml
├── package.json
└── turbo.json                    # Turborepo config
```

---

## Environment Configuration

### Development Environment

```env
# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_TELEGRAM_BOT_TOKEN=your_bot_token

# Backend
PYTHON_ENV=development
APP_ENV=development
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key
```

### Production Environment

```env
# Frontend
VITE_API_URL=https://api.yourbank.com
VITE_WS_URL=wss://api.yourbank.com
VITE_TELEGRAM_BOT_TOKEN=prod_bot_token

# Backend
PYTHON_ENV=production
APP_ENV=production
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://user:pass@prod-db:5432/db
REDIS_URL=redis://prod-redis:6379
SECRET_KEY=prod_secret_key
ENCRYPTION_KEY=prod_encryption_key
```

---

## Technology Decision Summary

| Category | Choice | Rationale |
|----------|--------|----------|
| Frontend Framework | Vanilla JS | Lightweight (5-15KB), fastest load, no framework overhead |
| Styling | Tailwind CSS | Speed, consistency |
| Build Tool | Vite (optional) | Fast builds if needed, or use native ES modules |
| Backend Framework | FastAPI | High performance, async, auto-docs |
| Language | Python 3.11+ | Modern features, extensive libraries |
| Database | PostgreSQL | Reliability, features |
| Cache | Redis | Performance |
| Queue | Celery + RabbitMQ | Python-native task processing |
| Container | Docker | Portability |
| Cloud | AWS/GCP | Regional presence |

---

# 📋 Executive Summary

This document provides a comprehensive technical specification for building a **Telegram Mini App** that serves as a conversion engine for banking services. Rather than building a full banking application within Telegram, this solution focuses on acquisition, activation, and engagement - creating a low-friction funnel that converts users into full banking customers.

The mini app targets Southeast Asian markets, with specific focus on Cambodia (KHQR ecosystem) and Laos, leveraging Telegram's massive regional adoption (approximately 10 million active users in Cambodia alone).

---

# 🎯 Project Overview

## Core Concept
Transform Telegram from just a messaging platform into a **smart acquisition funnel** that:

1. Captures user intent early through interactive tools
2. Reduces onboarding friction with progressive KYC
3. Drives viral growth through gamified referrals
4. Builds trust through transparency and engagement
5. Seamlessly transitions users to full banking apps

## Strategic Objectives

| Objective | Success Metric |
|-----------|----------------|
| Increase account applications | 40% conversion from mini app to app |
| Reduce KYC drop-off rate | From 65% to under 30% |
| Drive referral growth | 3x increase in refer-a-friend signups |
| Improve customer trust | 25% reduction in support tickets |
| Enable instant lending | 80% of loans processed within 24 hours |

---

# 🏗️ Technical Architecture

## System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TELEGRAM PLATFORM                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Bot API    │  │ Mini App JS  │  │   Webhooks   │              │
│  │   Handler    │  │   Interface  │  │   Receiver   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  API Gateway │  │  Auth Svc    │  │  User Svc    │              │
│  │   (REST/WS)  │  │  (JWT/OAuth) │  │  (Profile)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  KYC Svc     │  │  Loan Svc    │  │ Referral Svc │              │
│  │  (Document) │  │  (Lending)    │  │  (Viral)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Reward Svc  │  │  Payment Svc  │  │ Notify Svc   │              │
│  │  (Wallet)    │  │  (KHQR/API)  │  │  (Push)       │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │Core Banking  │  │  KHQR/Bakong │  │  Credit Bureau│             │
│  │   System    │  │    Network   │  │    (CBC)      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Payment   │  │   Identity   │  │   Analytics  │              │
│  │  Gateways   │  │   Providers  │  │   Platform   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Justification |
|-------|-------------|----------------|
| Frontend (Mini App) | Vanilla JavaScript | Lightweight, fastest load time, no build overhead |
| State Management | Custom Event Bus | Lightweight pub/sub for component communication |
| Styling | Tailwind CSS | Rapid UI development |
| Backend API | Node.js + NestJS | Scalable, modular architecture |
| Database | PostgreSQL + Redis | ACID compliance + caching |
| Message Queue | RabbitMQ | Async task processing |
| Authentication | JWT + Telegram Session | Secure, stateless auth |
| Container | Docker + Kubernetes | Production-grade deployment |

## API Communication Flow

```typescript
// Mini App to Backend Communication
interface ApiClient {
  // REST endpoints
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  
  // WebSocket for real-time updates
  subscribe(event: string, callback: (data: any) => void): void;
}

// Telegram-specific authentication
interface TelegramAuth {
  initData: string; // Telegram WebApp initData
  userId: number;
  username?: string;
}
```

---

# 📱 Feature Specifications

## Phase 1: Acquisition & Lead Capture

### 1.1 Interactive Eligibility Checker

**Description:** Real-time account/loan eligibility assessment without hard credit pulls.

**User Flow:**
1. User opens "Check Eligibility" from bot menu
2. Mini app presents 3-5 simple questions:
   - Country of residence
   - Employment type (salaried/self-employed/business)
   - Monthly income range
   - Purpose (account/loan/credit)
3. System performs soft check against rules engine
4. Returns instant result: "You're eligible!" or "More info needed"

**Technical Implementation:**

```typescript
interface EligibilityRequest {
  country: 'KH' | 'LA' | 'MM' | 'TH';  // Cambodia, Laos, Myanmar, Thailand
  employmentType: 'salaried' | 'self_employed' | 'business_owner' | 'freelancer';
  monthlyIncome: number;
  purpose: 'savings_account' | 'personal_loan' | 'business_loan' | 'credit_card';
  existingCustomer: boolean;
}

interface EligibilityResult {
  eligible: boolean;
  products: ProductRecommendation[];
  preApprovalPercentage?: number;
  nextSteps: string[];
  documentsNeeded?: string[];
}
```

**API Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/eligibility/check` | POST | Submit eligibility assessment |
| `/api/v1/eligibility/products` | GET | Get recommended products |

**Rules Engine Configuration:**

```yaml
eligibility_rules:
  personal_loan:
    min_income: 150
    employment_min_months: 3
    required_docs: ["id_card", "income_proof"]
    max_amount: 5000
    interest_rate_range: [1.5, 3.5]
    
  savings_account:
    min_age: 18
    max_age: 70
    required_docs: ["id_card"]
    initial_deposit: 10
```

**UI Components:**
- Progress indicator (steps 1/5, 2/5, etc.)
- Animated result reveal
- "Apply Now" CTA button
- "Share with friends" option

---

### 1.2 Financial Health Quiz

**Description:** Gamified quiz that assesses financial behavior while capturing user data.

**Quiz Structure:**

| Module | Questions | Points |
|--------|-----------|--------|
| Spending Habits | 5 questions | 50 pts |
| Savings Behavior | 5 questions | 50 pts |
| Debt Management | 5 questions | 50 pts |
| Financial Goals | 5 questions | 50 pts |
| **Total** | **20 questions** | **200 pts** |

**Technical Implementation:**

```typescript
interface QuizState {
  currentModule: number;
  currentQuestion: number;
  answers: Record<string, any>;
  score: number;
  badges: Badge[];
  completed: boolean;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
  tier: 'bronze' | 'silver' | 'gold';
}

// Scoring algorithm
const calculateScore = (answers: Answer[]): number => {
  return answers.reduce((score, answer) => {
    const questionWeight = getQuestionWeight(answer.questionId);
    const answerValue = getAnswerScore(answer.value);
    return score + (questionWeight * answerValue);
  }, 0);
};
```

**Gamification Elements:**

| Element | Unlock Criteria | Reward |
|---------|-----------------|--------|
| 🌱 Seed Starter | Complete quiz | 100 points |
| 💰 Money Mind | Score > 150 | $1 credit |
| 📈 Growth Guru | Score > 175 | $2 credit |
| 🏆 Wealth Master | Score > 190 | $5 credit + badge |

**Data Captured:**
- Email (optional for results)
- Phone number (for follow-up)
- Financial behavior patterns
- Product preferences

---

### 1.3 Promotional Campaigns

**Description:** Interactive campaigns with instant rewards and lead capture.

**Campaign Types:**

1. **Spin-to-Win Wheel**
   - Spin wheel for instant prizes
   - Requires phone number + consent
   - Prizes: discount codes, cashback, points

2. **Lucky Draw**
   - Enter with unique code or referral
   - Weekly/monthly draws
   - Grand prize: iPhone, travel voucher, etc.

3. **Festival Campaigns**
   - Khmer New Year (April)
   - Lao New Year (April)
   - Water Festival (November)
   - Christmas/Year End

**Technical Implementation:**

```typescript
interface Campaign {
  id: string;
  type: 'spin_wheel' | 'lucky_draw' | 'festival';
  name: string;
  startDate: Date;
  endDate: Date;
  prizes: Prize[];
  entryRequirements: {
    phoneRequired: boolean;
    consentRequired: boolean;
    referralRequired: boolean;
  };
  rules: CampaignRule[];
}

interface Prize {
  id: string;
  name: string;
  type: 'cash' | 'discount' | 'points' | 'product';
  value: number;
  quantity: number;
  probability: number; // 0-1
}

interface SpinResult {
  prize: Prize | null;
  campaignId: string;
  userId: string;
  timestamp: Date;
  transactionId: string;
}
```

**Lead Capture Flow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Spin      │────▶│  Enter      │────▶│  Claim      │
│   Wheel     │     │  Details    │     │  Prize      │
└─────────────┘     └─────────────┘     └─────────────┘
                         │
                    ┌────┴────┐
                    │  Phone  │
                    │ Number  │
                    └─────────┘
```

---

## Phase 2: Onboarding & KYC Pre-fill

### 2.1 Document Pre-Upload

**Description:** Allow users to upload ID and selfie before full app onboarding.

**Supported Documents:**

| Document Type | Countries | Format |
|---------------|-----------|--------|
| National ID | Cambodia | JPG, PNG, PDF |
| Passport | All | JPG, PNG, PDF |
| Driver's License | All | JPG, PNG, PDF |
| Family Book | Cambodia | JPG, PNG, PDF |

**Technical Implementation:**

```typescript
interface DocumentUpload {
  userId: string;
  documentType: 'id_front' | 'id_back' | 'passport' | 'selfie' | 'income_proof';
  fileUrl: string;
  uploadTimestamp: Date;
  status: 'pending' | 'verified' | 'rejected';
  verificationResult?: {
    name: string;
    dob: string;
    idNumber: string;
    faceMatch: number; // confidence 0-1
  };
}

// Document processing pipeline
const processDocument = async (upload: DocumentUpload): Promise<DocumentUpload> => {
  // 1. Virus scan
  await virusScan(upload.fileUrl);
  
  // 2. OCR extraction
  const extracted = await extractOCR(upload.fileUrl, upload.documentType);
  
  // 3. Liveness check (for selfie)
  if (upload.documentType === 'selfie') {
    await verifyLiveness(upload.fileUrl);
  }
  
  // 4. Store securely
  await storeSecurely(upload);
  
  return { ...upload, status: 'pending' };
};
```

**UI Requirements:**

- Camera integration for live capture
- Gallery upload fallback
- Progress indicator
- Error handling with retry options
- Image quality indicators

---

### 2.2 Progressive KYC

**Description:** Multi-step KYC that reduces form fatigue through progressive disclosure.

**KYC Steps:**

| Step | Fields | Time Required | Drop-off Risk |
|------|--------|---------------|---------------|
| 1. Basic Info | Name, Phone, DOB | 1 min | Low |
| 2. Address | Current address | 30 sec | Low |
| 3. Employment | Job type, income | 1 min | Medium |
| 4. Documents | ID upload + selfie | 2 min | High |
| 5. Verification | OTP confirmation | 30 sec | Medium |

**Technical Implementation:**

```typescript
interface KYCProfile {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  stepData: Record<number, any>;
  overallProgress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  expiresAt?: Date; // KYC must complete within 30 days
}

const kycSteps = [
  {
    id: 1,
    name: 'Basic Information',
    fields: ['firstName', 'lastName', 'phone', 'dateOfBirth'],
    validation: {
      phone: /^\+?[0-9]{9,12}$/,
      dateOfBirth: (dob: Date) => age(dob) >= 18 && age(dob) <= 70
    }
  },
  {
    id: 2,
    name: 'Address',
    fields: ['country', 'province', 'district', 'commune', 'street'],
    validation: { country: ['KH', 'LA', 'MM'] }
  },
  {
    id: 3,
    name: 'Employment',
    fields: ['employmentType', 'employerName', 'monthlyIncome', 'jobTitle']
  },
  {
    id: 4,
    name: 'Document Verification',
    documents: ['id_front', 'id_back', 'selfie']
  },
  {
    id: 5,
    name: 'Final Verification',
    methods: ['sms_otp', 'telegram_otp']
  }
];
```

**Progressive Save:**
- Auto-save after each step
- Resume from last completed step
- 30-day expiration with reminders

---

### 2.3 Chat-Assisted Onboarding

**Description:** Conversational UI that feels like chatting with a bank representative.

**Chat Flow Example:**

```
Bot: 👋 Welcome to [Bank Name]! Let's open your account together.
     I'm here to help. What's your name?

User: Sothy

Bot: Great to meet you, Sothy! 🇰🇭
     How can I help you today?
     1. 💰 Open a savings account
     2. 💸 Apply for a loan
     3. 📱 Learn about our app

User: 1

Bot: Perfect! Let's get you started.
     First, what's your phone number?
     (We'll send a verification code)

User: +85512345678

Bot: ✅ Code sent! Please enter the 4-digit code.

User: 1234

Bot: 🎉 Verified! Now, are you:
     👤 Employed (salaried)
     🏢 Business owner
     💼 Self-employed
     🎓 Student

User: 👤

Bot: Great! What's your monthly income range?
     1. $100 - $300
     2. $300 - $500
     3. $500 - $1000
     4. $1000+

User: 3

Bot: Excellent! You qualify for our Premium Account.
     Let's verify your ID. Please send a photo of:
     📄 Front of your ID card
```

**Technical Implementation:**

```typescript
interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  currentNode: string;
  context: Record<string, any>;
  language: 'en' | 'km' | 'lo' | 'zh';
}

interface ChatNode {
  id: string;
  type: 'text' | 'choice' | 'input' | 'document' | 'location';
  content: string;
  options?: ChoiceOption[];
  nextNode: string | ((context: any) => string);
  validation?: (input: any) => boolean;
  action?: (context: any) => Promise<any>;
}
```

---

## Phase 3: Qualification & Segmentation

### 3.1 User Profiling

**Description:** Capture and analyze user data for intelligent segmentation.

**Data Points Captured:**

| Category | Fields | Source |
|----------|--------|--------|
| Demographics | Age, gender, location | KYC |
| Employment | Job type, employer, income | Application |
| Financial Behavior | Spending, saving, borrowing patterns | Quiz + Transaction |
| Intent Signals | Pages visited, time spent, actions taken | Analytics |
| Engagement | Campaign responses, referral activity | Activity |

**Segmentation Engine:**

```typescript
interface UserSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria[];
  priority: number;
  marketingTags: string[];
}

const segments = [
  {
    id: 'student',
    name: 'Student',
    criteria: [
      { field: 'age', operator: 'between', value: [16, 25] },
      { field: 'employmentType', operator: 'equals', value: 'student' }
    ],
    products: ['student_account', 'student_loan']
  },
  {
    id: 'sme_owner',
    name: 'SME Owner',
    criteria: [
      { field: 'employmentType', operator: 'equals', value: 'business_owner' },
      { field: 'monthlyIncome', operator: 'gte', value: 500 }
    ],
    products: ['business_account', 'sme_loan', 'merchant_qr']
  },
  {
    id: 'salaried',
    name: 'Salaried Worker',
    criteria: [
      { field: 'employmentType', operator: 'equals', value: 'salaried' },
      { field: 'incomeVerified', operator: 'equals', value: true }
    ],
    products: ['salary_account', 'personal_loan', 'credit_card']
  },
  {
    id: 'trader',
    name: 'Trader/Remittance',
    criteria: [
      { field: 'transactionVolume', operator: 'gte', value: 5000 },
      { field: 'crossBorder', operator: 'equals', value: true }
    ],
    products: ['business_account', 'remittance', 'forex']
  }
];
```

---

### 3.2 Dynamic Product Routing

**Description:** Show personalized offers based on user segment and eligibility.

**Routing Rules:**

```typescript
interface ProductRouting {
  userSegment: string;
  eligibilityScore: number;
  currentProducts: string[];
  availableProducts: Product[];
  recommendedOrder: string[];
  specialOffers: Offer[];
}

const routingEngine = (user: UserProfile): ProductRouting => {
  const segment = identifySegment(user);
  const eligibility = checkEligibility(user);
  const offers = getActiveOffers(segment);
  
  return {
    userSegment: segment.id,
    eligibilityScore: eligibility.score,
    currentProducts: user.products,
    availableProducts: filterProducts(segment, eligibility),
    recommendedOrder: prioritizeProducts(segment, eligibility),
    specialOffers: offers
  };
};
```

---

## Phase 4: Referral & Viral Growth

### 4.1 Tiered Referral System

**Description:** Gamified referral system with escalating rewards.

**Reward Structure:**

| Referrals | Reward Type | Value | Cumulative |
|-----------|-------------|-------|------------|
| 1 friend | Cash | $2 | $2 |
| 3 friends | Cash + Badge | $3 + Bronze | $9 |
| 5 friends | Cash + Badge | $5 + Silver | $20 |
| 10 friends | Cash + Badge | $10 + Gold | $50 |
| 25 friends | Premium | $25 + VIP Status | $150 |

**Technical Implementation:**

```typescript
interface ReferralProgram {
  id: string;
  name: string;
  tiers: ReferralTier[];
  rewards: ReferralReward[];
  tracking: {
    cookieLifetime: number; // days
    attributionWindow: number; // days
  };
}

interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded';
  steps: ReferralStep[];
  rewardAmount: number;
  rewardedAt?: Date;
}

interface ReferralStep {
  step: string;
  completedAt?: Date;
  required: boolean;
}

const referralSteps = [
  { id: 'signup', name: 'Sign up', required: true },
  { id: 'phone_verified', name: 'Verify phone', required: true },
  { id: 'kyc_started', name: 'Start KYC', required: true },
  { id: 'kyc_completed', name: 'Complete KYC', required: true },
  { id: 'first_deposit', name: 'First deposit', required: false },
  { id: 'first_transaction', name: 'First transaction', required: false }
];
```

---

### 4.2 Group-Based Referrals

**Description:** Encourage group invitations for extended family or business networks.

**Features:**

- Group referral link (unique per group)
- Group leaderboard
- Group bonus when X members join
- Shared rewards option

```typescript
interface GroupReferral {
  groupId: string;
  referrerId: string;
  members: GroupMember[];
  groupBonusThreshold: number;
  currentMembers: number;
  bonusReward: number;
  expiresAt: Date;
}
```

---

### 4.3 Leaderboard & Gamification

**Description:** Monthly leaderboard with top referrers receiving additional rewards.

**Leaderboard Tiers:**

| Rank | Monthly Reward |
|------|----------------|
| 🥇 1st | $100 + Trophy Badge |
| 🥈 2nd | $50 + Gold Badge |
| 🥉 3rd | $25 + Silver Badge |
| 4th-10th | $10 + Bronze Badge |
| Top 50 | Feature in monthly newsletter |

---

## Phase 5: Incentive & Reward Systems

### 5.1 Cashback Wallet (Light Version)

**Description:** Pre-signup wallet for tracking earned rewards and cashback.

**Wallet Features:**

| Feature | Description |
|---------|-------------|
| Balance Display | Show total earned |
| Transaction History | List of all earning events |
| Available Balance | Withdrawable amount |
| Pending Balance | Awaiting confirmation |
| Reward Catalog | Redeemable rewards |

**Technical Implementation:**

```typescript
interface RewardWallet {
  userId: string;
  currency: 'USD' | 'KHR' | 'LAK';
  balance: {
    available: number;
    pending: number;
    lifetime: number;
  };
  transactions: WalletTransaction[];
}

interface WalletTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  amount: number;
  source: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}
```

---

### 5.2 Mission-Based Rewards

**Description:** Task-based rewards that encourage engagement.

**Available Missions:**

| Mission | Requirement | Reward | Duration |
|---------|-------------|--------|----------|
| Complete Profile | Fill all profile fields | $0.50 | One-time |
| Verify Phone | Confirm phone number | $0.25 | One-time |
| Upload ID | Submit ID document | $0.50 | One-time |
| First Referral | Refer 1 friend | $2.00 | One-time |
| Daily Login | Open app 7 days straight | $0.10/day | 7 days |
| Share Content | Share promotional post | $0.15 | Per share |

---

### 5.3 Daily Spin Wheel

**Description:** Lucky spin wheel with daily free spins and coin rewards.

**Spin Wheel Features:**

| Feature | Description |
|--------|-------------|
| Daily Free Spin | 1 free spin per day |
| Coin Prizes | Random coin rewards (10-100 coins) |
| Special Jackpot | Occasional big prizes |
| Spin Animation | Visual wheel spin effect |

**Spin Rewards Table:**

| Prize | Value | Probability |
|--------|-------|-------------|
| 10 Coins | 10 | 40% |
| 25 Coins | 25 | 25% |
| 50 Coins | 50 | 15% |
| 100 Coins | 100 | 10% |
| 200 Coins | 200 | 5% |
| Jackpot | 500 | 5% |

**Technical Implementation:**

```typescript
interface SpinWheelResult {
  userId: string;
  todaySpin: boolean;
  prize: {
    coins: number;
    isJackpot: boolean;
  };
  timestamp: Date;
  dailySpinCount: number;
}
```

---

### 5.4 Daily Check-in Streaks

**Description:** Consecutive day check-ins with milestone rewards.

**Streak System Features:**

| Feature | Description |
|--------|-------------|
| Daily Check-in | Check in once per day |
| Streak Counter | Track consecutive days |
| Milestone Rewards | Bonus coins at day milestones |
| Streak Freeze |Protect streak from missing a day|

**Milestone Rewards:**

| Streak Days | Reward Coins |
|-----------|-------------|
| 3 Days | 25 Coins |
| 7 Days | 75 Coins |
| 14 Days | 150 Coins |
| 30 Days | 300 Coins |
| 60 Days | 500 Coins |
| 90 Days | 1000 Coins |

---

### 5.5 Social Features & Achievements

**Description:** Gamification through achievements, leaderboards, and social sharing.


**Achievement System:**

| Achievement | Tier | Coins | Requirement |
|-------------|------|------|------------|
| Welcome | Bronze | 10 | First login |
| First Loan | Bronze | 50 | Apply for first loan |
| Punctual | Bronze | 30 | Early loan payment |
| Rising Star | Silver | 25 | 3-day streak |
| Week Warrior | Silver | 75 | 7-day streak |
| Friend Maker | Silver | 100 | Refer 3 friends |
| Quiz Master | Silver | 100 | Complete 5 quizzes |
| Lucky Spinner | Silver | 75 | Spin 10 times |
| Fortnight Fighter | Gold | 150 | 14-day streak |
| Monthly Champion | Gold | 300 | 30-day streak |
| Influencer | Gold | 500 | Refer 10 friends |
| Network Legend | Gold | 1000 | Refer 25 friends |

**Leaderboards:**

| Type | Description |
|------|-------------|
| Referrals | Top referrers |
| Streaks | Longest streak holders |
| Earnings | Most coins earned |

**Social Sharing:**
- Share progress to Telegram
- Copy referral links
- Share achievements
- Invite friends

---

### 5.6 Cashback on Loan Repayments

**Description:** Cashback rewards on successful loan repayments.

**Cashback Tiers:**

| Loan Amount | Cashback % |
|------------|------------|
| < $500 | 1% |
| $500-$1000 | 2% |
| $1000-$3000 | 3% |
| > $3000 | 5% |

---

## Phase 6: Pre-Activation Engagement

### 6.1 Balance Simulator

**Description:** Interactive savings projection calculator.

**Features:**

- Input: Initial deposit, monthly contribution, interest rate, duration
- Output: Projected balance with breakdown
- Comparison: Different scenarios side-by-side
- Share: Send results to friends/family

```typescript
interface BalanceSimulation {
  initialDeposit: number;
  monthlyContribution: number;
  interestRate: number;
  durationMonths: number;
  compounding: 'monthly' | 'quarterly' | 'annually';
  
  // Calculated results
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
  breakdown: MonthlyBreakdown[];
}

const calculateProjection = (sim: BalanceSimulation): BalanceSimulation => {
  // Compound interest formula with monthly contributions
  let balance = sim.initialDeposit;
  const breakdown = [];
  
  for (let month = 1; month <= sim.durationMonths; month++) {
    const interest = balance * (sim.interestRate / 100 / 12);
    balance += interest + sim.monthlyContribution;
    breakdown.push({ month, balance, contributions: month * sim.monthlyContribution });
  }
  
  return {
    ...sim,
    totalContributions: sim.initialDeposit + (sim.monthlyContribution * sim.durationMonths),
    totalInterest: balance - (sim.initialDeposit + sim.monthlyContribution * sim.durationMonths),
    finalBalance: balance,
    breakdown
  };
};
```

---

### 6.2 Loan Calculator

**Description:** EMI and loan affordability calculator.

**Features:**

- EMI calculation with breakdown
- Affordability assessment
- Loan comparison tool
- Pre-qualification indicator

```typescript
interface LoanCalculation {
  principal: number;
  interestRate: number; // annual percentage
  tenureMonths: number;
  fees: {
    processingFee: number;
    insuranceFee: number;
  };
  
  // Results
  emi: number;
  totalInterest: number;
  totalPayment: number;
  amortizationSchedule: AmortizationEntry[];
}
```

---

## Phase 7: Loan Application & Micro-Lending

### 7.x Loan Calculator

**Description:** EMI calculator with amortization schedule.

**Calculator Features:**


| Feature | Description |
|--------|-------------|
| Loan Amount Slider | $100 - $10,000 |
| Interest Rate Slider | 0% - 20% |
| Tenure Slider | 1 - 36 months |
| EMI Result | Monthly payment display |
| Total Interest | Total interest calculation |
| Amortization Schedule | Month-by-month breakdown |

**Amortization Schedule:**

| Month | Principal | Interest | EMI | Balance |
|------|----------|---------|-----|---------|
| 1 | $80.00 | $4.17 | $84.17 | $920.00 |
| 2 | $81.33 | $2.84 | $84.17 | $838.67 |
| ... | ... | ... | ... | ... |


**Technical Implementation:**


```typescript
interface LoanCalculation {
  principal: number;
  interestRate: number;
  tenureMonths: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  amortization: AmortizationEntry[];
}

function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
         (Math.pow(1 + monthlyRate, months) - 1);
}
```

---

### 7.y Credit Score Display

**Description:** View and track credit score.


**Features:**
- Score gauge visualization (300-850)
- Grade classification: Excellent/Very Good/Good/Fair/Poor
- 5 key factors affecting score
- Improvement tips with impact estimates

**Score Factors:**
| Factor | Weight | Impact |
|---------|--------|-------|
| Payment History | 35% | Your loan repayments |
| Credit Utilization | 30% | Credit usage % |
| Credit History | 15% | Length of history |
| New Credit | 10% | Recent applications |
| Credit Mix | 10% | Diversity of credit |

---

### 7.z AI Loan Advisor

**Description:** AI-powered personalized loan recommendations.


**AI Features:**
- Profile analysis (credit score, income, employment)
- Match scoring (0-95%)
- Interest rate adjustments based on profile
- Smart reasons for recommendations

**Loan Products:**
| Product | Rate | Best For |
|---------|-----|--------|
| Personal Loan | 3.5% APR | Any expenses |
| Salary Advance | 2.0% APR | Quick cash |
| Business Loan | 4.5% APR | Business growth |
| Education Loan | 2.5% APR | Learning |
| Home Improvement | 3.0% APR | Renovation |

---

---

## Phase 8: Merchant & Partner Acquisition

### 7.1 Instant Loan Eligibility

**Description:** Soft credit check for pre-approval without affecting credit score.

**Technical Implementation:**

```typescript
interface LoanEligibilityRequest {
  userId: string;
  loanType: 'personal' | 'business' | 'salary_advance' | 'micro';
  requestedAmount: number;
  requestedTenure: number;
  purpose: string;
}

interface LoanEligibilityResult {
  eligible: boolean;
  preApprovedAmount: number;
  preApprovedTenure: number;
  interestRate: number;
  emi: number;
  requiredDocuments: string[];
  approvalProbability: number; // 0-1
  nextSteps: string[];
}

// Soft credit check (no hard inquiry)
const checkSoftCredit = async (userId: string): Promise<CreditScore> => {
  // Query credit bureau without creating hard inquiry
  const score = await creditBureau.softCheck(userId);
  return {
    score: score.value,
    rating: score.rating, // poor/fair/good/excellent
    factors: score.factors,
    inquiriesLast30Days: score.inquiries.length
  };
};
```

---

### 7.2 Complete Loan Application

**Description:** End-to-end loan application flow within Telegram.

**Application Steps:**

| Step | Description | Time |
|------|-------------|------|
| 1 | Eligibility Check | 30 sec |
| 2 | Loan Details (amount, tenure, purpose) | 1 min |
| 3 | Income Verification | 2 min |
| 4 | Document Upload | 3 min |
| 5 | E-Signature | 30 sec |
| 6 | Review & Submit | 1 min |
| **Total** | | **~8 min** |

**Status Tracking:**

```typescript
interface LoanApplication {
  id: string;
  userId: string;
  status: LoanStatus;
  currentStep: number;
  details: {
    type: string;
    amount: number;
    tenure: number;
    purpose: string;
  };
  documents: UploadedDocument[];
  underwriting: {
    assignedTo?: string;
    score: number;
    decision?: 'approved' | 'rejected' | 'needs_review';
  };
  timeline: StatusEvent[];
}

type LoanStatus = 
  | 'draft'
  | 'submitted'
  | 'documents_verification'
  | 'underwriting'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'repaid';

interface StatusEvent {
  status: LoanStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}
```

---

## Phase 8: Merchant & Partner Acquisition

### 8.1 Merchant Signup Flow

**Description:** Quick merchant onboarding for QR payments and banking services.

**Merchant Types:**

| Type | Requirements | Features |
|------|--------------|----------|
| Micro | Name + Phone + ID | Basic QR, up to $500/day |
| Small | + Business license | Full QR, $500-5000/day |
| Medium | + Financial statements | API access, higher limits |

**Technical Implementation:**

```typescript
interface MerchantApplication {
  id: string;
  type: 'micro' | 'small' | 'medium';
  businessInfo: {
    name: string;
    category: string;
    address: string;
    phone: string;
  };
  ownerInfo: {
    name: string;
    idNumber: string;
    phone: string;
  };
  documents: {
    id: string;
    license?: string;
    bankStatements?: string;
  };
  settlement: {
    bankAccount: string;
    bankName: string;
    settlementSchedule: 'daily' | 'weekly';
  };
  status: 'pending' | 'approved' | 'rejected';
}
```

---

### 8.2 QR Payment Registration

**Description:** Generate and manage KHQR codes for merchants.

```typescript
interface QRPayment {
  merchantId: string;
  qrCode: string; // KHQR formatted
  amount?: number; // Optional for dynamic QR
  currency: 'USD' | 'KHR';
  expiryMinutes: number;
  transactions: QRTransaction[];
}

interface QRTransaction {
  id: string;
  amount: number;
  currency: string;
  customerName?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  settlementStatus: 'unsettled' | 'settled';
}
```

---

## Phase 9: Customer Support

### 9.1 Pre-Support Triage

**Description:** AI-powered initial support within the mini app.

**Triage Flow:**

```
User: "I need help"
    │
    ▼
Bot: "What can I help you with today?"
    ├── 💳 Account issues
    ├── 💰 Transaction problems
    ├── 📄 Loan application
    ├── 🔐 Security concerns
    └── 👤 Other
```

**Technical Implementation:**

```typescript
interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  messages: TicketMessage[];
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
  slaDeadline?: Date;
}

interface TicketMessage {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  content: string;
  attachments?: string[];
  timestamp: Date;
}
```

---

## Phase 10: Re-engagement & Retargeting

### 10.1 Abandoned Onboarding Recovery

**Description:** Automated nudges for users who start but don't complete onboarding.

**Triggers:**

| Trigger | Time After | Message Template |
|---------|------------|------------------|
| Started KYC, not completed | 1 hour | "Finish your account in 2 mins! [Link]" |
| Uploaded ID, not verified | 24 hours | "Your ID is being processed. Complete now!" |
| Referral started, not completed | 48 hours | "Your friend is waiting! [Progress]" |
| Loan application, not submitted | 24 hours | "Complete your application - 80% done!" |

**Push Notification Types:**

```typescript
interface PushNotification {
  id: string;
  userId: string;
  type: 'abandonment' | 'reminder' | 'offer' | 'security' | 'milestone';
  channel: 'telegram' | 'sms' | 'email';
  content: {
    title: string;
    body: string;
    cta?: string;
  };
  scheduledAt: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
}
```

---

## Phase 11: Trust Building Features

### 11.1 License & Compliance Display

**Description:** Build trust by displaying regulatory information.

**Display Elements:**

- Bank license number and issuing authority
- Member of deposit insurance scheme
- Security certifications (PCI-DSS, ISO 27001)
- Privacy policy and terms of service
- Branch and ATM locator
- Contact information

```typescript
interface TrustBadge {
  id: string;
  type: 'license' | 'security' | 'insurance' | 'association';
  name: string;
  description: string;
  icon: string;
  verificationUrl?: string;
  displayedIn: string[]; // pages where this is shown
}
```

---

# 🔌 API Requirements

## Core API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/telegram` | POST | Authenticate via Telegram |
| `/api/v1/auth/verify-phone` | POST | Verify phone number with OTP |
| `/api/v1/auth/refresh-token` | POST | Refresh JWT token |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users/profile` | GET/PUT | Get/Update user profile |
| `/api/v1/users/kyc` | GET/POST | KYC submission and status |
| `/api/v1/users/documents` | POST | Upload documents |

### Eligibility & Products

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/eligibility/check` | POST | Check eligibility |
| `/api/v1/products` | GET | List available products |
| `/api/v1/products/:id` | GET | Get product details |

### Loans

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/loans/eligibility` | POST | Check loan eligibility |
| `/api/v1/loans/applications` | POST | Submit loan application |
| `/api/v1/loans/applications/:id` | GET | Get application status |
| `/api/v1/loans/calculate` | POST | Calculate EMI |

### Referrals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/referrals/code` | GET | Get user's referral code |
| `/api/v1/referrals/stats` | GET | Get referral statistics |
| `/api/v1/referrals/leaderboard` | GET | Get leaderboard |

### Rewards & Wallet

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/wallet` | GET | Get wallet balance |
| `/api/v1/wallet/transactions` | GET | Get transaction history |
| `/api/v1/missions` | GET | Get available missions |
| `/api/v1/missions/:id/complete` | POST | Complete mission |

### Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payments/khqr/generate` | POST | Generate KHQR code |
| `/api/v1/payments/khqr/status/:id` | GET | Check payment status |

### Support

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/support/tickets` | POST | Create support ticket |
| `/api/v1/support/tickets/:id` | GET | Get ticket status |

---

# 🔒 Security Requirements

## Authentication & Authorization

1. **Telegram Session Validation**
   - Validate `initData` HMAC signature
   - Implement token rotation
   - Session timeout: 30 days

2. **Multi-Factor Authentication**
   - SMS OTP for sensitive operations
   - Telegram OTP as option
   - Biometric authentication for high-value transactions

3. **API Security**
   - Rate limiting: 100 requests/minute
   - Request signing for sensitive endpoints
   - IP allowlisting for admin endpoints

## Data Protection

1. **Encryption**
   - TLS 1.3 for transit
   - AES-256 for stored data
   - Field-level encryption for PII

2. **Data Retention**
   - KYC documents: 7 years
   - Transaction data: 5 years
   - Session logs: 1 year

3. **Privacy**
   - Explicit consent for marketing
   - Data minimization principle
   - Right to deletion support

## Compliance

| Requirement | Standard |
|-------------|----------|
| Data Security | PCI-DSS, ISO 27001 |
| Financial Services | Local central bank regulations |
| Data Privacy | GDPR (for EU users), local privacy laws |
| Anti-Money Laundering | AML/KYC compliance |

---

# 🎨 UI/UX Guidelines

## Design Principles

1. **Telegram-Native Feel**
   - Use Telegram's color scheme
   - Follow WebApp design guidelines
   - Support dark/light mode

2. **Low Friction**
   - Maximum 3 taps to any action
   - Auto-save progress
   - Clear CTAs

3. **Accessibility**
   - Support Khmer, Lao, English, Chinese
   - Minimum touch target: 44px
   - Color contrast ratio: 4.5:1

## Color Palette

| Purpose | Light Mode | Dark Mode |
|---------|-------------|-----------|
| Primary | #2481CC (Telegram Blue) | #2AABEE |
| Secondary | #7CC33F | #7CC33F |
| Accent | #FFA500 | #FFA500 |
| Background | #FFFFFF | #17212B |
| Surface | #F5F5F5 | #242F3D |
| Text Primary | #000000 | #FFFFFF |
| Text Secondary | #999999 | #A9A9A9 |
| Error | #FF3B30 | #FF3B30 |
| Success | #34C759 | #34C759 |

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | System | 24-32px | 600-700 |
| Body | System | 16px | 400 |
| Caption | System | 12-14px | 400 |
| Button | System | 16px | 600 |

---

# 📅 Implementation Roadmap

## Phase 1: Foundation (Weeks 1-4)

- [ ] Core infrastructure setup
- [ ] Telegram Bot & Mini App initialization
- [ ] Basic authentication
- [ ] User profile management
- [ ] Eligibility checker (v1)

## Phase 2: Onboarding (Weeks 5-8)

- [ ] Progressive KYC flow
- [ ] Document upload & verification
- [ ] Chat-assisted onboarding
- [ ] Phone verification

## Phase 3: Engagement (Weeks 9-12)

- [ ] Referral system
- [ ] Rewards wallet
- [ ] Mission-based rewards
- [ ] Balance simulator

## Phase 4: Lending (Weeks 13-16)

- [ ] Loan eligibility checker
- [ ] Loan application flow
- [ ] Document management
- [ ] Status tracking

## Phase 5: Growth (Weeks 17-20)

- [ ] Merchant onboarding
- [ ] KHQR integration
- [ ] Bill payment
- [ ] Advanced analytics

## Phase 6: Scale (Weeks 21-24)

- [ ] AI-powered recommendations
- [ ] Advanced segmentation
- [ ] A/B testing framework
- [ ] Performance optimization

---

# 📊 Success Metrics

## Key Performance Indicators

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Mini App Install Rate | - | 50% of bot users | Month 3 |
| KYC Completion Rate | 35% | 70% | Month 6 |
| Referral Conversion | - | 25% | Month 6 |
| Loan Application Rate | - | 15% of eligible users | Month 6 |
| Time to Account Open | 45 mins | 15 mins | Month 6 |
| Support Ticket Reduction | - | 30% | Month 9 |

## Analytics Events

```typescript
interface AnalyticsEvent {
  event: string;
  userId: string;
  timestamp: Date;
  properties: Record<string, any>;
  sessionId: string;
}

const trackedEvents = [
  'app_opened',
  'eligibility_checked',
  'kyc_step_started',
  'kyc_step_completed',
  'kyc_abandoned',
  'referral_code_shared',
  'referral_completed',
  'loan_application_started',
  'loan_application_submitted',
  'loan_approved',
  'mission_completed',
  'reward_claimed'
];
```

---

---

# 🔗 Telegram-Banking App Linkage

This section describes the flow for linking a user's Telegram account with their existing banking mobile app, enabling seamless cross-platform experiences.

---

## Overview

The linkage between Telegram and the banking app creates a unified digital banking experience where users can:

- Access bank account information through Telegram
- Receive notifications and alerts via Telegram
- Perform basic banking operations from Telegram
- Use Telegram as an authentication method for the bank app

---

## Linkage Flow

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐      │
│   │   Telegram   │       │  Bank App    │       │   Backend    │      │
│   │   Mini App   │       │   (iOS/      │       │   Services   │      │
│   │              │       │   Android)   │       │              │      │
│   └──────┬───────┘       └──────┬───────┘       └──────┬───────┘      │
│          │                      │                      │               │
│          │  1. Initiate Link    │                      │               │
│          │─────────────────────▶│                      │               │
│          │                      │                      │               │
│          │                      │  2. Generate Link    │               │
│          │                      │◀─────────────────────│               │
│          │                      │                      │               │
│          │  3. Show QR Code     │                      │               │
│          │◀─────────────────────│                      │               │
│          │                      │                      │               │
│          │  4. Scan QR /        │                      │               │
│          │     Enter Code       │                      │               │
│          │─────────────────────▶│                      │               │
│          │                      │                      │               │
│          │                      │  5. Verify + Confirm │               │
│          │                      │◀─────────────────────│               │
│          │                      │                      │               │
│          │  6. Link Confirmed   │                      │               │
│          │◀─────────────────────│                      │               │
│          │                      │                      │               │
└──────────┴──────────────────────┴──────────────────────┴──────────────┘
```

---

## Detailed Linkage Process

### Method 1: QR Code Linking (Recommended)

**Step-by-Step Flow:**

| Step | Action | User Experience |
|------|--------|------------------|
| 1 | User opens Telegram Mini App | "Link your bank account" button displayed |
| 2 | Tap "Link Bank Account" | Mini App requests to open bank app (deep link) |
| 3 | Bank app opens | Shows QR code with unique token |
| 4 | Return to Telegram | Mini App shows camera to scan QR |
| 5 | Scan QR code | Token extracted from QR |
| 6 | Verification | Backend validates token and creates link |
| 7 | Success | Confirmation with linked account summary |

### Method 2: Phone Number Matching

| Step | Action | User Experience |
|------|--------|------------------|
| 1 | User enters phone number in Telegram | Input field for bank-registered phone |
| 2 | OTP sent to phone | SMS verification code |
| 3 | Enter OTP in Telegram | 6-digit code input |
| 4 | Verification | Backend matches phone + OTP |
| 5 | Success | Account linked with phone number |

### Method 3: Account Number + OTP

| Step | Action | User Experience |
|------|--------|------------------|
| 1 | User enters bank account number | Input field in Telegram |
| 2 | OTP sent to registered phone | SMS to bank-registered number |
| 3 | Enter OTP in Telegram | 6-digit code input |
| 4 | Verification | Backend validates account + OTP |
| 5 | Success | Account linked |

---

## Technical Implementation

### Data Model

```python
# Python (FastAPI) - Pydantic Schema
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TelegramLinkRequest(BaseModel):
    telegram_user_id: int
    telegram_username: Optional[str] = None
    link_method: str  # "qr_code", "phone", "account_number"
    verification_token: str

class TelegramLinkResponse(BaseModel):
    link_id: str
    bank_account_id: str
    bank_account_last4: str  # e.g., "****1234"
    linked_at: datetime
    status: str  # "active", "pending_verification"

class LinkedAccount(BaseModel):
    link_id: str
    telegram_user_id: int
    bank_account_id: str
    bank_account_type: str  # "savings", "checking", "credit"
    last4: str
    nickname: Optional[str]
    linked_at: datetime
    status: str
    notification_preferences: NotificationPrefs

class NotificationPrefs(BaseModel):
    balance_alerts: bool = True
    transaction_alerts: bool = True
    loan_reminders: bool = True
    promotions: bool = False
```

### Database Schema

```sql
-- PostgreSQL
CREATE TABLE telegram_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    link_method VARCHAR(50) NOT NULL,  -- 'qr_code', 'phone', 'account_number'
    verification_token VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    last_used_at TIMESTAMP,
    UNIQUE(telegram_user_id, bank_account_id)
);

CREATE TABLE telegram_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID REFERENCES telegram_links(id),
    notification_type VARCHAR(50),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_telegram_user_id ON telegram_links(telegram_user_id);
CREATE INDEX idx_bank_account_id ON telegram_links(bank_account_id);
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/telegram/link/initiate` | POST | Start linking process |
| `/api/v1/telegram/link/verify` | POST | Complete verification |
| `/api/v1/telegram/link/status` | GET | Get link status |
| `/api/v1/telegram/link/delete` | DELETE | Unlink account |
| `/api/v1/telegram/accounts` | GET | List linked accounts |
| `/api/v1/telegram/notifications/preferences` | PUT | Update notification settings |

### Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY VERIFICATION                         │
└─────────────────────────────────────────────────────────────────┘

1. TOKEN GENERATION (Bank App)
   ┌──────────────────┐
   │  Generate UUID   │
   │  + Timestamp     │
   │  + Cryptographic │
   │  signature       │
   └────────┬─────────┘
            │
            ▼
2. QR CODE / TOKEN
   ┌──────────────────┐
   │  {               │
   │    "token":      │
   │    "abc123...",  │
   │    "exp":        │
   │    1713000000,   │
   │    "sig":        │
   │    "xyz789..."   │
   │  }               │
   └────────┬─────────┘
            │
            ▼
3. VERIFICATION (Backend)
   ┌──────────────────┐
   │  Validate token  │
   │  Check expiry    │
   │  Verify signature│
   │  Create link     │
   └──────────────────┘
```

---

## Linked Account Features

Once linked, users can perform the following via Telegram:

### Read-Only Features (Available Immediately)

| Feature | Description |
|---------|-------------|
| Balance Check | View current account balance |
| Mini Statement | Last 10-20 transactions |
| Transaction Alerts | Real-time notifications |
| Account Nickname | Custom naming for accounts |

### Action Features (Require Additional Verification)

| Feature | Verification Required | Use Case |
|---------|----------------------|----------|
| Fund Transfer | Biometric/PIN in bank app | Send money via Telegram |
| Bill Payment | OTP verification | Pay bills quickly |
| Card Management | Biometric/PIN | Block/unblock cards |
| Loan Applications | Biometric + documents | Apply for loans |

---

## Unlinking Flow

Users can unlink their Telegram account at any time:

```
User Request → Confirm via bank app OR OTP → 
Backend deletes link → Confirmation sent to both channels
```

| Step | Action |
|------|--------|
| 1 | User initiates unlink from Telegram Mini App OR Bank App |
| 2 | If from Telegram: Redirect to bank app for confirmation |
| 3 | User confirms with biometric/PIN OR OTP |
| 4 | Backend deletes the link record |
| 5 | Notification sent to user confirming unlink |

---

## Notification Types

Once linked, users receive these notifications via Telegram:

| Notification Type | Trigger | Priority |
|-------------------|---------|----------|
| Balance Alert | Balance below threshold | High |
| Transaction Alert | Any card/debit transaction | High |
| Large Transaction | Transaction > $100 | High |
| Loan Due Reminder | 3 days before due date | Medium |
| Salary Credited | Salary deposit detected | Medium |
| Promotion | New offer available | Low |

---

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| User already linked 5 accounts | Show existing links, allow replace |
| Bank account closed | Mark link as inactive, notify user |
| Phone number changed | Require re-verification |
| Telegram account deleted | Links become inactive (garbage collected) |
| Token expired | Prompt user to restart linking process |
| Duplicate link attempt | Show "Already linked" message |

---

## Implementation Checklist

- [ ] Generate secure QR code tokens with expiry
- [ ] Implement phone number matching with OTP
- [ ] Create notification queue for Telegram delivery
- [ ] Add biometric verification for action features
- [ ] Implement deep linking between Telegram and bank app
- [ ] Add audit logging for compliance
- [ ] Set up rate limiting on linking endpoints
- [ ] Implement unlinking with proper verification

---

# 🏁 Conclusion

This specification provides a comprehensive blueprint for building a Telegram Mini App that serves as a powerful acquisition and engagement funnel for banking services. By following this phased approach, banks can:

1. **Reduce customer acquisition costs** through lower-friction onboarding
2. **Improve conversion rates** with progressive KYC and eligibility checks
3. **Drive organic growth** through gamified referral systems
4. **Build customer trust** with transparent, helpful features
5. **Enable instant lending** with soft credit checks and quick approvals

The modular architecture allows for incremental implementation, starting with core features and progressively adding more sophisticated capabilities as user adoption grows.

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-20  
**Next Review:** 2026-05-20  
**Document Owner:** Product & Engineering Team
