# Folder Structure

This document defines the exact folder and file layout for the entire monorepo. The AI agent must follow this structure precisely. Do not introduce new top-level directories without a documented reason.

---

## Repository Root

```
ecommerce-platform/
├── .env.example                  ← all required env vars with safe placeholders
├── docker-compose.yml            ← single command to run everything
├── README.md                     ← manual interventions log
├── ai-blueprint/                 ← AI guideline files (this directory)
├── frontend/                     ← React + Vite application
└── backend/                      ← Node.js + Express API
```

---

## Backend Structure

```
backend/
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                  ← entry point: creates app, starts server
│   ├── app.ts                    ← Express app factory (middlewares, routes)
│   ├── config.ts                 ← typed env var config (see engineering standards)
│   ├── db/
│   │   ├── connection.ts         ← mysql2 pool setup, export `pool`
│   │   ├── migrations/           ← numbered SQL files: 001_init.sql, 002_seed.sql
│   │   └── migrate.ts            ← script that runs all migration files in order
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.types.ts
│   │   ├── products/
│   │   │   ├── product.router.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.repository.ts
│   │   │   └── product.types.ts
│   │   ├── cart/
│   │   │   ├── cart.router.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.repository.ts
│   │   │   └── cart.types.ts
│   │   ├── orders/
│   │   │   ├── order.router.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.repository.ts
│   │   │   └── order.types.ts
│   │   └── users/
│   │       ├── user.router.ts
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.repository.ts
│   │       └── user.types.ts
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts   ← JWT validation middleware
│   │   │   ├── errorHandler.ts   ← global Express error handler
│   │   │   ├── validate.ts       ← Zod-based request validation middleware
│   │   │   └── requestLogger.ts  ← pino request logging
│   │   ├── errors/
│   │   │   └── AppError.ts       ← custom error class with code + statusCode
│   │   └── types/
│   │       └── api.ts            ← ApiResponse<T> type and helpers
│   └── constants/
│       └── errorCodes.ts         ← all ERROR_CODE string constants
├── tests/
│   └── integration/
└── .env.example
```

---

## Frontend Structure

```
frontend/
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
└── src/
    ├── main.tsx                  ← React entry point
    ├── App.tsx                   ← Router setup
    ├── app/
    │   ├── store.ts              ← Zustand store root (or Redux if preferred)
    │   └── queryClient.ts        ← React Query client config
    ├── features/
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── SignupForm.tsx
    │   │   ├── hooks/
    │   │   │   └── useAuth.ts
    │   │   ├── api/
    │   │   │   └── authApi.ts    ← axios calls for auth endpoints
    │   │   ├── store/
    │   │   │   └── authStore.ts  ← Zustand slice for auth state
    │   │   └── pages/
    │   │       ├── LoginPage.tsx
    │   │       └── SignupPage.tsx
    │   ├── products/
    │   │   ├── components/
    │   │   │   ├── ProductCard.tsx
    │   │   │   ├── ProductGrid.tsx
    │   │   │   ├── ProductFilters.tsx
    │   │   │   └── SearchBar.tsx
    │   │   ├── hooks/
    │   │   │   └── useProducts.ts
    │   │   ├── api/
    │   │   │   └── productsApi.ts
    │   │   └── pages/
    │   │       ├── CatalogPage.tsx
    │   │       └── ProductDetailPage.tsx
    │   ├── cart/
    │   │   ├── components/
    │   │   │   ├── CartDrawer.tsx
    │   │   │   ├── CartItem.tsx
    │   │   │   └── CartSummary.tsx
    │   │   ├── hooks/
    │   │   │   └── useCart.ts
    │   │   ├── api/
    │   │   │   └── cartApi.ts
    │   │   ├── store/
    │   │   │   └── cartStore.ts
    │   │   └── pages/
    │   │       └── CartPage.tsx
    │   ├── checkout/
    │   │   ├── components/
    │   │   │   ├── CheckoutStepper.tsx
    │   │   │   ├── ShippingStep.tsx
    │   │   │   ├── PaymentStep.tsx   ← mock payment form, no real processing
    │   │   │   └── ConfirmationStep.tsx
    │   │   └── pages/
    │   │       └── CheckoutPage.tsx
    │   └── account/
    │       ├── components/
    │       │   ├── OrderHistoryList.tsx
    │       │   ├── OrderDetailCard.tsx
    │       │   └── ProfileForm.tsx
    │       ├── hooks/
    │       │   └── useAccount.ts
    │       ├── api/
    │       │   └── accountApi.ts
    │       └── pages/
    │           └── AccountPage.tsx
    ├── shared/
    │   ├── components/
    │   │   ├── ui/               ← base design system components
    │   │   │   ├── Button.tsx
    │   │   │   ├── Input.tsx
    │   │   │   ├── Modal.tsx
    │   │   │   ├── Spinner.tsx
    │   │   │   ├── Badge.tsx
    │   │   │   ├── Toast.tsx
    │   │   │   └── Card.tsx
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   └── PageLayout.tsx
    │   │   └── guards/
    │   │       └── ProtectedRoute.tsx
    │   ├── hooks/
    │   │   ├── useDebounce.ts
    │   │   └── useLocalStorage.ts
    │   ├── utils/
    │   │   ├── formatCurrency.ts
    │   │   ├── formatDate.ts
    │   │   └── cn.ts             ← clsx + tailwind-merge helper
    │   ├── api/
    │   │   └── axiosInstance.ts  ← base axios with interceptors
    │   └── types/
    │       └── index.ts          ← shared domain types (Product, User, Order, etc.)
    ├── constants/
    │   └── routes.ts             ← all route path constants
    └── assets/
        └── images/
```

---

## Docker Structure

```
ecommerce-platform/
├── docker-compose.yml
├── frontend/
│   └── Dockerfile              ← multi-stage: build then nginx serve
├── backend/
│   └── Dockerfile              ← multi-stage: build then run dist/
└── .env.example
```

---

## Key Conventions

- Each `features/<name>/` folder is a **self-contained vertical slice**: components, hooks, api calls, and pages all live together
- `shared/` contains **only** things used by 2+ features
- No cross-feature imports allowed (feature A must not import from feature B directly) — communicate through shared types or global state only
- Every `pages/` component is a **thin wrapper** — it composes feature components and handles routing concerns only, no business logic
- API call files (`api/*.ts`) only contain axios calls and return typed promises — no state mutations
- State mutations happen only in Zustand stores or React Query cache updates
