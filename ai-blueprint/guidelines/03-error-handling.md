# Error Handling Strategy

A consistent, predictable error handling model across the entire stack. The AI agent must use this pattern everywhere — no ad-hoc `try/catch` with `console.error` and a 500 response.

---

## Backend Error Model

### AppError — Custom Error Class

All known, intentional errors must be thrown as `AppError` instances. This separates operational errors (expected, user-facing) from programmer errors (bugs, unexpected crashes).

```typescript
// src/shared/errors/AppError.ts

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Error Codes Constants

```typescript
// src/constants/errorCodes.ts

export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Products
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',

  // Cart
  CART_ITEM_NOT_FOUND: 'CART_ITEM_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',

  // Orders
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',

  // Users
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Generic
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;
```

### Throwing Errors in Services

```typescript
// Example in product.service.ts
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/constants/errorCodes';

async getProductById(id: number) {
  const product = await this.productRepo.findById(id);
  if (!product) {
    throw new AppError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND, 404);
  }
  return product;
}
```

---

## Global Error Handler Middleware

This must be registered **last** in `app.ts`, after all routes.

```typescript
// src/shared/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    // Known operational error — return structured response
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Unknown / programmer error — log it, return generic response
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

### Registration in app.ts

```typescript
// After all routes:
app.use(errorHandler);
```

---

## Controller Pattern — Async Wrapper

To avoid `try/catch` boilerplate in every controller, use an `asyncHandler` wrapper:

```typescript
// src/shared/middleware/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (fn: AsyncController) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

**Usage in controllers:**

```typescript
// auth.controller.ts
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
});
```

No `try/catch` in any controller — all errors propagate to `errorHandler` automatically.

---

## Request Validation — Zod Middleware

All incoming request bodies must be validated with Zod schemas before the controller runs.

```typescript
// src/shared/middleware/validate.ts
import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        result.error.issues.map(i => i.message).join(', '),
        ErrorCodes.VALIDATION_ERROR,
        400
      );
    }
    req.body = result.data; // replace with parsed + coerced data
    next();
  };
```

**Defining schemas (co-locate with feature types):**

```typescript
// auth.types.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  ),
});
```

**Usage in router:**

```typescript
router.post('/login', validate(LoginSchema), asyncHandler(authController.login));
```

---

## Database Error Handling

MySQL errors from `mysql2` must be caught in the repository layer and re-thrown as `AppError` where appropriate. Do not let raw `ER_DUP_ENTRY` or similar codes surface to the client.

```typescript
// Example in auth.repository.ts
async createUser(data: CreateUserDto) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [data.name, data.email, data.passwordHash]
    );
    return result;
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Email already exists', ErrorCodes.EMAIL_ALREADY_EXISTS, 409);
    }
    throw err; // re-throw unknown DB errors → caught by global handler
  }
}
```

---

## Frontend Error Handling

### Axios Interceptor — Global API Error Handling

```typescript
// src/shared/api/axiosInstance.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    // Re-throw with a structured shape for React Query / UI consumption
    return Promise.reject({
      code: error.response?.data?.error?.code ?? 'NETWORK_ERROR',
      message: error.response?.data?.error?.message ?? 'Network error',
      status: error.response?.status ?? 0,
    });
  }
);
```

### React Query Error Boundaries

- Use `react-error-boundary` for route-level crashes
- React Query `onError` callbacks show toasts for non-critical failures
- Critical failures (auth, order placement) show full error states in UI

### Toast Notifications

Use a `useToast` hook backed by a Zustand slice to display non-blocking user feedback:

```typescript
// Pattern:
mutate(data, {
  onSuccess: () => toast.success('Order placed successfully!'),
  onError: (err) => toast.error(err.message),
});
```

---

## Rules Summary

| Layer | Rule |
|---|---|
| Services | Throw `AppError` for all known error states |
| Repositories | Catch DB errors, re-throw as `AppError` when identifiable |
| Controllers | Use `asyncHandler` — no `try/catch` |
| Routes | Validate all bodies with `validate(Schema)` middleware |
| `app.ts` | Register `errorHandler` as last middleware |
| Frontend API | Axios interceptor normalizes all errors |
| Frontend UI | React Query + toast for async errors; error boundaries for crashes |
