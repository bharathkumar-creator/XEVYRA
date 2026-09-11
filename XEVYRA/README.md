# XEVYRA : High-Performance Fitness Tracking Platform

> Production-quality, mobile-first fitness tracking platform built with Clean Architecture, Next.js, Flutter WebView shell, MongoDB, Firebase Authentication, and OpenAI backend proxy.

---

## Monorepo Architecture

```text
XEVYRA/
├── apps/
│   ├── web/           # Next.js 14 Responsive Web App (Mobile-First)
│   ├── api/           # Node.js TypeScript API (Clean Architecture)
│   └── mobile/        # Flutter Native Shell + WebView POC
├── packages/
│   ├── domain/        # Pure TypeScript Domain Models & Interfaces (Zero Frameworks)
│   ├── contracts/     # Zod Schemas, API Request/Response DTOs & Error Contract
│   ├── validation/    # Common Zod Validation Utilities
│   ├── config/        # Environment Configuration Validation
│   └── shared/        # Shared Utilities (ID generation, date math)
├── database/
│   └── indexes/       # MongoDB Index Declarations
├── .env.example       # Comprehensive Environment Template
└── package.json       # Monorepo Workspace Config
```

---

## Key Non-Negotiable Rules

1. **First-Class Clients**: Web and Flutter are first-class clients sharing the same backend and database.
2. **Domain Isolation**: `packages/domain` has zero dependencies on React, Next.js, Flutter, MongoDB, Firebase, or OpenAI.
3. **Security Boundary**: The backend verifies all Firebase ID tokens; client-supplied `userId` is never trusted.
4. **Secrets**: OpenAI keys and Firebase Admin private keys never touch client applications.
5. **Standardized Error Contract**:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Please check the entered values.",
       "requestId": "req_12345"
     }
   }
   ```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
cd apps/mobile && flutter pub get
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Run Automated Tests
```bash
# Run all TypeScript package and API tests
npm test

# Run Flutter mobile shell tests
npm run test:flutter
```

### 4. Start Development Servers
```bash
# Start API Backend (Port 4000)
npm run dev:api

# Start Web App (Port 3000)
npm run dev:web

# Run Flutter Shell
cd apps/mobile && flutter run
```
