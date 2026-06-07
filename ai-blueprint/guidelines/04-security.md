# Security Guidelines

Security decisions the AI agent must implement from day one. These are non-negotiable defaults, not optional enhancements.

---

## Authentication — JWT

### Strategy

- **Stateless JWT** stored in `localStorage` on the frontend (acceptable for this project scope)
- Access token lifetime: `7d` (configurable via `JWT_EXPIRES_IN` env var)
- No refresh token for this project scope — re-login on expiry

### Token Generation

```typescript
// auth.service.ts
import jwt from 'jsonwebtoken';
import { config } from '@/config';

interface TokenPayload {
  userId: number;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
  });
}
```

### Token Validation Middleware

```typescript
// src/shared/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';

export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', ErrorCodes.UNAUTHORIZED, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', ErrorCodes.TOKEN_EXPIRED, 401);
    }
    throw new AppError('Invalid token', ErrorCodes.TOKEN_INVALID, 401);
  }
};
```

---

## Password Security

### Hashing — bcrypt

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Rules

- **Never** store plain-text passwords
- **Never** return `password_hash` field in any API response — strip it in the repository layer
- Minimum password: 8 chars, must include uppercase, lowercase, and a digit (enforced by Zod schema — see `auth.types.ts`)

---

## SQL Injection Prevention

- **Always** use parameterized queries with `mysql2` — never string interpolation

```typescript
// CORRECT
pool.execute('SELECT * FROM products WHERE id = ?', [id]);

// NEVER DO THIS
pool.execute(`SELECT * FROM products WHERE id = ${id}`);
```

- All user-supplied values go through `?` placeholders
- Repository layer is the only place SQL is written

---

## CORS Configuration

```typescript
// app.ts
import cors from 'cors';

app.use(cors({
  origin: config.cors.origin,       // from env var, e.g. http://localhost:5173
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
```

---

## Helmet — HTTP Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
// Sets: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
//       Strict-Transport-Security, Content-Security-Policy (defaults)
```

---

## Rate Limiting

Apply to auth endpoints to prevent brute-force attacks:

```typescript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // max 20 requests per window per IP
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply in auth.router.ts:
router.post('/login', authLimiter, validate(LoginSchema), asyncHandler(login));
router.post('/signup', authLimiter, validate(SignupSchema), asyncHandler(signup));
```

---

## Input Sanitization

- All request bodies validated with Zod (see `03-error-handling.md`) — Zod strips unknown fields by default when using `.strict()`
- Add `.trim()` to all string fields in Zod schemas

```typescript
export const SignupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
});
```

---

## Authorization Rules

| Resource | Rule |
|---|---|
| GET /products | Public — no auth required |
| GET /products/:id | Public |
| POST/DELETE /cart | Auth required — user can only modify their own cart |
| POST /orders | Auth required |
| GET /orders | Auth required — user can only see their own orders |
| GET/PATCH /users/me | Auth required — user can only access their own profile |
| Any admin action | Not in scope for this project |

Enforce ownership in the **service layer**:

```typescript
// order.service.ts
async getOrderById(orderId: number, requestingUserId: number) {
  const order = await this.orderRepo.findById(orderId);
  if (!order) throw new AppError('Order not found', ErrorCodes.ORDER_NOT_FOUND, 404);
  if (order.userId !== requestingUserId) {
    throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
  }
  return order;
}
```

---

## Environment Variable Security

- `.env` is in `.gitignore` — never committed
- `.env.example` contains only placeholder values (no real secrets)
- Docker Compose reads from `.env` file at project root
- Production-grade secrets: in a real deployment, use a secrets manager (out of scope here, but document it)

---

## Dependencies Security

Install only battle-tested packages:

| Purpose | Package |
|---|---|
| JWT | `jsonwebtoken` + `@types/jsonwebtoken` |
| Password hashing | `bcrypt` + `@types/bcrypt` |
| HTTP headers | `helmet` |
| Rate limiting | `express-rate-limit` |
| CORS | `cors` + `@types/cors` |
| Validation | `zod` |
| DB client | `mysql2` |
| Logging | `pino` + `pino-http` |
