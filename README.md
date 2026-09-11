# XEVYRA

### Train. Fuel. Evolve.

**XEVYRA** is a modern, AI-powered fitness tracking platform designed to bring workouts, nutrition, calorie tracking, progress analytics, and personalized diet coaching into one seamless experience.

Built with a mobile-first philosophy, XEVYRA provides a responsive web application and a Flutter mobile shell backed by a unified, secure API and MongoDB data layer.

---

## ✨ Features

### 🏋️ Workout Tracking

- Create and manage workout routines
- Exercise library with muscle-group categorization
- Live workout tracking
- Track:
  - Weight
  - Reps
  - Sets
  - Rest time
  - RPE
- Previous-session performance hints
- Personal Record (PR) detection
- Workout history
- Estimated 1RM tracking
- Training streaks
- Workout volume analytics
- Offline workout logging with automatic synchronization

### 🍎 Nutrition & Calorie Tracking

- Food database
- Food search
- Portion and serving calculations
- Breakfast, lunch, dinner and snack logging
- Calorie tracking
- Macronutrient tracking
  - Protein
  - Carbohydrates
  - Fat
- Daily nutrition summaries
- Custom foods
- Historical food snapshots
- Personalized calorie and macro targets

### 🤖 AI Fitness & Diet Coach

XEVYRA integrates AI through a secure server-side architecture to provide personalized nutrition assistance.

Capabilities include:

- AI-generated diet plans
- Personalized meal recommendations
- Meal replacement/swapping
- Dietary preference handling
- Food restriction handling
- Allergen-aware recommendations
- Structured AI responses
- AI usage quotas and rate limiting
- Prompt versioning
- Schema and business-rule validation

> AI-generated recommendations are intended as fitness and nutrition assistance and are not a substitute for professional medical advice.

### 📈 Progress Tracking

- Body-weight history
- Rolling weight trends
- Strength progression
- Estimated 1RM
- Workout volume
- Personal records
- Training consistency
- Progress visualization

### 🔐 Authentication

- Google Sign-In
- Firebase Authentication
- Firebase Admin SDK verification
- Secure server-side identity mapping
- User ownership isolation
- Secure session management

### 📱 Mobile Experience

XEVYRA is designed mobile-first and is available through:

- Responsive web application
- Flutter Android/iOS shell
- Flutter WebView
- Native Google authentication
- Network/connectivity detection
- Offline workout support
- Secure JavaScript bridge
- Deep-link support
- Safe-area handling

---

# 🏗️ Architecture

XEVYRA follows **Clean Architecture / Domain-Driven Design principles**.

```text
                         ┌──────────────────────┐
                         │      XEVYRA User     │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
             ┌──────▼──────┐                 ┌──────▼──────┐
             │   Next.js   │                 │   Flutter   │
             │     Web     │                 │   WebView   │
             └──────┬──────┘                 └──────┬──────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                              HTTPS / API
                                    │
                         ┌──────────▼──────────┐
                         │     Backend API     │
                         │ Node.js + TypeScript│
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐       ┌──────▼──────┐      ┌──────▼──────┐
       │   Firebase  │       │   MongoDB   │      │   OpenAI    │
       │     Auth    │       │    Atlas    │      │     API     │
       └─────────────┘       └─────────────┘      └─────────────┘
```

---

# 🧱 Clean Architecture

The backend is separated into four primary layers.

```text
Presentation
      ↓
Application
      ↓
Domain
      ↑
Infrastructure
```

## Domain

The domain layer contains pure business logic.

It has no direct dependency on:

- React
- Next.js
- Express
- MongoDB
- Firebase
- OpenAI
- HTTP
- UI frameworks

Examples include:

- BMR calculations
- TDEE calculations
- Macro calculations
- 1RM calculations
- Workout state transitions
- Nutrition aggregation
- Domain entities
- Value objects

## Application

Contains application use cases and orchestration.

Examples:

```text
CreateUser
UpdateFitnessProfile
CalculateNutritionTargets
LogFood
StartWorkout
LogWorkoutSet
FinishWorkout
GenerateDietPlan
SwapMeal
GetProgress
```

## Infrastructure

Responsible for external implementations.

Examples:

- MongoDB repositories
- Firebase Admin SDK
- OpenAI integration
- Logging
- External services

## Presentation

Responsible for:

- HTTP routes
- Controllers
- Request validation
- Authentication middleware
- Response formatting

---

# 📦 Monorepo Structure

```text
XEVYRA/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── ...
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── identity/
│   │   │   │   ├── profile/
│   │   │   │   ├── nutrition/
│   │   │   │   ├── training/
│   │   │   │   ├── progress/
│   │   │   │   └── ai-coaching/
│   │   │   ├── shared/
│   │   │   │   ├── auth/
│   │   │   │   ├── database/
│   │   │   │   ├── errors/
│   │   │   │   ├── http/
│   │   │   │   ├── logging/
│   │   │   │   └── validation/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── tests/
│   │
│   └── mobile/
│       ├── lib/
│       ├── test/
│       ├── android/
│       └── ios/
│
├── packages/
│   ├── domain/
│   ├── contracts/
│   ├── validation/
│   ├── config/
│   └── shared/
│
├── database/
│   ├── indexes/
│   └── seeds/
│
├── .env.example
├── package.json
├── tsconfig.base.json
├── turbo.json
└── README.md
```

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Web | Next.js |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Mobile | Flutter |
| Mobile Shell | WebView |
| Backend | Node.js |
| API | REST |
| Database | MongoDB Atlas |
| Authentication | Firebase Authentication |
| Server Auth | Firebase Admin SDK |
| Validation | Zod |
| AI | OpenAI API |
| Testing | Vitest / Playwright / Flutter Test |
| CI/CD | GitHub Actions |
| Monorepo | npm Workspaces / Turborepo |

---

# 🗄️ Database

XEVYRA uses **MongoDB Atlas** as its primary application database.

Core collections include:

```text
users
fitness_profiles
exercises
workout_templates
workout_sessions
workout_sets
foods
food_entries
daily_nutrition_summaries
weight_logs
diet_plans
ai_requests
notifications
audit_logs
idempotency_keys
```

User-owned documents contain a `userId` reference.

The backend derives the authenticated user from the verified Firebase identity.

Client-provided user IDs are never trusted for authorization.

---

# 🔐 Authentication Architecture

## Web

```text
Google
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
XEVYRA API
   ↓
Firebase Admin SDK
   ↓
MongoDB User
   ↓
Authenticated Session
```

## Flutter

```text
Google Sign-In
      ↓
Firebase Authentication
      ↓
Firebase ID Token
      ↓
Secure Session Establishment
      ↓
XEVYRA WebView
      ↓
XEVYRA API
```

### Security Rules

- Never expose Firebase Admin credentials to clients.
- Never put authentication tokens in URLs.
- Never trust client-provided user IDs.
- Verify Firebase ID tokens server-side.
- Enforce user ownership on protected resources.
- Use HTTPS in production.
- Do not log authentication tokens or credentials.

---

# 📡 API

The XEVYRA API is versioned under:

```text
/api/v1
```

Example endpoints:

```text
POST   /api/v1/auth/session
GET    /api/v1/auth/me
POST   /api/v1/auth/logout

GET    /api/v1/profile
PATCH  /api/v1/profile

GET    /api/v1/dashboard/summary

GET    /api/v1/foods/search
POST   /api/v1/foods

GET    /api/v1/nutrition/daily
POST   /api/v1/nutrition/entries
PATCH  /api/v1/nutrition/entries/:id
DELETE /api/v1/nutrition/entries/:id

GET    /api/v1/exercises

GET    /api/v1/workouts/templates
POST   /api/v1/workouts/templates

POST   /api/v1/workouts/sessions/start
POST   /api/v1/workout-sessions/:id/sets
PATCH  /api/v1/workout-sessions/:id/sets/:setId
POST   /api/v1/workouts/sessions/:id/finish

GET    /api/v1/progress/weight
GET    /api/v1/progress/strength/:exerciseId
GET    /api/v1/progress/volume

POST   /api/v1/diet/generate
GET    /api/v1/diet/plans/active
POST   /api/v1/diet/plans/:id/regenerate-meal
```

---

# 📦 API Response Format

## Success

```json
{
  "data": {}
}
```

## Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      {
        "field": "weightKg",
        "message": "Weight must be greater than zero"
      }
    ],
    "requestId": "req_123456"
  }
}
```

Standard error codes:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
RATE_LIMITED
AI_UNAVAILABLE
INTERNAL_ERROR
```

---

# 📴 Offline Workout System

Workout logging is designed to remain functional when gym connectivity is unreliable.

```text
User completes set
        ↓
IndexedDB
        ↓
Optimistic UI
        ↓
Network available?
    ┌───┴───┐
   YES      NO
    │        │
    ↓        ↓
   API    Sync Queue
             │
             ↓
       Network Returns
             │
             ↓
       FIFO Synchronization
             │
             ↓
            API
             │
             ↓
          MongoDB
```

Every client mutation can contain a unique:

```text
clientMutationId
```

This allows the server to safely identify and ignore duplicate submissions caused by retries or network failures.

---

# 🤖 AI Architecture

OpenAI is accessed exclusively from the backend.

```text
Client
  ↓
XEVYRA API
  ↓
Authentication
  ↓
Quota / Rate Limit
  ↓
User Fitness Data
  ↓
OpenAI
  ↓
Structured Output
  ↓
Zod Validation
  ↓
Business Rule Validation
  ↓
MongoDB
  ↓
Client
```

AI protections include:

- Server-side API keys
- Structured outputs
- Zod validation
- Business-rule validation
- Prompt versioning
- Usage quotas
- Rate limiting
- AI request auditing
- Controlled failure handling
- Dietary restriction checks
- Allergen constraints

---

# 🧮 Fitness Calculations

## BMR

XEVYRA uses the Mifflin-St Jeor equation.

### Male

```text
BMR =
10 × weight(kg)
+ 6.25 × height(cm)
- 5 × age
+ 5
```

### Female

```text
BMR =
10 × weight(kg)
+ 6.25 × height(cm)
- 5 × age
- 161
```

## TDEE

```text
TDEE = BMR × Activity Factor
```

## Estimated 1RM

Brzycki formula:

```text
1RM = weight × (36 / (37 - reps))
```

These calculations are implemented in the domain layer and independently tested.

---

# 🎨 User Experience

XEVYRA follows a **mobile-first consumer fitness design**.

## Primary Navigation

- Dashboard
- Workouts
- Nutrition
- Progress
- Profile

## Design Principles

- Premium dark-mode-first experience
- Athletic visual identity
- Clean typography
- Strong visual hierarchy
- Touch-friendly controls
- Responsive layouts
- Accessible interactions
- Minimal clutter
- Fast workout logging
- Meaningful animations
- Reduced-motion support

The application should feel like a consumer fitness product rather than a developer dashboard or administrative SaaS application.

---

# 📱 Responsive Web + Flutter

The responsive Next.js application is the primary user interface.

Flutter provides the native mobile shell and WebView environment.

Flutter responsibilities include:

- Native authentication
- WebView management
- Connectivity detection
- Deep links
- Native platform functionality
- Secure bridge communication
- Android/iOS lifecycle handling

The web application is designed to work across:

```text
320px
375px
390px
412px
768px
1024px
1280px
1440px+
```

---

# 🧪 Testing

XEVYRA uses a multi-level testing strategy.

## Unit Tests

Test:

- Domain entities
- Value objects
- BMR
- TDEE
- Macro calculations
- 1RM
- Validation schemas
- Business rules

## Integration Tests

Test:

- API endpoints
- Authentication middleware
- MongoDB repositories
- User ownership isolation
- Idempotency
- Error handling

## End-to-End Tests

Primary flow:

```text
Login
  ↓
Onboarding
  ↓
Log Food
  ↓
Start Workout
  ↓
Record Sets
  ↓
Finish Workout
  ↓
View Progress
```

## Flutter Tests

Test:

- WebView shell
- Native bridge
- Authentication
- Connectivity
- Widget rendering

---

# 🔒 Security

Security is built into the architecture rather than added as a final step.

Controls include:

- Firebase token verification
- Authorization middleware
- User ownership isolation
- Zod validation
- NoSQL injection protection
- XSS protection
- CSRF protection
- CORS restrictions
- Content Security Policy
- HSTS
- Secure cookies
- Rate limiting
- Request IDs
- Sanitized error responses
- Structured logging
- Audit logging
- Secret isolation
- HTTPS-only production communication

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js
- npm or pnpm
- Flutter SDK
- MongoDB Atlas account
- Firebase project

Optional:

- Redis
- OpenAI API access

## Clone

```bash
git clone <repository-url>
cd XEVYRA
```

## Install Dependencies

```bash
pnpm install
```

## Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Configure the required environment variables.

Example:

```env
NODE_ENV=development

MONGODB_URI=
MONGODB_DB_NAME=xevyra

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

OPENAI_API_KEY=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> Never commit `.env` files or production credentials.

---

# 🛠️ Development Commands

Install dependencies:

```bash
pnpm install
```

Start development:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Run coverage:

```bash
pnpm test:coverage
```

Type check:

```bash
pnpm typecheck
```

Lint:

```bash
pnpm lint
```

Build:

```bash
pnpm build
```

Apply MongoDB indexes:

```bash
pnpm db:index
```

---

# 🌍 Environment Strategy

XEVYRA separates:

```text
Development
     ↓
Staging
     ↓
Production
```

Each environment should have independent:

- MongoDB databases
- Firebase configuration
- API credentials
- OpenAI configuration
- Secrets
- Monitoring

Production credentials must never be used for local development.

---

# 🚢 CI/CD

GitHub Actions is responsible for automated validation.

```text
Pull Request / Push
        ↓
Lint
        ↓
Typecheck
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Flutter Tests
        ↓
Security Checks
        ↓
Build
        ↓
Staging
        ↓
E2E Smoke Tests
        ↓
Production Approval
        ↓
Production
```

---

# 📊 Observability

Production deployments should provide:

- Structured logging
- Request IDs
- API health checks
- MongoDB health checks
- Error tracking
- Performance monitoring
- Authentication event auditing
- AI request monitoring
- Rate-limit monitoring

Sensitive credentials must never be written to logs.

---

# 🗺️ Roadmap

## MVP — V1.0

- [x] Monorepo foundation
- [x] Clean Architecture foundation
- [x] API foundation
- [x] MongoDB infrastructure
- [x] Firebase foundation
- [x] Responsive web foundation
- [x] Flutter WebView foundation
- [ ] Google Authentication
- [ ] Fitness profile
- [ ] BMR / TDEE calculations
- [ ] Calorie tracking
- [ ] Macro tracking
- [ ] Food search
- [ ] Food logging
- [ ] Workout routines
- [ ] Live workout logging
- [ ] Rest timer
- [ ] Offline synchronization
- [ ] PR tracking
- [ ] Progress analytics
- [ ] AI diet planner
- [ ] AI meal replacement
- [ ] Settings
- [ ] Data export
- [ ] Account deletion

## V1.1 / V2.0

- [ ] Full PWA caching
- [ ] Advanced data export
- [ ] Progress photos
- [ ] Tamil localization
- [ ] Hindi localization
- [ ] Redis background queues
- [ ] Native push notifications
- [ ] Barcode scanner
- [ ] Recipe builder
- [ ] Exercise demonstrations
- [ ] Superset support
- [ ] Advanced nutrition analytics

## Future

- [ ] Apple Health integration
- [ ] Android Health Connect
- [ ] Wearable integrations
- [ ] Social feed
- [ ] Leaderboards
- [ ] Challenges
- [ ] Trainer portals
- [ ] Coach-client management
- [ ] Billing and subscriptions
- [ ] Advanced AI coaching
- [ ] Voice fitness coach

---

# 📸 Screenshots

Screenshots will be added as the consumer-facing XEVYRA UI is finalized.

Recommended structure:

```text
docs/
└── images/
    ├── login.png
    ├── dashboard.png
    ├── workouts.png
    ├── nutrition.png
    └── progress.png
```

Example:

```markdown
![XEVYRA Dashboard](docs/images/dashboard.png)
```

---

# 🧭 Engineering Principles

### Mobile First

Every core experience should work exceptionally well on mobile devices.

### Offline Resilience

Workout logging should remain usable even when connectivity is unreliable.

### Security by Default

Authentication, authorization, validation and data isolation are architectural requirements.

### Domain Independence

Core fitness logic remains independent of frameworks and infrastructure.

### API First

Web and Flutter consume the same backend APIs and contracts.

### AI as an Assistant

AI enhances the fitness experience but does not replace authoritative user data or professional medical guidance.

### Test Before Scale

New functionality should have appropriate automated tests before being considered complete.

---

# 📌 Project Status

**Status:** 🚧 Active Development

**Current Phase:** Phase 1 — Repository Setup, Monorepo & Foundational Architecture

**Phase 1 Status:** ✅ Approved with Minor Adjustments

XEVYRA's foundational monorepo, Clean Architecture boundaries, API infrastructure, validation system, MongoDB foundation, Firebase foundation, responsive web foundation, Flutter WebView shell, and initial automated testing infrastructure have been established.

The next milestone is:

**Phase 2 — Authentication, Identity & Session Management**

---

# 🤝 Contributing

Contributions, ideas and feedback are welcome as XEVYRA evolves.

Before submitting a pull request:

1. Create a focused branch.
2. Follow the existing architecture.
3. Add tests for new functionality.
4. Run linting.
5. Run type checking.
6. Run the test suite.
7. Verify the production build.
8. Keep security and user data isolation in mind.

---

# 📜 License

License information will be added before public distribution.

---

<p align="center">
  <strong>XEVYRA — Train. Fuel. Evolve.</strong>
</p>
