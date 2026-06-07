# initial.md — AI Agent Bootstrap Prompt

You are a senior full-stack engineer. Your task is to build a complete, production-grade eCommerce platform from scratch. Every decision you make must be grounded in the blueprint files in this repository. Do not improvise architecture, naming conventions, or patterns — follow the specs exactly.

---

## Your Reference Documents

Before writing a single line of code, read all of these files in order:

### Guidelines (engineering rules — must be followed everywhere)
1. `ai-blueprint/guidelines/01-engineering-standards.md` — TypeScript config, naming conventions, layered architecture, API response shape, logging
2. `ai-blueprint/guidelines/02-folder-structure.md` — exact file and directory layout for the entire repo
3. `ai-blueprint/guidelines/03-error-handling.md` — AppError, asyncHandler, Zod validation, global error handler, frontend axios interceptor
4. `ai-blueprint/guidelines/04-security.md` — JWT, bcrypt, CORS, Helmet, rate limiting, SQL injection prevention
5. `ai-blueprint/guidelines/05-ui-design-system.md` — color palette, typography, component specs, Framer Motion patterns, Tailwind config

### Capabilities (feature specifications — implement every item marked ✅)
6. `ai-blueprint/capabilities/01-auth-module.md` — signup, login, JWT auth, ProtectedRoute, auth store
7. `ai-blueprint/capabilities/02-product-catalog.md` — product listing, search, filters, product detail page
8. `ai-blueprint/capabilities/03-cart-checkout.md` — persistent cart, cart drawer, 3-step checkout, order placement
9. `ai-blueprint/capabilities/04-account-section.md` — order history, profile, password change
10. `ai-blueprint/capabilities/05-database-schema.md` — full MySQL DDL, seed data, migration runner, DB connection pool
11. `ai-blueprint/capabilities/06-docker-setup.md` — docker-compose, Dockerfiles, Nginx, .env.example

---

## Build Order

Follow this exact sequence. Complete each phase before starting the next. Do not skip ahead.

---

### Phase 1 — Project Scaffolding

**Goal:** Bare-bones repo structure with working Docker stack and an empty "Hello World" app.

1. Create the root directory structure exactly as defined in `02-folder-structure.md`
2. Create `docker-compose.yml` from `06-docker-setup.md`
3. Create `.env.example` from `06-docker-setup.md`
4. Initialize `backend/`:
   - `npm init -y`, install all backend dependencies (see dependency list below)
   - `tsconfig.json` from `01-engineering-standards.md`
   - `src/index.ts` → creates Express app, listens on port from config
   - `src/app.ts` → Express factory with middleware (helmet, cors, json parser, request logger)
   - `src/config.ts` → typed env config
   - `Dockerfile` from `06-docker-setup.md`
5. Initialize `frontend/`:
   - `npm create vite@latest . -- --template react-ts`
   - Install all frontend dependencies (see list below)
   - `tailwind.config.ts` with the full color palette from `05-ui-design-system.md`
   - `vite.config.ts` from `06-docker-setup.md`
   - `nginx.conf` from `06-docker-setup.md`
   - `Dockerfile` from `06-docker-setup.md`
6. Create `backend/src/db/connection.ts` from `05-database-schema.md`
7. Create `backend/src/db/migrations/001_create_tables.sql` from `05-database-schema.md`
8. Create `backend/src/db/migrations/002_seed_data.sql` from `05-database-schema.md`
9. Create `backend/src/db/migrate.ts` from `05-database-schema.md`

**Checkpoint:** `docker compose up` must start all three containers (db, backend, frontend) without errors. Backend returns `{ "status": "ok" }` at `GET /api/health`.

---

### Phase 2 — Backend Shared Infrastructure

**Goal:** All cross-cutting concerns implemented before any feature work begins.

1. `src/shared/errors/AppError.ts` — from `03-error-handling.md`
2. `src/constants/errorCodes.ts` — from `03-error-handling.md`
3. `src/shared/types/api.ts` — `ApiResponse<T>` type
4. `src/shared/middleware/asyncHandler.ts` — from `03-error-handling.md`
5. `src/shared/middleware/validate.ts` — Zod validation middleware from `03-error-handling.md`
6. `src/shared/middleware/authenticate.ts` — JWT middleware from `04-security.md`
7. `src/shared/middleware/errorHandler.ts` — global error handler from `03-error-handling.md`
8. `src/shared/middleware/requestLogger.ts` — pino-http middleware
9. Register `errorHandler` as the last middleware in `app.ts`

**Checkpoint:** POST to any route with a malformed body returns `{ success: false, error: { code: 'VALIDATION_ERROR', message: '...' } }` with status 400.

---

### Phase 3 — Frontend Shared Infrastructure

**Goal:** Design system, routing skeleton, global state, and API client in place.

1. `src/shared/utils/cn.ts` — clsx + tailwind-merge from `05-ui-design-system.md`
2. `src/shared/utils/formatCurrency.ts` — `(n: number) => '$' + n.toFixed(2)`
3. `src/shared/utils/formatDate.ts` — format ISO date to "Mar 10, 2024"
4. `src/shared/api/axiosInstance.ts` — axios instance with request/response interceptors from `03-error-handling.md`
5. `src/app/queryClient.ts` — React Query client (staleTime: 60s, retry: 1)
6. `src/constants/routes.ts` — all route path constants:
   ```typescript
   export const ROUTES = {
     HOME: '/',
     LOGIN: '/login',
     SIGNUP: '/signup',
     CATALOG: '/products',
     PRODUCT_DETAIL: '/products/:slug',
     CART: '/cart',
     CHECKOUT: '/checkout',
     ACCOUNT: '/account',
   } as const;
   ```
7. `src/shared/types/index.ts` — all domain types: `User`, `Product`, `Category`, `CartItem`, `Cart`, `Order`, `OrderSummary`, `OrderDetail`, `ApiResponse<T>`, `PaginationMeta`
8. Base UI components (`src/shared/components/ui/`): `Button`, `Input`, `Spinner`, `Badge`, `Card`, `Modal`, `Toast` — implement from `05-ui-design-system.md` specs
9. Layout components: `Navbar`, `Footer`, `PageLayout`
10. `src/shared/components/guards/ProtectedRoute.tsx`
11. `src/App.tsx` — React Router setup with all routes, AnimatePresence wrapper, QueryClientProvider, auth initialization check
12. `src/main.tsx` — renders App

**Checkpoint:** App renders in browser. Navbar visible. Navigating to `/login` renders the login page shell (no form yet).

---

### Phase 4 — Authentication

**Goal:** Full login/signup flow working end-to-end.

**Backend:**
1. `features/auth/auth.types.ts` — Zod schemas (LoginSchema, SignupSchema), TypeScript types
2. `features/auth/auth.repository.ts` — `findByEmail`, `createUser`
3. `features/auth/auth.service.ts` — `signup`, `login`, `getMe`
4. `features/auth/auth.controller.ts` — `signup`, `login`, `me`
5. `features/auth/auth.router.ts` — register routes with rate limiter + validators
6. Mount in `app.ts`: `app.use('/api/auth', authRouter)`

**Frontend:**
1. `features/auth/store/authStore.ts` — Zustand store with localStorage persistence
2. `features/auth/api/authApi.ts`
3. `features/auth/hooks/useAuth.ts`
4. `features/auth/pages/LoginPage.tsx` — split layout per `01-auth-module.md`
5. `features/auth/pages/SignupPage.tsx`
6. `features/auth/components/LoginForm.tsx`
7. `features/auth/components/SignupForm.tsx`
8. Auth initialization in `App.tsx` (verify token on load)
9. Connect Navbar: show user dropdown when authenticated, Login/Signup links when not

**Checkpoint:** Can sign up with a new email, log in, see authenticated state in Navbar, and log out. Token survives page refresh. Navigating to `/account` while unauthenticated redirects to `/login`.

---

### Phase 5 — Product Catalog

**Goal:** Product listing page with search/filter and product detail page.

**Backend:**
1. `features/products/product.types.ts`
2. `features/products/product.repository.ts` — `findAll` (with dynamic filter query), `findBySlug`, `findRelated`
3. `features/products/product.service.ts`
4. `features/products/product.controller.ts`
5. `features/products/product.router.ts`
6. Categories router: `GET /api/categories`
7. Mount in `app.ts`

**Frontend:**
1. `features/products/api/productsApi.ts`
2. `features/products/hooks/useProducts.ts` — URL-driven filter state per `02-product-catalog.md`
3. `features/products/components/SearchBar.tsx` — debounced input
4. `features/products/components/ProductFilters.tsx` — category checkboxes, price range, sort
5. `features/products/components/ProductCard.tsx` — with hover animation per `05-ui-design-system.md`
6. `features/products/components/ProductGrid.tsx` — staggered animation, skeleton loading
7. `features/products/pages/CatalogPage.tsx` — two-column layout (filters + grid)
8. `features/products/pages/ProductDetailPage.tsx` — image gallery, details, related products

**Checkpoint:** Products page loads with product grid. Search filters by name. Category filter works. Clicking a product navigates to its detail page. "Add to Cart" button visible on detail page (cart logic not wired yet).

---

### Phase 6 — Cart & Checkout

**Goal:** Full cart flow from add-to-cart through order placement.

**Backend:**
1. `features/cart/cart.types.ts`
2. `features/cart/cart.repository.ts`
3. `features/cart/cart.service.ts` — `getOrCreateCart`, `addItem`, `updateItem`, `removeItem`, `syncCart`, `calculateTotals`
4. `features/cart/cart.controller.ts`
5. `features/cart/cart.router.ts` — all routes protected
6. `features/orders/order.types.ts`
7. `features/orders/order.repository.ts`
8. `features/orders/order.service.ts` — `placeOrder` (validate stock → create order → clear cart)
9. `features/orders/order.controller.ts`
10. `features/orders/order.router.ts`
11. Mount both in `app.ts`

**Frontend:**
1. `features/cart/store/cartStore.ts` — local cart for unauthenticated users
2. `features/cart/api/cartApi.ts`
3. `features/cart/hooks/useCart.ts` — unified hook (server cart vs local cart)
4. `features/cart/components/CartItem.tsx`
5. `features/cart/components/CartDrawer.tsx` — slide-in drawer per `05-ui-design-system.md`
6. `features/cart/components/CartSummary.tsx`
7. `features/cart/pages/CartPage.tsx`
8. Wire "Add to Cart" on ProductDetailPage and ProductCard
9. Update Navbar cart icon with item count badge
10. `features/checkout/components/CheckoutStepper.tsx`
11. `features/checkout/components/ShippingStep.tsx`
12. `features/checkout/components/PaymentStep.tsx`
13. `features/checkout/components/ConfirmationStep.tsx`
14. `features/checkout/pages/CheckoutPage.tsx`
15. On login, call `POST /api/cart/sync` with any local cart items, then clear local cart

**Checkpoint:** Can add products to cart. Cart drawer shows items. Cart persists on page refresh (for authenticated users). Checkout flow works through all 3 steps. Order confirmation screen shows after "Place Order".

---

### Phase 7 — Account Section

**Goal:** Order history and profile management.

**Backend:**
1. `features/users/user.types.ts`
2. `features/users/user.repository.ts` — `findById`, `findByIdWithHash`, `update`, `updatePassword`
3. `features/users/user.service.ts`
4. `features/users/user.controller.ts`
5. `features/users/user.router.ts`
6. Extend `order.repository.ts` with `findByUserId`, `findByIdWithItems`
7. Extend `order.controller.ts` and `order.router.ts` with GET endpoints
8. Mount user router in `app.ts`

**Frontend:**
1. `features/account/api/accountApi.ts`
2. `features/account/hooks/useAccount.ts`
3. `features/account/components/OrderHistoryList.tsx`
4. `features/account/components/OrderDetailCard.tsx`
5. `features/account/components/ProfileForm.tsx`
6. `features/account/pages/AccountPage.tsx` — 3-tab layout per `04-account-section.md`

**Checkpoint:** Account page shows order history for logged-in user. Can update name/email. Can change password. Order detail view shows items, address, and totals.

---

### Phase 8 — Polish & Integration

**Goal:** Final wiring, error states, and visual completeness.

1. Add empty states to all list views (no products, empty cart, no orders)
2. Add loading skeleton screens to ProductGrid and OrderHistoryList
3. Add Framer Motion page transitions to all route changes (see `05-ui-design-system.md`)
4. Ensure all error states show user-friendly toast notifications
5. Add `ProtectedRoute` wrapper to `/checkout` and `/account` routes
6. Verify the complete user journey end-to-end:
   - Sign up → browse catalog → search + filter → add to cart → checkout → view order in account
7. Responsive check: verify mobile layout on all pages (Navbar collapses, filters move to bottom sheet, product grid uses 1–2 columns)
8. Final `docker compose up` verification — clean build from scratch, no errors

---

## Full Dependency List

### Backend

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.4",
    "pino": "^8.17.2",
    "pino-http": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.11.0"
  }
}
```

### Frontend

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.3",
    "axios": "^1.6.5",
    "@tanstack/react-query": "^5.17.19",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "framer-motion": "^11.0.3",
    "lucide-react": "^0.309.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18"
  }
}
```

---

## Non-Negotiable Rules

These override any conflicting decision you might make:

1. **All SQL uses parameterized queries** — no string interpolation with user data (see `04-security.md`)
2. **All controllers use `asyncHandler`** — no `try/catch` in controllers (see `03-error-handling.md`)
3. **All request bodies validated with Zod** before the controller runs (see `03-error-handling.md`)
4. **Passwords never returned** in any API response — strip `password_hash` in repository layer
5. **No direct DB calls outside repositories** — controllers and services never import `pool`
6. **Feature isolation** — no cross-feature imports (feature A never imports from feature B)
7. **`cn()` for all conditional Tailwind classes** — never template literals for className
8. **Migrations are idempotent** — `CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE` (see `06-docker-setup.md`)
9. **Frontend API URL** comes from `VITE_API_URL` env var — never hardcoded
10. **The app must start with `docker compose up`** — test this at the end of every phase

---

## When You're Unsure

- Check the relevant capability or guideline file first
- Follow existing patterns in the codebase rather than introducing new ones
- When in doubt between two valid approaches, pick the simpler one
- If a spec is ambiguous, make a reasonable decision and document it as a comment

---

## Done

The project is complete when:
- [ ] `docker compose up` starts cleanly from a fresh clone
- [ ] All 4 eCommerce features work end-to-end (auth, catalog, cart/checkout, account)
- [ ] The UI matches the design system (dark theme, premium feel, animations)
- [ ] All API errors return the standard `{ success: false, error: { code, message } }` shape
- [ ] No hardcoded secrets or URLs
