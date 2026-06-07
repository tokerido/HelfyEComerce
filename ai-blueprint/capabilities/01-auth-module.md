# Capability: Authentication Module

Full login and sign-up flow with JWT-based session management.

---

## Scope

| Feature | Included |
|---|---|
| Sign up (email + password) | ✅ |
| Login (email + password) | ✅ |
| Logout (client-side token removal) | ✅ |
| JWT issuance and validation | ✅ |
| Protected route guard (frontend) | ✅ |
| Persistent session on page refresh | ✅ |
| Password reset / forgot password | ❌ Out of scope |
| OAuth / social login | ❌ Out of scope |
| Email verification | ❌ Out of scope |
| Admin roles | ❌ Out of scope |

---

## Backend API Endpoints

### POST `/api/auth/signup`

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" }
  }
}
```

**Errors:**
- `409` — `EMAIL_ALREADY_EXISTS`
- `400` — `VALIDATION_ERROR`

---

### POST `/api/auth/login`

**Request body:**
```json
{ "email": "jane@example.com", "password": "SecurePass1" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" }
  }
}
```

**Errors:**
- `401` — `INVALID_CREDENTIALS`
- `400` — `VALIDATION_ERROR`

---

### GET `/api/auth/me` *(protected)*

Validates the token and returns the current user.

**Response 200:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" }
}
```

---

## Backend Implementation Steps

1. **`auth.repository.ts`**
   - `findByEmail(email)` → returns user row including `password_hash`, or `null`
   - `createUser(name, email, passwordHash)` → returns created user without `password_hash`

2. **`auth.service.ts`**
   - `signup(name, email, password)`:
     - Check if email exists → throw `EMAIL_ALREADY_EXISTS`
     - Hash password with `bcrypt` (12 rounds)
     - Create user in DB
     - Generate and return JWT + user object
   - `login(email, password)`:
     - Find user by email → throw `INVALID_CREDENTIALS` if not found
     - Compare password → throw `INVALID_CREDENTIALS` if mismatch
     - Generate and return JWT + user object
   - `getMe(userId)`:
     - Find user by ID → throw `USER_NOT_FOUND` if missing
     - Return user without `password_hash`

3. **`auth.controller.ts`**
   - `signup` → call `authService.signup`, return `201`
   - `login` → call `authService.login`, return `200`
   - `me` → call `authService.getMe(req.user.userId)`, return `200`

4. **`auth.router.ts`**
   ```typescript
   router.post('/signup', authLimiter, validate(SignupSchema), asyncHandler(signup));
   router.post('/login', authLimiter, validate(LoginSchema), asyncHandler(login));
   router.get('/me', authenticate, asyncHandler(me));
   ```

---

## Frontend Implementation

### Zustand Auth Store

```typescript
// features/auth/store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// Persist token to localStorage:
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
```

### API Calls

```typescript
// features/auth/api/authApi.ts
export const authApi = {
  signup: (data: SignupPayload) =>
    api.post<ApiResponse<AuthResult>>('/auth/signup', data).then(r => r.data.data),
  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthResult>>('/auth/login', data).then(r => r.data.data),
  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then(r => r.data.data),
};
```

### useAuth Hook

```typescript
// features/auth/hooks/useAuth.ts
export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      navigate(ROUTES.HOME);
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      navigate(ROUTES.HOME);
    },
  });

  return { user, isAuthenticated, loginMutation, signupMutation, logout };
}
```

### ProtectedRoute Component

```tsx
// shared/components/guards/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}
```

### Page UX

**Login Page**
- Full-screen split layout: left side — large background image / branded panel, right side — form
- Form: email input, password input (with show/hide toggle), "Login" CTA button, "Don't have an account? Sign up" link
- Show inline field errors from React Hook Form
- Show API error (INVALID_CREDENTIALS) as a toast notification
- Redirect to homepage on success

**Sign Up Page**
- Same split layout
- Form: name, email, password, confirm password (confirm password validated client-side only)
- Show inline field errors
- Redirect to homepage on success

---

## Initialization Check

On app startup (`App.tsx`), if a token exists in the store, call `GET /api/auth/me` to verify the token is still valid. If it fails with 401, call `logout()` to clear stale state.

```typescript
// App.tsx
useEffect(() => {
  if (token) {
    authApi.me().catch(() => logout());
  }
}, []);
```
