# initial.md — AI Agent Bootstrap Prompt

You are a senior full-stack engineer. Your task is to build a complete,
production-grade eCommerce platform from scratch using the blueprint files
in this repository.

**Do not read all files upfront.** Load each file only when the phase that
needs it begins. This keeps your context window available for the actual code.

---

## Always-Loaded Files (read once, keep in mind throughout)

Read these two files right now, before anything else. They apply to every
line of code you will write:

- `ai-blueprint/guidelines/01-engineering-standards.md`
  TypeScript config, naming conventions, API response shape, code style rules.

- `ai-blueprint/guidelines/02-folder-structure.md`
  Exact file and directory layout. Every file you create must land in the
  correct place according to this map.

Once read, do not re-read them — refer back mentally. Only re-read if you
catch yourself deviating from a convention.

---

## Build Phases

Work through phases in order. Do not start a phase until the previous one
passes its checkpoint. At the start of each phase, read only the files
listed for that phase — nothing else.

---

### Phase 1 — Project Scaffolding

**Read now:** `ai-blueprint/capabilities/06-docker-setup.md`

**Goal:** Bare-bones repo structure with a working Docker stack.

Tasks:
- Create the directory structure from `02-folder-structure.md` (already loaded)
- Create `docker-compose.yml`, `.env.example`, backend and frontend `Dockerfile`s,
  and `nginx.conf` — all from `06-docker-setup.md`
- Initialize `backend/` with `package.json`, `tsconfig.json`, `src/index.ts`,
  `src/app.ts`, `src/config.ts`
- Initialize `frontend/` with Vite + React + TypeScript, `tailwind.config.ts`,
  `vite.config.ts`
- Create `src/db/connection.ts`, `src/db/migrate.ts`

**Checkpoint:** `docker compose up` starts all three containers without errors.
Backend returns `{ "status": "ok" }` at `GET /api/health`.

---

### Phase 2 — Database Schema & Migrations

**Read now:** `ai-blueprint/capabilities/05-database-schema.md`

**Goal:** MySQL schema and seed data applied automatically on container start.

Tasks:
- Create `001_create_tables.sql` and `002_seed_data.sql` using the exact DDL
  from `05-database-schema.md`
- Verify the migration runner in `migrate.ts` handles idempotency and the
  DB retry loop

**Checkpoint:** After `docker compose up`, the `ecommerce_db` database contains
all tables and 22+ seed products. Confirmed via:
```
docker exec -it <db_container> mysql -u app_user -p ecommerce_db -e "SELECT COUNT(*) FROM products;"
```

---

### Phase 3 — Backend Shared Infrastructure

**Read now:** `ai-blueprint/guidelines/03-error-handling.md`
             `ai-blueprint/guidelines/04-security.md`

**Goal:** All cross-cutting backend concerns in place before feature work.

Tasks (implement exactly as specified in the files you just read):
- `src/shared/errors/AppError.ts`
- `src/constants/errorCodes.ts`
- `src/shared/types/api.ts` — `ApiResponse<T>` type
- `src/shared/middleware/asyncHandler.ts`
- `src/shared/middleware/validate.ts` — Zod middleware
- `src/shared/middleware/authenticate.ts` — JWT middleware
- `src/shared/middleware/errorHandler.ts` — global error handler
- `src/shared/middleware/requestLogger.ts` — pino-http
- Register `errorHandler` last in `app.ts`

You may now unload `03-error-handling.md` and `04-security.md` from active
attention — the patterns are in the code.

**Checkpoint:** A POST with a malformed body returns:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

---

### Phase 4 — Frontend Shared Infrastructure

**Read now:** `ai-blueprint/guidelines/05-ui-design-system.md`

**Goal:** Design system, routing skeleton, global state, API client.

Tasks:
- Apply the full Tailwind color palette and font config from `05-ui-design-system.md`
- `src/shared/utils/cn.ts`, `formatCurrency.ts`, `formatDate.ts`
- `src/shared/api/axiosInstance.ts` — with auth + error interceptors
  (pattern is in `03-error-handling.md` which you already built from — no need to re-read)
- `src/app/queryClient.ts`
- `src/constants/routes.ts`
- `src/shared/types/index.ts` — all domain types
- Base UI components: `Button`, `Input`, `Spinner`, `Badge`, `Card`, `Modal`, `Toast`
  — implement to the specs in `05-ui-design-system.md`
- Layout: `Navbar`, `Footer`, `PageLayout`
- `ProtectedRoute.tsx`
- `App.tsx` with React Router, AnimatePresence, QueryClientProvider

You may now unload `05-ui-design-system.md` — the design tokens are in
`tailwind.config.ts` and the component patterns are in the code.

**Checkpoint:** App renders in browser. Navbar visible. `/login` renders
without errors.

---

### Phase 5 — Authentication

**Read now:** `ai-blueprint/capabilities/01-auth-module.md`

**Goal:** Full login/signup flow, end-to-end.

Tasks (backend then frontend, per `01-auth-module.md`):
- `auth.types.ts`, `auth.repository.ts`, `auth.service.ts`,
  `auth.controller.ts`, `auth.router.ts`
- Mount at `/api/auth` in `app.ts`
- `authStore.ts` (Zustand + localStorage persistence)
- `authApi.ts`, `useAuth.ts`
- `LoginPage.tsx`, `SignupPage.tsx`, `LoginForm.tsx`, `SignupForm.tsx`
- Auth init check in `App.tsx`
- Navbar auth state wiring

Unload `01-auth-module.md` after implementation.

**Checkpoint:** Sign up → log in → Navbar shows user → log out → redirect to
`/login`. Token survives page refresh.

---

### Phase 6 — Product Catalog

**Read now:** `ai-blueprint/capabilities/02-product-catalog.md`

**Goal:** Product listing with search/filter and product detail page.

Tasks (per `02-product-catalog.md`):
- `product.types.ts`, `product.repository.ts` (dynamic filter query),
  `product.service.ts`, `product.controller.ts`, `product.router.ts`
- Categories router: `GET /api/categories`
- `productsApi.ts`, `useProducts.ts` (URL-driven filter state)
- `SearchBar.tsx`, `ProductFilters.tsx`, `ProductCard.tsx`, `ProductGrid.tsx`
- `CatalogPage.tsx`, `ProductDetailPage.tsx`

Unload `02-product-catalog.md` after implementation.

**Checkpoint:** Products page loads grid. Search and category filter work.
Product detail page renders with image gallery and "Add to Cart" button.

---

### Phase 7 — Cart & Checkout

**Read now:** `ai-blueprint/capabilities/03-cart-checkout.md`

**Goal:** Persistent cart, cart drawer, and full 3-step checkout.

Tasks (per `03-cart-checkout.md`):
- Cart backend: `cart.types.ts` → `cart.repository.ts` → `cart.service.ts`
  → `cart.controller.ts` → `cart.router.ts`
- Orders backend: `order.types.ts` → `order.repository.ts` →
  `order.service.ts` → `order.controller.ts` → `order.router.ts`
- Mount both in `app.ts`
- `cartStore.ts` (local cart for unauthenticated users)
- `cartApi.ts`, `useCart.ts` (unified hook)
- `CartItem.tsx`, `CartDrawer.tsx`, `CartSummary.tsx`, `CartPage.tsx`
- Wire "Add to Cart" on `ProductCard` and `ProductDetailPage`
- Navbar cart icon with item count badge
- `CheckoutStepper.tsx`, `ShippingStep.tsx`, `PaymentStep.tsx`,
  `ConfirmationStep.tsx`, `CheckoutPage.tsx`
- On login: call `POST /api/cart/sync`, then clear local cart

Unload `03-cart-checkout.md` after implementation.

**Checkpoint:** Add product → open cart drawer → proceed to checkout →
complete all 3 steps → see confirmation screen with order number.

---

### Phase 8 — Account Section

**Read now:** `ai-blueprint/capabilities/04-account-section.md`

**Goal:** Order history and profile management.

Tasks (per `04-account-section.md`):
- `user.types.ts`, `user.repository.ts`, `user.service.ts`,
  `user.controller.ts`, `user.router.ts`
- Extend `order.repository.ts` + `order.router.ts` with GET endpoints
- `accountApi.ts`, `useAccount.ts`
- `OrderHistoryList.tsx`, `OrderDetailCard.tsx`, `ProfileForm.tsx`
- `AccountPage.tsx` — 3-tab layout

Unload `04-account-section.md` after implementation.

**Checkpoint:** Account page shows order history. Profile update works.
Password change works.

---

### Phase 9 — Polish & Final Verification

**No new files to read.** Everything needed is already in the codebase.

Tasks:
- Empty states for all list views (no products, empty cart, no orders)
- Skeleton loading screens on `ProductGrid` and `OrderHistoryList`
- Framer Motion page transitions on all route changes
- `ProtectedRoute` on `/checkout` and `/account`
- Mobile layout check: Navbar collapses, filters move to bottom sheet,
  grid uses 1–2 columns on small screens
- Full end-to-end journey: sign up → browse → filter → add to cart →
  checkout → view order in account
- Clean `docker compose up` from scratch — no errors

**Final Checkpoint:**
- [ ] `docker compose up` works from a fresh clone
- [ ] All 4 features work end-to-end
- [ ] Dark premium UI with animations
- [ ] All errors return `{ success: false, error: { code, message } }`
- [ ] No hardcoded secrets or URLs

---

## On-Demand Reference

If you're unsure about something mid-build, here's where to look — but only
re-read the specific section you need, not the whole file:

| Question | File | Section |
|---|---|---|
| How do I name this file/variable? | `01-engineering-standards.md` | Naming Conventions |
| Where does this file go? | `02-folder-structure.md` | relevant feature folder |
| How do I handle this error? | `03-error-handling.md` | relevant layer (service/repo/controller) |
| What HTTP status for this case? | `01-engineering-standards.md` | HTTP Status Code Rules |
| How do I style this component? | `05-ui-design-system.md` | relevant component section |
| What does this API endpoint return? | relevant capability file | API Endpoints section |
| How is this DB table structured? | `05-database-schema.md` | schema DDL |

---

## Non-Negotiable Rules

These 10 rules override any other decision. Violating one is a build failure:

1. All SQL uses parameterized queries — no string interpolation with user data
2. All controllers use `asyncHandler` — no `try/catch` in controllers
3. All request bodies validated with Zod before the controller runs
4. Passwords never returned in any API response — strip `password_hash` in repo layer
5. No direct DB calls outside repositories — controllers/services never import `pool`
6. No cross-feature imports — feature A never imports from feature B
7. `cn()` for all conditional Tailwind classes — never template literals
8. Migrations are idempotent — `CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`
9. Frontend API URL from `VITE_API_URL` env var — never hardcoded
10. `docker compose up` must work at the end of every phase