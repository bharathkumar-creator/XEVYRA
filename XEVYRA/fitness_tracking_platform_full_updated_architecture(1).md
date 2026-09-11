## XEVYRA :Fitness Tracking Platform — Full Production Architecture



> \*\*Implementation specification for Antigravity\*\*
>
> Build this as a production-quality, mobile-first fitness tracking platform from day one.
>
> \*\*Important:\*\* Flutter + WebView is NOT a future feature. The responsive web application and Flutter mobile application are two first-class clients of the same backend from the initial release.
>
> \*\*Database:\*\* MongoDB
>
> \*\*Authentication:\*\* Firebase Authentication with Google Sign-In
>
> \*\*AI:\*\* OpenAI API through the backend only.

\---

# 1\. Product Vision

Build a secure, scalable and friendly fitness platform where users can:

* Sign up/sign in with Google
* Use the responsive web application
* Use the same application through a Flutter mobile shell/WebView
* Maintain a fitness profile
* Track body weight
* Track daily calories
* Track protein, carbohydrates and fat
* Search and log foods
* Create workout plans
* Perform workouts
* Record exercises, sets, weight and reps
* See previous performance while training
* Track strength progression
* Track weight progression
* Generate personalized diet plans with AI
* Replace individual meals
* View historical analytics
* Work reliably on mobile
* Continue workout logging through temporary offline storage when connectivity is unavailable

The system must be designed so that:

```text
Web Client ────────┐
                   │
Flutter WebView ───┼──► Same Backend API ───► MongoDB
                   │              │
Future Native UI ──┘              └──────────► OpenAI
```

There must be **one source of truth for business logic and user data**.

\---

# 2\. Non-Negotiable Architecture Rules

1. Flutter and Web are first-class clients from day one.
2. MongoDB is the primary application database.
3. Firebase Authentication handles identity.
4. The backend verifies Firebase ID tokens.
5. OpenAI keys never reach browsers or Flutter.
6. Business logic lives in the backend/domain layer.
7. Flutter must not duplicate backend business rules.
8. WebView must not contain secrets.
9. Every user-owned database operation must enforce ownership server-side.
10. Every external input must be validated server-side.
11. The client never decides which user owns a record.
12. MongoDB remains the source of truth.
13. Redis is optional infrastructure for cache/rate limiting/queues, not the primary database.
14. Workout logging should be resilient to temporary network failure.
15. The UI must be mobile-first and touch-friendly.
16. Accessibility must be considered from the beginning.
17. AI output must be schema-validated before being persisted or displayed as trusted application data.
18. Health/fitness calculations are estimates and must not be represented as medical diagnoses.
19. Secrets must be managed outside source control.
20. Production and development environments must use separate resources.

\---

# 3\. High-Level System Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌───────────────────┐          ┌────────────────────┐
          │ Responsive Web    │          │ Flutter Mobile App │
          │ Next.js + React   │          │                   │
          │ TypeScript        │          │ WebView            │
          │ Mobile-first      │          │ Native shell       │
          └─────────┬─────────┘          └─────────┬──────────┘
                    │                              │
                    └──────────────┬───────────────┘
                                   │ HTTPS
                                   ▼
                         ┌─────────────────────┐
                         │ Backend API         │
                         │                     │
                         │ Authentication      │
                         │ Authorization       │
                         │ Validation          │
                         │ Use Cases            │
                         │ Domain Rules        │
                         │ Rate Limiting       │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │ MongoDB        │  │ Redis          │  │ OpenAI         │
       │ Primary DB     │  │ Cache/Rate     │  │ AI Service     │
       │                │  │ Limit/Queue    │  │                │
       └────────────────┘  └────────────────┘  └────────────────┘
                │
                ▼
       ┌────────────────┐
       │ Object Storage │
       │ Future photos  │
       └────────────────┘

Authentication:

Web / Flutter
      │
      ▼
Firebase Authentication
      │
      ▼
Google OAuth
      │
      ▼
Firebase ID Token
      │
      ▼
Backend verifies token
      │
      ▼
Application User
```

\---

# 4\. Technology Stack

## Web

Use:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Accessible component library such as shadcn/ui
* React Hook Form
* Zod
* TanStack Query where useful
* Recharts or equivalent
* PWA support

## Mobile

Use:

* Flutter
* Dart
* WebView package suitable for production
* Native system authentication flow where required
* Secure storage only for native credentials/state that genuinely needs persistence
* Network/connectivity detection
* Deep-link handling
* Android/iOS safe-area support

The Flutter application should initially be a thin native shell around the responsive web application.

## Backend

Recommended:

* Node.js
* TypeScript
* Next.js API routes or a dedicated Node backend
* Zod
* MongoDB
* MongoDB Node.js Driver or Mongoose

For a growing production backend, prefer a dedicated backend module/service architecture even if deployed inside the same repository initially.

## Authentication

* Firebase Authentication
* Google provider
* Firebase Admin SDK on the backend
* Firebase ID token verification
* Server-side application user mapping

## Database

* MongoDB Atlas
* Replica set
* Proper indexes
* Transactions where required
* TTL indexes where appropriate
* Atlas monitoring
* Automated backups

## Cache / infrastructure

Optional but recommended:

* Redis
* Rate limiting
* Idempotency
* Short-lived cache
* Job queues

## AI

* OpenAI API
* Backend-only API calls
* Structured output
* Zod validation
* Quotas
* Rate limiting
* Prompt versioning

\---

# 5\. Monorepo Structure

Recommended:

```text
fitness-platform/
│
├── apps/
│   │
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   ├── mobile/
│   │   ├── android/
│   │   ├── ios/
│   │   ├── lib/
│   │   └── pubspec.yaml
│   │
│   └── api/
│       ├── src/
│       └── tests/
│
├── packages/
│   │
│   ├── domain/
│   ├── contracts/
│   ├── validation/
│   ├── config/
│   └── shared/
│
├── database/
│   ├── seeds/
│   └── indexes/
│
├── infrastructure/
│   ├── docker/
│   └── deployment/
│
├── docs/
│
├── .env.example
├── package.json
└── README.md
```

If Antigravity prefers a simpler initial repository, the backend can live under `src/`, but maintain the same logical separation.

\---

# 6\. Clean Architecture

Use:

```text
┌─────────────────────────────────────────┐
│ Presentation                            │
│ Web UI / Flutter Shell / API Controllers│
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Application                            │
│ Use Cases / Commands / Queries          │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Domain                                 │
│ Entities / Value Objects / Rules        │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Infrastructure                         │
│ MongoDB / Firebase / Redis / OpenAI     │
└─────────────────────────────────────────┘
```

The domain layer must not import:

```text
React
Next.js
Flutter
MongoDB
Mongoose
Firebase SDK
OpenAI SDK
Redis
HTTP libraries
```

The domain should be framework-independent.

\---

# 7\. Backend Structure

```text
apps/api/src/

├── modules/
│   │
│   ├── identity/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── profile/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── nutrition/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── training/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── progress/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── ai-coaching/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│
├── shared/
│   ├── auth/
│   ├── errors/
│   ├── validation/
│   ├── logging/
│   ├── security/
│   ├── database/
│   ├── http/
│   └── config/
│
└── server.ts
```

\---

# 8\. Bounded Contexts

Separate the application into:

```text
Identity
Profiles
Nutrition
Training
Progress
AI Coaching
Notifications
```

Future:

```text
Billing
Wearables
Social
Trainer
Challenges
```

Do not turn the entire application into one giant module.

\---

# 9\. Firebase Authentication Architecture

Firebase is responsible for:

```text
Identity
Google authentication
Email identity if enabled later
Credential provider management
```

The application's database is responsible for:

```text
Application user profile
Fitness data
Nutrition data
Workout data
Preferences
Application roles
```

Do not put fitness data into Firebase Authentication.

\---

# 10\. Google Sign-In Flow — Web

```text
User
 │
 ▼
Web Login
 │
 ▼
Firebase Authentication
 │
 ▼
Google
 │
 ▼
Google consent/login
 │
 ▼
Firebase
 │
 ▼
Firebase authenticated user
 │
 ▼
Frontend obtains Firebase ID token
 │
 ▼
HTTPS request to backend
 │
Authorization: Bearer <ID\_TOKEN>
 │
 ▼
Backend Firebase Admin SDK
 │
 ▼
verifyIdToken()
 │
 ▼
Extract Firebase UID
 │
 ▼
Find/create application user
 │
 ▼
Return application session/user state
```

The backend must not trust:

```text
userId from request body
```

It trusts the verified Firebase token.

\---

# 11\. Flutter Google Authentication

Flutter is a first-class client.

Preferred flow:

```text
Flutter
 │
 ▼
Firebase Authentication / native Google sign-in
 │
 ▼
Google
 │
 ▼
Firebase user
 │
 ▼
Firebase ID token
 │
 ▼
Backend API
```

The native Flutter application must not contain:

```text
OPENAI\_API\_KEY
DATABASE\_URL
BACKEND\_PRIVATE\_KEY
FIREBASE\_ADMIN\_PRIVATE\_KEY
```

Firebase client configuration values are not equivalent to backend secrets, but they should still be configured using the correct platform configuration and Firebase security rules.

\---

# 12\. Flutter + WebView Architecture

The Flutter app is:

```text
Flutter Native Shell
 ├── Splash
 ├── Network handling
 ├── WebView
 ├── Deep links
 ├── Back navigation
 ├── External URL handling
 └── Native integrations
```

The WebView loads:

```text
https://app.example.com
```

The responsive web application remains the primary UI.

Do not duplicate the full fitness UI in Flutter unless there is a product requirement to do so.

\---

# 13\. WebView Authentication Strategy

Do not rely on blindly opening every Google OAuth page inside an embedded WebView.

Google authentication flows may have browser/security restrictions.

Use the appropriate Firebase-supported/native Google sign-in flow for Flutter.

After native authentication:

```text
Flutter
 ↓
Firebase authenticated user
 ↓
Get Firebase ID token
 ↓
Backend authentication
```

For the WebView itself, establish a secure authenticated application session using a documented bridge/deep-link/cookie strategy.

Never inject raw credentials into JavaScript.

Never pass passwords through Flutter → WebView.

Never expose Firebase Admin credentials to the client.

\---

# 14\. WebView JavaScript Bridge

Only expose a minimal native bridge if required.

Example:

```text
window.flutterBridge
```

Allowed operations should be explicit:

```text
requestNativeAuth
getAppVersion
openExternalUrl
shareContent
```

Never expose:

```text
database access
admin operations
API secrets
Firebase Admin operations
arbitrary native method execution
```

Validate all messages coming from WebView JavaScript.

\---

# 15\. WebView Security

Configure:

* HTTPS only
* Disable arbitrary navigation where possible
* Allow only trusted domains
* Restrict external URL schemes
* Prevent untrusted iframe injection
* Avoid unrestricted JavaScript bridges
* Do not load HTTP resources
* Handle certificates correctly
* Do not disable TLS verification
* Clear WebView data on logout when required
* Handle cookies securely
* Prevent sensitive content from being captured where platform policies permit

\---

# 16\. User Domain Model

Application user:

```text
User
{
  \_id
  firebaseUid
  email
  displayName
  avatarUrl
  timezone
  locale
  units
  role
  status
  createdAt
  updatedAt
}
```

Important:

```text
firebaseUid: UNIQUE
email: indexed
```

Do not use email as the primary ownership identifier.

Use the internal user ID.

\---

# 17\. Fitness Profile

```text
FitnessProfile
{
  userId
  dateOfBirth
  biologicalSex
  heightCm
  currentWeightKg
  targetWeightKg
  goal
  activityLevel
  dietaryPreference
  trainingExperience
  weeklyWorkoutTarget
  preferredMealCount
  foodRestrictions\[]
  allergies\[]
  updatedAt
}
```

Do not unnecessarily collect personal information.

\---

# 18\. Nutrition Model

Collections:

```text
foods
food\_entries
daily\_nutrition\_summaries
nutrition\_targets
```

Food:

```text
Food
{
  \_id
  name
  brand
  servingSize
  servingUnit
  calories
  protein
  carbohydrates
  fat
  fiber
  source
  verified
  createdAt
  updatedAt
}
```

Food entry:

```text
FoodEntry
{
  \_id
  userId
  dateKey
  mealType
  foodId
  foodNameSnapshot
  servingAmount
  servingUnit
  calories
  protein
  carbohydrates
  fat
  createdAt
  updatedAt
}
```

Store nutrition snapshots so historical entries do not silently change if the food database changes.

\---

# 19\. Daily Nutrition

Use a stable date key:

```text
dateKey = "YYYY-MM-DD"
timezone = user timezone
```

Example:

```text
DailyNutritionSummary
{
  userId
  dateKey
  calories
  protein
  carbohydrates
  fat
  targetCalories
  targetProtein
  targetCarbohydrates
  targetFat
  updatedAt
}
```

The summary can be derived/rebuilt from food entries.

Do not make a cached summary the only source of truth.

\---

# 20\. Calorie Calculation

Architecture:

```text
Profile
 ↓
BMR
 ↓
Activity multiplier
 ↓
TDEE
 ↓
Goal adjustment
 ↓
Daily calorie target
```

Keep calculations in the domain layer.

Version them:

```text
calculationVersion: "v1"
```

Never claim calorie targets are exact medical prescriptions.

\---

# 21\. Workout Domain

Separate:

```text
WorkoutTemplate
```

from:

```text
WorkoutSession
```

Example:

```text
WorkoutTemplate
 ├── Bench Press
 ├── Shoulder Press
 ├── Incline Dumbbell Press
 └── Triceps Pushdown
```

When started:

```text
WorkoutSession
 ├── Exercise Instance
 │    ├── Set
 │    ├── Set
 │    └── Set
 └── Exercise Instance
```

This preserves historical records.

\---

# 22\. Exercise Collection

```text
Exercise
{
  \_id
  name
  slug
  description
  category
  equipment
  primaryMuscleGroups\[]
  secondaryMuscleGroups\[]
  instructions\[]
  mediaUrl
  difficulty
  isSystemExercise
  createdAt
  updatedAt
}
```

System exercises should be distinguishable from user-created exercises.

\---

# 23\. Workout Set

```text
WorkoutSet
{
  \_id
  userId
  workoutSessionId
  workoutExerciseId
  setNumber
  weightKg
  reps
  rpe
  restSeconds
  completed
  clientMutationId
  createdAt
  updatedAt
}
```

`clientMutationId` supports offline synchronization and idempotency.

\---

# 24\. Workout Session

```text
WorkoutSession
{
  \_id
  userId
  templateId
  title
  status
  startedAt
  completedAt
  durationSeconds
  notes
  createdAt
  updatedAt
}
```

Statuses:

```text
PLANNED
IN\_PROGRESS
COMPLETED
ABANDONED
```

\---

# 25\. Workout UI

The active workout interface must be extremely fast.

```text
┌─────────────────────────────┐
│ ← Push Day          32:18   │
│                             │
│ Bench Press                 │
│                             │
│ SET   KG       REPS    ✓    │
│  1    40        12     ✓    │
│  2    50        10     ✓    │
│  3    55         8     ✓    │
│  4    55         7     ○    │
│                             │
│ Previous: 55kg × 8          │
│                             │
│ \[ + Add Set ]               │
│                             │
│ Rest: 01:24                 │
│                             │
│ \[ Complete Exercise ]       │
└─────────────────────────────┘
```

Requirements:

* Large touch targets
* Numeric keyboard
* Minimal typing
* Previous workout data
* Auto-fill option
* One-tap set completion
* Rest timer
* Workout autosave
* Offline queue
* Clear save state

\---

# 26\. Offline Workout Synchronization

This is important because gyms may have poor connectivity.

Architecture:

```text
User enters set
      ↓
Local WebView/browser storage
      ↓
UI updates immediately
      ↓
Sync queue
      ↓
Network available
      ↓
POST mutation
      ↓
Backend validates idempotency key
      ↓
MongoDB
      ↓
Sync confirmed
```

Use:

```text
clientMutationId = UUID
```

The server must ensure the same mutation cannot be inserted twice.

\---

# 27\. MongoDB Strategy

Use MongoDB for:

```text
User documents
Profiles
Food entries
Workout sessions
Workout sets
Diet plans
AI requests
Progress records
Preferences
```

MongoDB is well suited because workout and nutrition data are naturally document-oriented and can evolve over time.

However, do not blindly embed everything into one giant user document.

Use collections where records:

* grow indefinitely
* need independent querying
* need pagination
* are updated frequently
* have independent lifecycle

\---

# 28\. MongoDB Collections

Recommended:

```text
users
fitness\_profiles

exercises
workout\_templates
workout\_sessions
workout\_session\_exercises
workout\_sets

foods
food\_entries
daily\_nutrition\_summaries
nutrition\_targets

weight\_logs
body\_measurements

diet\_plans
diet\_plan\_meals

ai\_requests

notifications
audit\_logs
idempotency\_keys
```

\---

# 29\. MongoDB Embedding Rules

Embed when:

```text
Data belongs tightly to parent
Data is bounded
Data is usually retrieved together
Data does not grow indefinitely
```

Example:

```text
DietPlan
 └── meals\[]
```

Potentially reference when:

```text
Workout history
Food entries
Weight history
Large exercise history
```

Do not create a single document such as:

```text
User
 ├── 500 workouts
 ├── 10,000 food entries
 ├── 1,000 weight logs
 └── every AI plan
```

That creates document growth, update contention and inefficient reads.

\---

# 30\. MongoDB Indexes

Create indexes intentionally.

Examples:

```text
users:
  { firebaseUid: 1 } UNIQUE
  { email: 1 }

fitness\_profiles:
  { userId: 1 } UNIQUE

weight\_logs:
  { userId: 1, recordedAt: -1 }

food\_entries:
  { userId: 1, dateKey: -1 }
  { userId: 1, consumedAt: -1 }

workout\_sessions:
  { userId: 1, startedAt: -1 }
  { userId: 1, status: 1 }

workout\_sets:
  { userId: 1, workoutSessionId: 1 }
  { userId: 1, workoutExerciseId: 1, createdAt: -1 }

diet\_plans:
  { userId: 1, createdAt: -1 }

ai\_requests:
  { userId: 1, createdAt: -1 }
```

Add compound indexes based on actual query patterns.

Do not create indexes for every field.

\---

# 31\. MongoDB Transactions

Use transactions when multiple collections must change atomically.

Example:

```text
Complete Workout
  ↓
Update session
  ↓
Finalize workout exercise records
  ↓
Update derived statistics
```

Use a transaction where consistency requires it.

Avoid unnecessary multi-document transactions for simple writes.

MongoDB transactions require appropriate replica-set/Atlas configuration.

\---

# 32\. Data Ownership

Every user-owned document should include:

```text
userId
```

Backend query:

```text
{
  \_id: requestedId,
  userId: authenticatedUserId
}
```

Never:

```text
findById(requestedId)
```

for user-private resources without an ownership check.

This protects against IDOR/BOLA vulnerabilities.

\---

# 33\. API Architecture

Use:

```text
/api/v1/
```

Example:

```text
/api/v1/me
/api/v1/profile
/api/v1/weight
/api/v1/nutrition
/api/v1/foods
/api/v1/workouts
/api/v1/exercises
/api/v1/progress
/api/v1/diet
```

\---

# 34\. Profile API

```http
GET   /api/v1/profile
PATCH /api/v1/profile
```

Backend derives user from Firebase authentication.

\---

# 35\. Weight API

```http
GET    /api/v1/weight
POST   /api/v1/weight
DELETE /api/v1/weight/:id
```

Support:

```text
pagination
date filtering
timezone-aware display
```

\---

# 36\. Nutrition API

```http
GET    /api/v1/nutrition/daily?date=YYYY-MM-DD
POST   /api/v1/nutrition/entries
PATCH  /api/v1/nutrition/entries/:id
DELETE /api/v1/nutrition/entries/:id
```

Food search:

```http
GET /api/v1/foods/search?q=chicken
```

\---

# 37\. Workout API

```http
GET    /api/v1/workouts
POST   /api/v1/workouts

GET    /api/v1/workouts/:id
PATCH  /api/v1/workouts/:id
DELETE /api/v1/workouts/:id

POST   /api/v1/workouts/:id/start
POST   /api/v1/workouts/:id/finish

POST   /api/v1/workout-sessions/:id/sets
PATCH  /api/v1/workout-sessions/:id/sets/:setId
DELETE /api/v1/workout-sessions/:id/sets/:setId
```

\---

# 38\. Progress API

```http
GET /api/v1/progress/weight
GET /api/v1/progress/calories
GET /api/v1/progress/strength
GET /api/v1/progress/summary
```

Use server-side aggregation rather than downloading thousands of records to the browser.

\---

# 39\. AI Diet API

```http
POST /api/v1/diet/generate
GET  /api/v1/diet/plans
GET  /api/v1/diet/plans/:id
POST /api/v1/diet/plans/:id/regenerate-meal
```

AI requests must be authenticated and rate-limited.

\---

# 40\. Authentication Middleware

Every protected request:

```text
HTTP Request
    ↓
Extract Bearer token
    ↓
Validate token format
    ↓
Firebase Admin verifyIdToken
    ↓
Get firebaseUid
    ↓
Load application user
    ↓
Attach authenticated user context
    ↓
Controller
```

Example internal context:

```text
AuthenticatedUserContext
{
  userId
  firebaseUid
  email
  role
}
```

Controllers must not accept `userId` as a trusted ownership field.

\---

# 41\. Authorization

Authentication:

```text
Who are you?
```

Authorization:

```text
What are you allowed to do?
```

Use:

```text
authenticated user
+
resource ownership
+
role/permission
```

Future roles:

```text
USER
TRAINER
ADMIN
```

Do not give every authenticated user admin permissions.

\---

# 42\. Input Validation

Every API request must be validated.

Use Zod or equivalent.

Validate:

```text
body
query
path parameters
headers where applicable
```

Example:

```text
weightKg
  must be number
  must be > 0
  must be within sensible product limits
```

Never trust client validation.

\---

# 43\. Error Contract

Use a consistent response:

```json
{
  "error": {
    "code": "VALIDATION\_ERROR",
    "message": "Please check the entered values.",
    "requestId": "req\_xxxxx"
  }
}
```

Codes:

```text
UNAUTHORIZED
FORBIDDEN
NOT\_FOUND
VALIDATION\_ERROR
CONFLICT
RATE\_LIMITED
AI\_UNAVAILABLE
SERVICE\_UNAVAILABLE
INTERNAL\_ERROR
```

Never return:

```text
stack traces
MongoDB errors
filesystem paths
secret values
provider internals
```

\---

# 44\. Idempotency

Required for operations that can be retried.

Examples:

```text
Workout set creation
Food entry creation
AI generation
Webhook processing
```

Use:

```text
Idempotency-Key
```

or:

```text
clientMutationId
```

Example MongoDB uniqueness strategy:

```text
{
  userId,
  clientMutationId
}
```

with a unique compound index where appropriate.

\---

# 45\. Concurrency

Two devices may edit the same workout.

Use:

```text
version
updatedAt
```

or optimistic concurrency.

Example:

```text
Client version: 7
Server version: 8
```

Return:

```text
409 CONFLICT
```

when a stale update should not overwrite newer data.

\---

# 46\. AI Architecture

Never:

```text
Browser → OpenAI
Flutter → OpenAI
```

Correct:

```text
Web / Flutter
      ↓
Backend
      ↓
Authentication
      ↓
Rate limit
      ↓
Quota
      ↓
Load profile
      ↓
Calculate targets
      ↓
Build prompt
      ↓
OpenAI
      ↓
Validate structured response
      ↓
Business-rule validation
      ↓
Persist
      ↓
Return
```

\---

# 47\. AI Diet Input

Use:

```text
Goal
Age
Sex
Height
Current weight
Target weight
Activity level
Workout frequency
Diet preference
Cuisine preference
Meal count
Food restrictions
Allergies
Calorie target
Macro targets
```

Do not send unnecessary user information.

\---

# 48\. AI Structured Output

Expected conceptual output:

```json
{
  "title": "High Protein Fat Loss Plan",
  "dailyCalories": 2200,
  "macros": {
    "proteinGrams": 160,
    "carbohydratesGrams": 240,
    "fatGrams": 65
  },
  "meals": \[
    {
      "name": "Breakfast",
      "calories": 500,
      "foods": \[
        {
          "name": "Eggs",
          "quantity": "3",
          "calories": 210
        }
      ]
    }
  ]
}
```

Validate the complete response against a schema.

Never assume AI output is valid JSON or valid nutrition data.

\---

# 49\. AI Guardrails

The application should not present AI as a doctor.

Add safeguards around:

```text
Extreme calorie requests
Allergies
Eating-disorder-related requests
Pregnancy
Serious medical conditions
Medication interactions
Potentially dangerous dietary restrictions
```

When the request is high risk, recommend professional medical/dietetic guidance.

AI-generated diet plans should be presented as informational estimates.

\---

# 50\. AI Cost Control

Implement:

```text
Per-user daily quota
Per-user monthly quota
Global rate limit
Timeout
Maximum output size
Retry policy
Circuit breaker
Usage tracking
```

Example conceptual policy:

```text
Normal user:
limited generations/day

Premium future:
higher quota
```

Do not hard-code business limits in UI only.

The backend enforces them.

\---

# 51\. AI Prompt Versioning

Store prompts in code:

```text
ai/prompts/

diet-plan.v1.ts
meal-replacement.v1.ts
```

Persist:

```text
promptVersion
model
createdAt
requestId
```

Do not store unnecessary sensitive prompt payloads.

\---

# 52\. AI Request Collection

Conceptually:

```text
AIRequest
{
  \_id
  userId
  type
  promptVersion
  model
  status
  latencyMs
  tokenUsage
  createdAt
  completedAt
}
```

Avoid storing raw sensitive user data unless required for debugging/business purposes.

\---

# 53\. Mobile-First UI

The primary mobile navigation:

```text
┌──────────────────────────┐
│                          │
│       PAGE CONTENT       │
│                          │
│                          │
├──────────────────────────┤
│ Home │ Food │ Workout │  │
│      │      │ Progress │ │
└──────────────────────────┘
```

Recommended:

```text
Home
Nutrition
Workout
Progress
Profile
```

Desktop:

```text
Sidebar
 ├── Dashboard
 ├── Nutrition
 ├── Workouts
 ├── Progress
 ├── Diet
 └── Profile
```

\---

# 54\. Dashboard

The dashboard should answer:

```text
How many calories have I eaten?
How much protein?
What workout is next?
What is my weight trend?
What should I do now?
```

Example:

```text
Good evening 👋

Calories
1,640 / 2,200

Protein
118 / 160g

Today's Workout
Push Day
5 exercises

\[ Start Workout ]

Weight
74.2 kg
↓ weekly trend

Quick Add

\[ Food ]
\[ Weight ]
\[ Workout ]
```

\---

# 55\. Nutrition UX

```text
Today's Calories

       1,640
      /     \\
     / 2200  \\
    / calories \\
   ─────────────

Protein    118 / 160g
Carbs      180 / 240g
Fat         52 / 70g
```

Meal cards:

```text
Breakfast
520 kcal

Eggs
Dosa
Sambar

\[ + Add Food ]
```

\---

# 56\. Food Search UX

Search examples:

```text
chicken
chicken breast
100g rice
2 eggs
```

Serving selector:

```text
Chicken Breast

\[ 150 ] \[ g ]

Calories   248
Protein     46g
Carbs        0g
Fat          5g

\[ Add to Lunch ]
```

Make food logging fast enough to use multiple times per day.

\---

# 57\. AI Diet UX

The diet screen:

```text
Your AI Diet Plan

2,200 kcal
160g protein

Breakfast
──────────────
Eggs
Dosa
Sambar

\[ Replace Meal ]

Lunch
──────────────
Chicken
Rice
Vegetables

\[ Replace Meal ]

Snack
──────────────
Greek yogurt
Banana

Dinner
──────────────
Paneer
Chapati
Vegetables
```

Regenerating one meal should not delete the whole plan.

\---

# 58\. Progress UI

Include:

```text
Weight
Calories
Protein
Workout consistency
Strength
Personal records
```

Weight graph:

```text
90
85
80
75
70
   Jan Feb Mar Apr May
```

Strength:

```text
Bench Press

40kg × 8
      ↓
55kg × 10
```

Use trends/rolling averages where useful.

Do not interpret every short-term weight change as fat gain/loss.

\---

# 59\. Friendly UX

Use:

```text
Skeleton loading
Optimistic UI where safe
Toasts
Inline errors
Empty states
Undo actions where practical
Smooth transitions
Celebration states
```

Example:

```text
Workout completed 🎉

Great session.

Total volume
4,820 kg

\[ View Progress ]
```

Avoid shame-based messaging.

\---

# 60\. Responsive Breakpoints

Support at minimum:

```text
320px+
375px
390px
430px
768px
1024px
1280px+
```

Do not design only for one phone.

Support:

```text
portrait
landscape
touch
mouse
keyboard
desktop
tablet
WebView
```

\---

# 61\. Accessibility

Target WCAG 2.2 AA where practical.

Implement:

```text
Semantic HTML
Keyboard navigation
Visible focus
Screen-reader labels
Accessible forms
Accessible charts
Sufficient contrast
Reduced motion
Touch targets around 44px
No color-only status indicators
```

\---

# 62\. PWA

The web application should support:

```text
Installable PWA
Offline shell
Fast navigation
Caching of safe static resources
```

Do not cache private user data globally.

Use user-aware cache policies.

\---

# 63\. State Management

Separate:

### Server state

```text
profile
nutrition
workouts
progress
diet
```

### Local UI state

```text
modal
timer
selected exercise
form draft
navigation state
```

Do not put the entire application into one global store.

\---

# 64\. API Client

The Web and Flutter WebView should consume stable API contracts.

Use:

```text
DTOs
schemas
typed responses
consistent errors
```

Do not expose raw MongoDB documents directly.

\---

# 65\. Database DTO Separation

Do not return:

```text
MongoDB document
```

directly.

Use:

```text
MongoDB Document
      ↓
Repository
      ↓
Domain Entity
      ↓
Use Case
      ↓
Response DTO
      ↓
API
```

This prevents database implementation details from leaking into clients.

\---

# 66\. Time and Timezones

Store timestamps in UTC.

User profile stores:

```text
timezone
```

Example:

```text
Asia/Kolkata
```

Daily nutrition uses the user's local calendar day.

Do not assume:

```text
server timezone = user timezone
```

\---

# 67\. Units

Support:

```text
Metric
kg
cm

Imperial
lb
ft/in
```

Internally use:

```text
weight = kg
height = cm
```

Convert only at presentation boundaries.

\---

# 68\. Security Headers

Configure appropriate:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame-Ancestors
```

Do not copy a generic CSP blindly.

Configure it according to actual resources.

\---

# 69\. CSRF

If using cookie-based sessions:

```text
SameSite
Secure
HttpOnly
Origin checks
CSRF token where required
```

If the primary API uses Firebase Bearer tokens rather than cookies, CSRF exposure is different, but still review every browser state-changing request and any session-establishing endpoint.

\---

# 70\. XSS Protection

Never trust:

```text
User notes
Food notes
Workout notes
AI text
Profile fields
```

Avoid raw HTML rendering.

If HTML is genuinely required:

```text
sanitize
allowlist
```

before rendering.

\---

# 71\. NoSQL Injection Protection

MongoDB does not eliminate injection risks.

Never accept arbitrary MongoDB operators from clients.

Reject suspicious objects such as uncontrolled:

```text
$where
$gt
$ne
$regex
```

where the API expects primitive values.

Use strict DTO schemas.

Do not pass raw request bodies into MongoDB queries.

\---

# 72\. MongoDB Security

Production:

```text
MongoDB Atlas
Private networking where appropriate
TLS
Authentication enabled
Least-privilege DB users
IP/network restrictions
Encryption at rest
Automated backups
Monitoring
```

Application DB user should not have unrestricted administrative privileges.

\---

# 73\. Firebase Security

Firebase client credentials are not a replacement for backend authorization.

Backend must verify:

```text
Firebase ID token
```

using Firebase Admin SDK.

Do not trust:

```text
uid sent by frontend
email sent by frontend
role sent by frontend
```

Roles must come from trusted backend/Firebase claims/application DB.

\---

# 74\. Secret Management

Never commit:

```text
.env
service-account JSON
Firebase Admin private key
OpenAI key
MongoDB credentials
Redis credentials
```

Use:

```text
Local:
.env.local

Production:
managed secrets
```

Never expose:

```text
OPENAI\_API\_KEY
MONGODB\_URI
FIREBASE\_ADMIN\_PRIVATE\_KEY
FIREBASE\_ADMIN\_CLIENT\_EMAIL
```

to browser JavaScript or Flutter.

\---

# 75\. Environment Separation

Create:

```text
development
staging
production
```

Each must have separate:

```text
MongoDB database
Firebase project/config where appropriate
OpenAI credentials/limits
Redis
storage
analytics
```

Never connect local development to production fitness data.

\---

# 76\. Rate Limiting

Rate limit by:

```text
IP
Firebase UID/user ID
endpoint
operation type
```

Example categories:

```text
Normal GET:
higher limit

Mutation:
lower limit

AI:
strict limit

Authentication/session:
very strict limit
```

Use Redis for distributed rate limiting when multiple backend instances exist.

\---

# 77\. Request Protection

Limit:

```text
Request body size
Query length
Array sizes
Pagination size
File upload size
AI prompt size
```

Set timeouts.

Never allow unlimited:

```text
limit
offset
array entries
notes
AI input
```

\---

# 78\. File Uploads — Future-Proof

For progress photos:

```text
Client
 ↓
Backend authorization
 ↓
Signed upload URL
 ↓
Object storage
```

Use:

```text
Private bucket
File type validation
Size limits
Image dimension limits
Malware scanning where appropriate
Signed URLs
```

Do not store large images inside MongoDB documents.

\---

# 79\. Audit Logs

Log important security/business events:

```text
USER\_CREATED
LOGIN
LOGOUT
SESSION\_REVOKED
PROFILE\_UPDATED
WORKOUT\_STARTED
WORKOUT\_COMPLETED
AI\_GENERATED
ACCOUNT\_DELETED
SUSPICIOUS\_REQUEST
```

Do not log:

```text
password
Firebase tokens
OpenAI key
MongoDB URI
OAuth authorization code
private health details unnecessarily
```

\---

# 80\. Application Logging

Every request should have:

```text
requestId
timestamp
method
route
status
duration
userId when available
```

Use structured JSON logging.

Example:

```json
{
  "requestId": "req\_123",
  "route": "/api/v1/workouts",
  "method": "POST",
  "status": 201,
  "durationMs": 142
}
```

\---

# 81\. Observability

Monitor:

```text
5xx rate
4xx rate
API latency
MongoDB latency
MongoDB connections
Redis health
AI latency
AI errors
AI token usage
queue depth
rate-limit events
```

Use an error tracking system.

\---

# 82\. MongoDB Performance

Avoid:

```text
Unbounded arrays
Large user documents
Full collection scans
Missing indexes
Frequent large updates
N+1 queries
```

Use:

```text
Projection
Pagination
Indexes
Aggregation
Lean DTOs
Cursor-based pagination
```

\---

# 83\. Pagination

Use cursor pagination for large collections:

```text
GET /api/v1/workouts?limit=20\&cursor=...
```

Do not allow:

```text
limit=100000
```

Enforce maximum page size.

\---

# 84\. Redis

Redis may be used for:

```text
Rate limiting
Short-lived cache
Idempotency
Distributed locks
Job queues
Temporary synchronization state
```

Do not store the permanent fitness record only in Redis.

MongoDB is authoritative.

\---

# 85\. Background Jobs

Use workers for:

```text
Complex AI generation
Notifications
Analytics aggregation
Cleanup
Report generation
Data export
```

Architecture:

```text
API
 ↓
Create Job
 ↓
Redis Queue
 ↓
Worker
 ↓
MongoDB
```

The user-facing request should not wait unnecessarily for long-running work.

\---

# 86\. Caching

Safe candidates:

```text
Exercise library
Food reference data
Static configuration
Public content
```

User-private data requires strict user-specific cache keys.

Never return cached User A data to User B.

\---

# 87\. Data Privacy

Provide:

```text
View data
Edit data
Export data
Delete data
Delete account
```

Account settings:

```text
Profile
Units
Timezone
Notifications
Privacy
Sessions
Connected accounts
Export data
Delete account
```

Define retention policies before production.

\---

# 88\. Account Deletion

Deletion should be an explicit workflow.

Conceptually:

```text
User requests deletion
 ↓
Re-authenticate if required
 ↓
Confirm
 ↓
Disable account
 ↓
Delete/anonymize application data according to policy
 ↓
Delete Firebase identity
 ↓
Delete associated files
 ↓
Revoke sessions
 ↓
Audit event
```

Use a background job if deletion spans multiple systems.

\---

# 89\. Data Export

Allow export of:

```text
Profile
Weight history
Nutrition history
Workout history
Diet plans
```

Use a background job for large exports.

Return a temporary secure download URL.

\---

# 90\. Testing Strategy

## Unit tests

Test:

```text
BMR
TDEE
Macro calculation
Calorie calculations
Domain rules
Workout rules
Progress calculations
```

## Integration tests

Test:

```text
API
Authentication
MongoDB
Repositories
Use cases
Authorization
```

## E2E tests

Use Playwright or equivalent.

Test:

```text
Login
Onboarding
Weight logging
Food logging
Workout creation
Workout session
Set logging
Workout completion
Progress
Diet generation
Mobile layout
```

## Flutter tests

Test:

```text
Authentication
WebView loading
Back navigation
Deep links
Network failure
Native/WebView bridge
Logout
```

\---

# 91\. Security Testing

Test:

```text
User A → User B data
IDOR
NoSQL injection
XSS
CSRF where applicable
Token tampering
Expired Firebase tokens
Invalid Firebase tokens
Rate-limit bypass
Oversized requests
AI abuse
Prompt injection
Unauthorized admin operations
```

\---

# 92\. CI/CD

Pipeline:

```text
Git push
 ↓
Install
 ↓
Lint
 ↓
Type check
 ↓
Unit tests
 ↓
Integration tests
 ↓
Security scan
 ↓
Build
 ↓
Deploy staging
 ↓
E2E
 ↓
Production approval
 ↓
Production
```

Flutter:

```text
Flutter analyze
Flutter test
Android build
iOS build
```

Use protected production environments.

\---

# 93\. Database Deployment

MongoDB changes should be version-controlled.

Maintain:

```text
database/indexes/
database/migrations-or-scripts/
database/seeds/
```

When adding indexes:

```text
Development
 ↓
Test
 ↓
Staging
 ↓
Production
```

Monitor index build impact on large production collections.

\---

# 94\. MongoDB Backup

Production Atlas configuration should include:

```text
Automated backups
Point-in-time recovery where appropriate
Retention policy
Restore testing
```

A backup is not considered reliable until restoration has been tested.

\---

# 95\. Scalability

Initial production:

```text
Web
1+ instances

API
1+ stateless instances

MongoDB Atlas
Replica set

Redis
Managed

OpenAI
External
```

As traffic increases:

```text
CDN
 ↓
Load Balancer
 ↓
API instances
 ├── Instance A
 ├── Instance B
 └── Instance C
       │
       ▼
MongoDB Atlas
```

Keep backend instances stateless.

\---

# 96\. Stateless Backend

Do not depend on:

```text
in-memory user state
local filesystem
single server memory
```

Use:

```text
MongoDB
Redis
Object storage
Firebase
```

This allows horizontal scaling.

\---

# 97\. API Contract Versioning

Start:

```text
/api/v1
```

Breaking changes later:

```text
/api/v2
```

Prefer backward-compatible additions.

Do not unexpectedly rename response fields used by the Flutter/Web clients.

\---

# 98\. Mobile/Web API Compatibility

Because Flutter and Web use the same backend:

```text
API contract
      │
 ┌────┴────┐
 ▼         ▼
Web      Flutter
```

Maintain compatibility.

Avoid web-only assumptions such as:

```text
browser cookies required for every API
browser localStorage required
window object required
```

The API should work cleanly with authenticated Bearer tokens for clients that need them.

\---

# 99\. Flutter WebView API Authentication

The exact token/session bridge should be implemented securely.

Recommended conceptual architecture:

```text
Flutter native authentication
        ↓
Firebase ID token
        ↓
Backend establishes application authentication
        ↓
Secure WebView session
        ↓
Web app
```

Do not expose the Firebase ID token unnecessarily to page JavaScript.

Prefer secure native/browser mechanisms over injecting tokens into URLs.

Never use:

```text
https://app.example.com/login?token=...
```

because tokens in URLs can leak through:

```text
history
logs
analytics
referrers
screenshots
```

\---

# 100\. Deep Links

Reserve routes such as:

```text
fitnessapp://auth/callback
fitnessapp://workout/123
```

Only accept trusted deep-link destinations.

Validate:

```text
scheme
host
path
parameters
```

Do not allow arbitrary navigation.

\---

# 101\. WebView Loading States

Flutter should provide:

```text
Native splash
 ↓
Connectivity check
 ↓
WebView
 ↓
Web app loading
```

If offline:

```text
You're offline

Your saved workout entries will sync when you're back online.
```

Avoid showing a blank WebView.

\---

# 102\. Native Back Navigation

Android:

```text
Back
 ↓
Can WebView go back?
 ├── Yes → WebView back
 └── No → Flutter navigation/back
```

Prevent accidental app exit during an active workout where appropriate.

\---

# 103\. WebView External Links

Trusted application URLs:

```text
Open in WebView
```

External domains:

```text
Open in system browser
```

Never allow arbitrary unknown schemes.

Explicitly handle:

```text
http
https
mailto
tel
```

according to product requirements.

\---

# 104\. Frontend Architecture

Web:

```text
app/
 ├── auth
 ├── dashboard
 ├── nutrition
 ├── workouts
 ├── progress
 ├── diet
 └── profile
```

Components:

```text
components/
 ├── ui/
 ├── dashboard/
 ├── nutrition/
 ├── workout/
 ├── progress/
 ├── diet/
 └── navigation/
```

\---

# 105\. UI Design System

Create tokens for:

```text
Colors
Typography
Spacing
Radius
Shadows
Borders
Motion
```

Components:

```text
Button
Card
Input
Select
Dialog
BottomSheet
Toast
Tabs
Progress
Chart
Skeleton
EmptyState
BottomNavigation
Sidebar
```

\---

# 106\. Visual Direction

Target:

```text
Modern
Clean
Sporty
Friendly
Premium
Calm
Motivating
```

Avoid:

```text
Overloaded screens
Tiny text
Tiny controls
Excessive gradients
Too many charts
Aggressive fitness messaging
```

\---

# 107\. Microinteractions

Examples:

```text
Set completed
 → subtle confirmation

Food added
 → calorie counter updates smoothly

Workout completed
 → celebration state

Weight logged
 → trend updates

AI plan generated
 → meals reveal cleanly
```

Respect:

```text
prefers-reduced-motion
```

\---

# 108\. Empty States

Example:

```text
No workouts yet

Your first workout is waiting.

\[ Create Workout ]
```

Nutrition:

```text
Nothing logged today

Start with your first meal.

\[ Add Food ]
```

\---

# 109\. Error States

AI:

```text
We couldn't generate your plan right now.

Your existing plans are safe.

\[ Try Again ]
```

Workout sync:

```text
Couldn't sync this set.

\[ Retry ]
```

Never falsely claim data was saved if persistence failed.

\---

# 110\. Notifications

Future/initial options:

```text
Workout reminder
Meal logging reminder
Weight reminder
Diet plan reminder
Personal record
```

Allow user controls.

Do not spam.

\---

# 111\. Internationalization

Store:

```text
locale
timezone
```

Prepare for:

```text
English
Tamil
Hindi
```

All user-visible strings should eventually come from translation resources rather than hard-coded components.

\---

# 112\. Product Analytics

Track events such as:

```text
dashboard\_viewed
food\_added
workout\_started
workout\_completed
weight\_logged
diet\_generated
```

Do not put sensitive health details into analytics event names or unrestricted analytics metadata.

\---

# 113\. Feature Flags

Support:

```text
AI\_DIET\_GENERATOR
NEW\_WORKOUT\_UI
PROGRESS\_V2
OFFLINE\_SYNC
```

Allow gradual rollout.

\---

# 114\. Performance Targets

Prioritize:

```text
Fast first render
Fast navigation
Small JavaScript bundles
Optimized images
Server-side rendering where appropriate
Lazy loading
Indexed MongoDB queries
Pagination
Caching
```

Workout entry should feel instant.

\---

# 115\. Architecture for Future Features

Keep boundaries ready for:

```text
Wearables
Health Connect
Apple Health
Steps
Sleep
Heart rate
Running
Cycling
Progress photos
AI coaching
Trainer accounts
Social
Challenges
Subscriptions
```

Do not add unrelated fields to `users`.

Create separate modules/collections.

\---

# 116\. Example Create Weight Flow

```text
User
 ↓
Weight screen
 ↓
Enter 74.2kg
 ↓
POST /api/v1/weight
 ↓
Firebase token verification
 ↓
Authenticated user
 ↓
Zod validation
 ↓
CreateWeightLogUseCase
 ↓
WeightRepository
 ↓
MongoDB
 ↓
Response DTO
 ↓
UI update
```

\---

# 117\. Example Add Food Flow

```text
User searches chicken
 ↓
GET /foods/search
 ↓
Select food
 ↓
Select serving
 ↓
Client calculates display preview
 ↓
POST /nutrition/entries
 ↓
Backend validates serving
 ↓
Backend calculates/stores nutrition snapshot
 ↓
MongoDB
 ↓
Daily summary refresh
 ↓
UI updates
```

The backend must remain authoritative.

\---

# 118\. Example Workout Flow

```text
Start workout
 ↓
POST /workouts/:id/start
 ↓
Authenticate
 ↓
Authorize template
 ↓
Create session
 ↓
User enters set
 ↓
Local optimistic state
 ↓
POST set with clientMutationId
 ↓
Backend validates
 ↓
Ownership check
 ↓
Idempotency check
 ↓
MongoDB
 ↓
Confirmed
```

\---

# 119\. Example AI Flow

```text
Generate Diet
 ↓
POST /diet/generate
 ↓
Auth
 ↓
Rate limit
 ↓
Quota
 ↓
Load profile
 ↓
Calculate target
 ↓
Build prompt v1
 ↓
OpenAI
 ↓
Structured response
 ↓
Schema validation
 ↓
Business rule validation
 ↓
Save DietPlan
 ↓
Return DTO
```

\---

# 120\. Business Rule Separation

Example:

```text
AI says:
Calories = 2200
```

The backend should still validate:

```text
Is the value reasonable?
Does it match the requested range?
Are macros valid?
Are meals present?
Are required fields present?
```

AI is an assistant, not the authority over application invariants.

\---

# 121\. Source of Truth

For each area:

```text
Authentication identity
 → Firebase

Fitness data
 → MongoDB

Cache
 → Redis

Images/files
 → Object storage

AI generation
 → OpenAI

Business rules
 → Backend/domain layer
```

\---

# 122\. Important Anti-Patterns

Never build:

```text
One giant React component
One giant API route
One giant MongoDB User document
AI directly from frontend
OpenAI key in Flutter
MongoDB URI in frontend
Firebase Admin SDK in Flutter
User ID from request body as authorization
Raw MongoDB filters from clients
Unlimited AI generation
Tokens in URLs
Passwords inside WebView
Unrestricted JavaScript bridge
Duplicate business logic in Flutter
```

\---

# 123\. MVP Scope

Initial release should include:

```text
Google Sign-In
Firebase Authentication
Responsive Web
Flutter WebView
Onboarding
Fitness Profile
Dashboard
Weight Tracking
Daily Calorie Tracking
Food Logging
Exercise Library
Workout Templates
Workout Sessions
Sets / Weight / Reps
Workout History
Progress Charts
```

AI:

```text
Diet Plan Generation
Meal Replacement
Macro Targets
```

\---

# 124\. Development Order

## Phase 1 — Foundation

```text
Repository
Monorepo
TypeScript
Flutter project
MongoDB Atlas
Firebase project
Google provider
Environment configuration
CI
```

## Phase 2 — Authentication

```text
Firebase Google Sign-In
Backend token verification
User creation
Protected API
Logout
```

## Phase 3 — Profile

```text
Onboarding
Fitness profile
Goals
Units
Timezone
```

## Phase 4 — Dashboard

```text
Daily summary
Calories
Macros
Workout
Weight
Quick actions
```

## Phase 5 — Nutrition

```text
Food database
Search
Serving
Food entries
Daily totals
```

## Phase 6 — Training

```text
Exercise library
Workout templates
Workout sessions
Sets
Weight
Reps
Rest timer
History
```

## Phase 7 — Progress

```text
Weight charts
Strength charts
Calories
Workout consistency
Personal records
```

## Phase 8 — AI

```text
Diet generation
Meal replacement
Prompt versioning
Quota
Safety
Validation
```

## Phase 9 — Reliability

```text
Offline workout queue
Idempotency
Retry
Conflict handling
```

## Phase 10 — Production Hardening

```text
Security headers
Rate limiting
Monitoring
Backups
Testing
Performance
Privacy
Account deletion
Data export
```

## Phase 11 — Mobile Release

```text
Flutter WebView
Native authentication
Deep links
Back navigation
External links
Offline handling
Android
iOS
```

\---

# 125\. Definition of Done

A feature is not complete when the happy path works.

Each production feature must include:

```text
\[ ] UI
\[ ] Mobile responsive UI
\[ ] API
\[ ] Domain logic
\[ ] Validation
\[ ] Authorization
\[ ] MongoDB persistence
\[ ] Error handling
\[ ] Loading state
\[ ] Empty state
\[ ] Offline/retry behavior where relevant
\[ ] Logging
\[ ] Tests
\[ ] Accessibility
\[ ] Rate limiting where relevant
\[ ] Security review
```

\---

# 126\. Production Checklist

```text
Authentication
\[ ] Firebase Authentication
\[ ] Google provider
\[ ] Backend token verification
\[ ] Logout
\[ ] Token expiration handling

Authorization
\[ ] Ownership checks
\[ ] Role checks
\[ ] No client-supplied trusted user IDs

Database
\[ ] MongoDB Atlas
\[ ] Replica set
\[ ] Indexes
\[ ] Backups
\[ ] Restore testing
\[ ] Least-privilege DB user

Security
\[ ] HTTPS
\[ ] HSTS
\[ ] CSP
\[ ] Secure headers
\[ ] Input validation
\[ ] NoSQL injection protection
\[ ] XSS protection
\[ ] Rate limiting
\[ ] Request limits
\[ ] Secret management

AI
\[ ] Server-side OpenAI
\[ ] Schema validation
\[ ] Quotas
\[ ] Rate limiting
\[ ] Prompt versioning
\[ ] Safety handling
\[ ] Failure recovery

Mobile
\[ ] Flutter
\[ ] WebView
\[ ] Native Google authentication
\[ ] Secure session handling
\[ ] Deep links
\[ ] Back navigation
\[ ] External link handling
\[ ] Offline handling

Reliability
\[ ] Idempotency
\[ ] Retry
\[ ] Conflict handling
\[ ] Logging
\[ ] Monitoring
\[ ] Error tracking

Privacy
\[ ] Data export
\[ ] Account deletion
\[ ] Privacy policy
\[ ] Data retention policy

Testing
\[ ] Unit
\[ ] Integration
\[ ] E2E
\[ ] Security
\[ ] Flutter tests
\[ ] Mobile device testing
```

\---

# 127\. Final Architecture

```text
                         ┌──────────────────────────┐
                         │          USER            │
                         └────────────┬─────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     │                                 │
                     ▼                                 ▼
             ┌───────────────┐                 ┌───────────────┐
             │ WEB CLIENT    │                 │ FLUTTER APP   │
             │ Next.js       │                 │ Native Shell  │
             │ React         │                 │ + WebView     │
             └───────┬───────┘                 └───────┬───────┘
                     │                                 │
                     └────────────────┬────────────────┘
                                      │ HTTPS
                                      ▼
                         ┌──────────────────────────┐
                         │       BACKEND API        │
                         │                          │
                         │ Auth                     │
                         │ Authorization            │
                         │ Validation               │
                         │ Use Cases                │
                         │ Domain                   │
                         │ Rate Limiting            │
                         │ Idempotency              │
                         └────────────┬─────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
      ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
      │ MongoDB Atlas │       │ Redis         │       │ OpenAI        │
      │ Source Truth  │       │ Cache/Queue   │       │ AI            │
      └───────┬───────┘       └───────────────┘       └───────────────┘
              │
              ▼
      ┌───────────────┐
      │ Backups       │
      │ Monitoring    │
      └───────────────┘


                    AUTHENTICATION
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          Web Client           Flutter Client
              │                     │
              └──────────┬──────────┘
                         ▼
              Firebase Authentication
                         │
                         ▼
                    Google OAuth
                         │
                         ▼
                  Firebase ID Token
                         │
                         ▼
                 Backend Verification
                         │
                         ▼
                  Application User
```

\---

# 128\. Core Architectural Principle

The platform should be built around this dependency direction:

```text
                     ┌───────────────┐
                     │     Domain    │
                     │               │
                     │ Fitness rules │
                     │ Nutrition     │
                     │ Training      │
                     │ Progress      │
                     └───────▲───────┘
                             │
                     ┌───────┴───────┐
                     │  Application  │
                     │               │
                     │ Use Cases     │
                     └───────▲───────┘
                             │
             ┌───────────────┴────────────────┐
             │                                │
       ┌─────┴─────┐                    ┌─────┴─────┐
       │ Web       │                    │ Flutter   │
       │ Client    │                    │ WebView   │
       └───────────┘                    └───────────┘

Infrastructure implements the required ports:

MongoDB
Firebase
Redis
OpenAI
Object Storage
```

The key rule is:

> \*\*Web and Flutter are clients. Firebase is identity. MongoDB is application data. The backend is the security boundary. The domain is the business core.\*\*

This architecture gives the project a clean starting point while leaving room for millions of records, multiple backend instances, AI usage growth, native Flutter functionality, wearable integrations and future subscription features without rewriting the core system.

