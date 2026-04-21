# Telegram Mini App Bank - End to End Flow Documentation

## Table of Contents
1. [Platform Overview](#1-platform-overview)
2. [System Architecture](#2-system-architecture)
3. [Frontend-Backend Communication](#3-frontend-backend-communication)
4. [User Journeys & Flows](#4-user-journeys--flows)
5. [Database Models](#5-database-models)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Phase-by-Phase Feature Details](#7-phase-by-phase-feature-details)
8. [Deployment Guide](#8-deployment-guide)
9. [Troubleshooting](#9-troubleshooting)

---

# 1. Platform Overview

## 1.1 What is Telegram Mini App Bank?
A Telegram-based micro-lending platform that allows users to:
- Check loan eligibility
- Apply for personal/business loans
- Make payments
- Track credit score
- Earn rewards through gamification

## 1.2 Technology Stack

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | Vanilla JavaScript (ES2022) |
| Styling | CSS3 with Variables |
| State | Custom Event Bus |
| Storage | LocalStorage, SessionStorage |
| Telegram SDK | Telegram WebApp JS |

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | FastAPI (Python 3.11+) |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.x |
| Authentication | JWT |
| Server | Uvicorn |

---

# 2. System Architecture

## 2.1 High-Level Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        TELEGRAM                                │
│  ┌────────────────┐         ┌────────────────────────────┐       │
│  │   Bot Commands │         │     Mini App (WebView)    │       │
│  └───────┬────────┘         └─────────────┬──────────────┘       │
│          │                               │                        │
│          │         ┌─────────────────────┴──────────────┐        │
│          │         │         Frontend Server            │        │
│          │         │     (Vanilla JS + HTML/CSS)       │        │
│          │         └──────────────┬───────────────────┘        │
└───────────────────────────────┬──┬──────────────────────────────┘
                                │  │
                    ┌───────────┴──┴───────────┐
                    │      REST API            │
                    │   (FastAPI + Uvicorn)    │
                    └───────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐   ┌─────▼─────┐  ┌─────▼─────┐
         │ PostgreSQL  │   │  Redis    │  │  Telegram │
         │  Database │   │  Cache    │  │   Bot    │
         └──────────┘   └───────────┘  └──────────┘
```

## 2.2 Project Structure

```
Telegram MiniApp- Banks/
├── apps/
│   ├── frontend/
│   │   ├── index.html           # Main HTML
│   │   ├── public/            # Static assets
│   │   ├── src/
│   │   │   ├── app.js        # Main application
│   │   │   ├── pages/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   ├── services/    # API services
│   │   │   ├── store/      # State management
│   │   │   └── utils/      # Utilities
│   │   └── styles/         # CSS files
│   │
│   └── backend/
│       ├── main.py           # FastAPI app
│       ├── app/
│       │   ├── api/        # API routes
│       │   ├── core/      # Config & security
│       │   ├── db/       # Database models
│       │   ├── schemas/  # Pydantic schemas
│       │   └── services/  # Business logic
│       ├── requirements.txt
│       └── alembic/       # Migrations
│
├── infrastructure/
├── packages/
└── docs/
```

---

# 3. Frontend-Backend Communication

## 3.1 API Client Structure

The frontend uses a custom `ApiClient` class defined in `apps/frontend/src/utils/api.js`:

```javascript
// Base configuration
const API_BASE_URL = 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Request/Response flow
fetch(`${API_BASE_URL}${API_VERSION}${endpoint}`, {
    method: method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // JWT token
    },
    body: JSON.stringify(data)
})
```

## 3.2 Communication Flow

```
┌─────────────┐                      ┌─────────────┐
│  Frontend   │                      │   Backend   │
│  (Browser) │                      │  (FastAPI) │
└─────┬─────┘                      └─────┬─────┘
      │                                    │
      │ 1. User Action                   │
      │◄─────────────────────────────  │
      │                                    │
      │ 2. API Call                   │
      │───────────────────────────────►  │
      │    GET/POST /api/v1/resource   │
      │                                    │
      │ 3. JWT Token              │
      │◄─────────────────────────────  │
      │    Authorization: Bearer ...  │
      │                                    │
      │ 4. Process Request            │
      │◄─────────────────────────────  │
      │    Service Layer             │
      │                                    │
      │ 5. Database Query         │
      │◄─────────────────────────────  │
      │    SQLAlchemy ORM         │
      │                                    │
      │ 6. Database Response     │
      │───────────────────────────────►
      │    PostgreSQL             │
      │                                    │
      │ 7. JSON Response         │
      │───────────────────────────────►
      │    { status, data, error } │
      │                                    │
      │ 8. Update UI              │
      │◄─────────────────────���───────  │
      │    Render new content       │
      └─────┬─────┘                      └─────┬─────┘
```

## 3.3 Request Format

### GET Request
```javascript
// Get loans
const response = await api.get('/loans', { user_id: '123' });
// GET /api/v1/loans?user_id=123
```

### POST Request
```javascript
// Create loan
const response = await api.post('/loans', {
    user_id: '123',
    amount: 1000,
    tenure_months: 12
});
// POST /api/v1/loans
// Body: {"user_id": "123", "amount": 1000, "tenure_months": 12}
```

## 3.4 Response Format

```json
// Success Response
{
    "status": "success",
    "data": {
        "id": "loan_123",
        "amount": 1000,
        "status": "active"
    },
    "message": "Loan created successfully"
}

// Error Response
{
    "status": "error",
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid amount"
    }
}
```

---

# 4. User Journeys & Flows

## 4.1 User Registration & Login Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Open Telegram  │────▶│  Click Mini App │────▶│  Start Bot     │
│   Bot         │     │   Link        │     │  /start       │
└────────────────┘     └────────────────┘     └──────┬───────┘
                                                │
                                                ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Auto Login    │◄────│  Token Valid  │◄────│  Validate    │
│  Redirect    │     │             │     │  JWT Token   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Home Page     │     │   New User     │     │  Create User  │
│  Dashboard    │     │  Register    │     │  in Database │
└────────────────┘     └────────────────┘     └────────────────┘
```

## 4.2 Loan Application Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Home Page     │────▶│  Loan Tab      │────▶│  Enter Amount │
│  (Dashboard)  │     │  (Loans)       │     │  & Tenure    │
└────────────────┘     └────────────────┘     └──────┬───────┘
                                                     │
                                                     ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Credit Score  │◄────│  Check        │◄────│  Calculate    │
│  Display     │     │  Eligibility  │     │  EMI          │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Submit        │────▶│  Save Loan    │────▶│  Loan        │
│  Application  │     │  to Database │     │  Created     │
└────────────────┘     └────────────────┘     └────────────────┘
```

## 4.3 Payment Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Select Loan   │────▶│  Choose       │────▶│  Confirm      │
│  to Repay     │     │  Payment Method│     │  Payment      │
└────────────────┘     └────────────────┘     └──────┬───────┘
                                                     │
                                                     ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Cashback     │◄────│  Add Coins   │◄────│  Update Loan │
│  Awarded     │     │  to Wallet   │     │  Balance    │
└────────────────┘     └────────────────┘     └────────────────┘
```

## 4.4 Reward System Flow

### Spin Wheel
```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Navigate to   ���────▶│  Click Spin   │────▶│  Check Daily │
│  Spin Wheel   │     │  Button      │     │  Spin Count │
└────────────────┘     └────────────────┘     └──────┬───────┘
                                                     │
         ┌──────────────────────────────────────────────┘
         │              (If spin available)
         ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Animation    │────▶│  Award Coins │────▶│  Save Spin   │
│  Plays       │     │  to User     │     │  Record      │
└────────────────┘     └────────────────┘     └────────────────┘
```

### Check-in Streak
```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Home Page     │────▶│  Click Check-in│────▶│  Check Last   │
│  (Dashboard)  │     │  Button        │     │  Check-in    │
└────────────────┘     └────────────────┘     └──────┬───────┘
                                                     │
         ┌──────────────────────────────────────────────┘
         │             (New day)
         ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Increment   │────▶│  Check       │────▶│  Award      │
│  Streak     │     │  Milestone   │     │  Milestone  │
│  Counter    │     │             │     │  Reward    │
└────────────────┘     └────────────────┘     └────────────────┘
```

---

# 5. Database Models

## 5.1 User Model

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    telegram_id = Column(Integer, unique=True, index=True)
    username = Column(String, nullable=True)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    kyc_status = Column(String, default="pending")
    credit_score = Column(Integer, default=500)
    coins = Column(Integer, default=0)
    referral_code = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## 5.2 Loan Model

```python
class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    amount = Column(Float)
    interest_rate = Column(Float)
    tenure_months = Column(Integer)
    emi_amount = Column(Float)
    status = Column(String, default="pending")  # pending, active, paid, defaulted
    disbursed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## 5.3 Transaction Model

```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    loan_id = Column(String, ForeignKey("loans.id"), nullable=True)
    amount = Column(Float)
    type = Column(String)  # payment, reward, cashback
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)
```

## 5.4 Streak Model

```python
class CheckIn(Base):
    __tablename__ = "checkins"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_checkin = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## 5.5 Spin Record Model

```python
class SpinRecord(Base):
    __tablename__ = "spin_records"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    prize_coins = Column(Integer)
    is_jackpot = Column(Boolean, default=False)
    spin_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

# 6. API Endpoints Reference

## 6.1 Authentication Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/auth/login` | POST | Telegram login | No |
| `/api/v1/auth/verify` | GET | Verify token | Yes |
| `/api/v1/auth/refresh` | POST | Refresh JWT | Yes |

## 6.2 User Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/users/me` | GET | Get current user | Yes |
| `/api/v1/users/profile` | PUT | Update profile | Yes |
| `/api/v1/users/kyc` | POST | Submit KYC | Yes |
| `/api/v1/users/wallet` | GET | Get wallet | Yes |

## 6.3 Loan Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/loans/` | GET | List loans | Yes |
| `/api/v1/loans/` | POST | Create loan | Yes |
| `/api/v1/loans/{id}` | GET | Get loan | Yes |
| `/api/v1/loans/{id}/pay` | POST | Make payment | Yes |
| `/api/v1/eligibility/check` | POST | Check eligibility | Yes |

## 6.4 Rewards Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/spinwheel/spin` | POST | Spin wheel | Yes |
| `/api/v1/spinwheel/status` | GET | Get spin status | Yes |
| `/api/v1/streak/checkin` | POST | Daily check-in | Yes |
| `/api/v1/streak/status` | GET | Get streak | Yes |
| `/api/v1/cashback/calculate` | POST | Calculate cashback | Yes |

## 6.5 Social Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/achievements` | GET | List achievements | Yes |
| `/api/v1/leaderboard/{type}` | GET | Get leaderboard | Yes |
| `/api/v1/referrals` | GET | Get referrals | Yes |
| `/api/v1/referrals/share` | POST | Share referral | Yes |

## 6.6 Payment Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/payments/` | GET | List payments | Yes |
| `/api/v1/payments/create` | POST | Create payment | Yes |
| `/api/v1/payments/{id}/confirm` | POST | Confirm payment | Yes |

---

# 7. Phase-by-Phase Feature Details

## Phase 1: Acquisition & Lead Capture

### Feature: Interactive Eligibility Checker
- **Description**: Real-time loan eligibility without hard credit pulls
- **User Flow**: Questions → Soft Check → Instant Result
- **API**: `/api/v1/eligibility/check`
- **Database**: No new tables (uses existing user data)

### Feature: Spin Wheel
- **Description**: Daily lucky spin with coin rewards
- **User Flow**: Navigate → Spin → Win Coins
- **Logic**:
  ```python
  PRIZES = [
      {"coins": 10, "probability": 0.40},
      {"coins": 25, "probability": 0.25},
      {"coins": 50, "probability": 0.15},
      {"coins": 100, "probability": 0.10},
      {"coins": 200, "probability": 0.05},
      {"coins": 500, "probability": 0.05}
  ]
  ```
- **API**: `/api/v1/spinwheel/spin`

## Phase 2: Onboarding & KYC Pre-fill

### Feature: Document Upload
- **Description**: Upload ID and selfie before full onboarding
- **Documents**: National ID, Passport, Driver's License
- **API**: `/api/v1/users/kyc`
- **Storage**: Secure file storage (not in main DB)

## Phase 3: Qualification & Segmentation

### Feature: Credit Score
- **Description**: 300-850 credit score with factors
- **Factors**:
  - Payment History (35%)
  - Credit Utilization (30%)
  - Credit History (15%)
  - New Credit (10%)
  - Credit Mix (10%)
- **API**: `/api/v1/credit/score`
- **Grades**: Poor (300-579), Fair (580-669), Good (670-739), Very Good (740-799), Excellent (800-850)

## Phase 4: Referral & Viral Growth

### Feature: Referral System
- **Description**: User refers friends, earns rewards
- **Code Generation**: Auto-generated unique code
- **Reward**: 10 coins per successful referral
- **API**: `/api/v1/referrals`

## Phase 5: Incentive & Reward Systems

### Feature: Cashback Wallet
- **Description**: Track earned rewards and cashback
- **Features**:
  - Balance display
  - Transaction history
  - Withdrawable amount
- **API**: `/api/v1/wallet`

### Feature: Check-in Streaks
- **Description**: Consecutive daily check-ins
- **Milestones**: 3, 7, 14, 30, 60, 90 days
- **API**: `/api/v1/streak/checkin`

### Feature: Achievement System
- **Description**: Unlock badges through engagement
- **Tiers**: Bronze, Silver, Gold
- **Examples**:
  - Welcome (Bronze): First login - 10 coins
  - Month Warrior (Gold): 30-day streak - 300 coins
  - Influencer (Gold): Refer 10 friends - 500 coins

## Phase 6: Pre-Activation Engagement

### Feature: Loan Calculator
- **Description**: Calculate EMI and amortization
- **Formula**:
  ```
  EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
  Where:
    P = Principal
    r = Monthly interest rate
    n = Number of months
  ```
- **API**: Local calculation (no backend)

## Phase 7: Loan Application & Micro-Lending

### Feature: AI Loan Advisor
- **Description**: Smart personalized recommendations
- **Analysis**:
  - Credit Score impact
  - Income verification
  - Employment stability
  - Existing loans
- **Output**: Match score (0-95%)
- **API**: `/api/v1/recommendations`

---

# 8. Deployment Guide

## 8.1 Prerequisites

### System Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB | 50 GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04+ |

### Required Software
- Python 3.11+
- Node.js 18+ (optional for build)
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

---

## 8.2 Starting Servers (Without Docker)

### Step 1: Database Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE telegram_bank;
CREATE USER bank_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE telegram_bank TO bank_user;
\q
```

### Step 2: Redis Setup (Optional)

```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Step 3: Backend Setup

```bash
# Navigate to project
cd Telegram-MiniApp-Banks

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
cd apps/backend
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://bank_user:your_secure_password@localhost:5432/telegram_bank"
export SECRET_KEY="your-secret-key"
export TELEGRAM_BOT_TOKEN="your-bot-token"
export REDIS_URL="redis://localhost:6379"

# Run migrations
alembic upgrade head

# Start backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4: Frontend Setup (Simple HTTP Server)

```bash
# Navigate to frontend
cd apps/frontend

# Start Python HTTP server
python -m http.server 3000
# OR use Node.js
npx serve -p 3000
```

### Step 5: Verify Services

```bash
# Test backend
curl http://localhost:8000/health

# Response should be:
# {"status": "ok"}

# Test frontend
curl http://localhost:3000
```

---

## 8.3 Starting Servers (With Docker)

### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER
logout && login
```

### Step 2: Create Docker Compose File

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: telegram_bank
      POSTGRES_USER: bank_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bank_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://bank_user:your_secure_password@postgres:5432/telegram_bank
      - SECRET_KEY=your-secret-key
      - TELEGRAM_BOT_TOKEN=your-bot-token
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./apps/frontend:/usr/share/nginx/html:ro
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Step 3: Start All Services

```bash
# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

---

## 8.4 Stopping Servers

### Without Docker

```bash
# Stop backend (Ctrl+C in terminal or)
pkill -f uvicorn

# Stop frontend
pkill -f "http.server"

# Stop PostgreSQL
sudo systemctl stop postgresql

# Stop Redis
sudo systemctl stop redis-server
```

### With Docker

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (including data)
docker-compose down -v

# Stop specific container
docker-compose stop backend

# Restart specific container
docker-compose restart backend
```

---

## 8.5 Quick Reference Commands

| Action | Without Docker | With Docker |
|--------|---------------|------------|
| Start Backend | `uvicorn main:app --reload` | `docker-compose up -d backend` |
| Start Frontend | `python -m http.server 3000` | `docker-compose up -d frontend` |
| Stop All | `pkill -f uvicorn` | `docker-compose down` |
| View Logs | `tail -f app.log` | `docker-compose logs -f` |
| Run Migrations | `alembic upgrade head` | `docker-compose exec backend alembic upgrade head` |
| Create Migration | `alembic revision --autogenerate` | `docker-compose exec backend alembic revision --autogenerate` |
| DB Shell | `psql -U bank_user` | `docker-compose exec postgres psql -U bank_user` |

---

# 9. Troubleshooting

## 9.1 Common Issues

### Issue: "Connection refused" to backend
**Solution**: Check if backend is running
```bash
curl http://localhost:8000/health
```

### Issue: "Database connection failed"
**Solution**: Verify PostgreSQL is running
```bash
sudo systemctl status postgresql
```

### Issue: "JWT token expired"
**Solution**: Login again or refresh token
```javascript
// Frontend: Clear stored token
localStorage.removeItem('token');
window.location.reload();
```

### Issue: "CORS error"
**Solution**: Add CORS middleware in backend
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "Migration conflicts"
**Solution**: Reset migrations
```bash
# Backup data, then:
rm -rf alembic/versions/
alembic init alembic
alembic revision --autogenerate
alembic upgrade head
```

---

# Appendix: Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | JWT signing key | `your-256-bit-secret` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | `123456:ABC-DEF1234ghIkl-0x1y2z3A4B` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `API_BASE_URL` | Frontend API URL | `http://localhost:8000` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |

---

*Document Version: 1.0*
*Last Updated: 2026-04-21*
*Project: Telegram Mini App Bank*


## WebSocket Implementation Complete!

I've added WebSocket functionality for **all 4 features** you requested:

### 1️⃣ Loan Status Notifications
- Real-time alerts when loan is approved/disbursed
- Endpoint: `/ws/notifications/{user_id}`
- Auto-reconnect on disconnect

### 2️⃣ Payment Notifications
- Instant payment success/failure updates
- Sent via `notify_payment()` function

### 3️⃣ Customer Support Chat
- Real-time chat with support agents
- Endpoint: `/ws/chat/{user_id}`
- Broadcast to all in support room

### 4️⃣ Leaderboard Updates
- Live ranking changes
- Broadcast to leaderboard room

### Files Created/Updated

**Backend:**
- [`apps/backend/app/websocket.py`](apps/backend/app/websocket.py) - WebSocket manager with notification functions
- [`apps/backend/main.py`](apps/backend/main.py) - Added WebSocket router

**Frontend:**
- [`apps/frontend/src/utils/websocket.js`](apps/frontend/src/utils/websocket.js) - Client with event system
- [`apps/frontend/index.html`](apps/frontend/index.html) - Added script import
- [`apps/frontend/src/app.js`](apps/frontend/src/app.js) - Auto-connect on login

### How It Works

```javascript
// Frontend listens for events
window.wsClient.on("loan", (data) => {
  console.log("Loan update:", data);
});

window.wsClient.on("achievement", (data) => {
  window.showToast(data.message, "success");
});
```

```python
# Backend sends notifications
from app.websocket import notify_loan_status, notify_payment, notify_achievement

# When loan status changes
await notify_loan_status(user_id, loan_id, "approved", "Your loan is approved!")

# When payment completes
await notify_payment(user_id, payment_id, "completed", 100.00)

# When achievement unlocks
await notify_achievement(user_id, "first_loan", "First Loan", 50)
```

Real-time updates now work across the entire app!