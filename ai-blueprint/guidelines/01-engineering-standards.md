# Engineering Standards & Coding Conventions

## Language & Runtime

- **Language**: TypeScript (strict mode) for both frontend and backend
- **Node version**: 20 LTS
- **Package manager**: `npm` with `package-lock.json` committed

## TypeScript Configuration

### Backend (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Frontend (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Files (React components) | PascalCase | `ProductCard.tsx` |
| Files (utilities, hooks) | camelCase | `useCart.ts`, `formatCurrency.ts` |
| Files (routes/controllers) | camelCase | `productRoutes.ts`, `authController.ts` |
| Variables & functions | camelCase | `getUserById`, `cartItems` |
| Classes & interfaces | PascalCase | `UserService`, `IProduct` |
| DB table names | snake_case plural | `order_items`, `product_images` |
| DB column names | snake_case | `created_at`, `user_id` |
| Environment variables | SCREAMING_SNAKE_CASE | `JWT_SECRET`, `DB_HOST` |
| React components | PascalCase | `CheckoutStepper` |
| Custom hooks | camelCase prefixed `use` | `useAuthContext` |
| API endpoints | kebab-case, plural nouns | `/api/products`, `/api/order-history` |
| CSS classes (Tailwind) | utility-first, no custom class names unless truly reused |

---

## Architectural Patterns

### Backend — Layered Architecture
```
Request → Router → Controller → Service → Repository → DB
```
- **Router**: Express router, no business logic — only maps routes to controllers
- **Controller**: Validates request shape, calls service, formats HTTP response
- **Service**: All business logic lives here; services can call other services
- **Repository**: All SQL queries; returns plain objects, never sends HTTP responses
- No direct DB calls in controllers or routes

### Frontend — Feature-Sliced Design (simplified)
```
src/
  features/       ← self-contained feature modules
  shared/         ← reusable components, hooks, utils
  pages/          ← route-level components, thin wrappers
  app/            ← providers, router, global state
```

---

## Code Style Rules

- **No `any` type** — use `unknown` and narrow, or define a proper interface
- **No `var`** — use `const` by default, `let` when reassignment is required
- **No magic numbers/strings** — extract to named constants
- **Async/await** over raw Promises; no `.then()` chains unless chaining is architecturally cleaner
- **Early returns** over nested `if` blocks
- **Pure functions** where possible — side effects isolated to services and repositories
- **Max function length**: 40 lines. If longer, split into helpers.
- **Max file length**: 250 lines. If longer, split into modules.
- Single responsibility: one exported class or a cohesive set of related pure functions per file

---

## API Response Shape

All API endpoints must return a consistent envelope:

```typescript
// Success
{
  "success": true,
  "data": <payload>,
  "meta"?: { "page": 1, "total": 100 }   // for paginated lists
}

// Error
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",    // machine-readable
    "message": "Product not found"  // human-readable
  }
}
```

Define a shared type:
```typescript
// shared/types/api.ts
export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
} | {
  success: false;
  error: { code: string; message: string };
};
```

---

## HTTP Status Code Rules

| Situation | Status |
|---|---|
| Successful read | 200 |
| Resource created | 201 |
| No content (delete) | 204 |
| Validation failure | 400 |
| Not authenticated | 401 |
| Authenticated but forbidden | 403 |
| Resource not found | 404 |
| Conflict (e.g. email exists) | 409 |
| Server error | 500 |

---

## Logging

- Use `pino` for structured JSON logging in backend
- Log levels: `error`, `warn`, `info`, `debug`
- Never log passwords, tokens, or PII
- Every HTTP request logged at `info` level: method, path, status, duration
- Every unhandled exception logged at `error` level with stack trace

---

## Environment Variables

- All secrets and config come from environment variables — no hardcoded values
- Provide a `.env.example` with every variable name and a safe placeholder value
- Use a `config.ts` module that reads `process.env` once and exports typed values — never read `process.env` directly in business logic

```typescript
// backend/src/config.ts
export const config = {
  port: Number(process.env.PORT ?? 3001),
  db: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
};
```

---

## Testing Conventions (if adding tests)

- Unit tests co-located: `UserService.test.ts` next to `UserService.ts`
- Integration tests in `tests/integration/`
- Use `vitest` for both frontend and backend
- Test names follow: `describe('ServiceName') > it('should <behavior> when <condition>')`
