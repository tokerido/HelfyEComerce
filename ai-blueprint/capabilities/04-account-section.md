# Capability: Account Section

Order history and profile management.

---

## Scope

| Feature | Included |
|---|---|
| View order history (paginated list) | ✅ |
| View single order detail | ✅ |
| Update profile name | ✅ |
| Update email | ✅ |
| Change password | ✅ |
| Delete account | ❌ Out of scope |
| Address book management | ❌ Out of scope |
| Notifications / preferences | ❌ Out of scope |

---

## Backend API Endpoints (all protected)

### GET `/api/users/me`

Returns the authenticated user's profile.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PATCH `/api/users/me`

Update profile name and/or email.

**Request:**
```json
{ "name": "Jane Smith", "email": "jane.smith@example.com" }
```

**Response 200:** Updated user object

**Errors:**
- `409` — `EMAIL_ALREADY_EXISTS` (if new email is taken)
- `400` — `VALIDATION_ERROR`

---

### PATCH `/api/users/me/password`

Change password.

**Request:**
```json
{
  "currentPassword": "OldPass1",
  "newPassword": "NewSecure2"
}
```

**Response 200:**
```json
{ "success": true, "data": { "message": "Password updated successfully" } }
```

**Errors:**
- `401` — `INVALID_CREDENTIALS` (wrong current password)
- `400` — `VALIDATION_ERROR`

---

### GET `/api/orders`

Returns paginated list of the authenticated user's orders, most recent first.

**Query params:** `page` (default 1), `limit` (default 10)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 142,
      "orderNumber": "ORD-00142",
      "status": "delivered",
      "total": "205.33",
      "itemCount": 3,
      "createdAt": "2024-03-10T14:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
}
```

---

### GET `/api/orders/:id`

Returns full order detail. Enforces ownership — throws 403 if the order doesn't belong to the requesting user.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 142,
    "orderNumber": "ORD-00142",
    "status": "delivered",
    "items": [
      {
        "id": 1,
        "productId": 3,
        "productName": "Aether Hoodie",
        "productImageUrl": "https://...",
        "quantity": 2,
        "unitPrice": "89.99",
        "lineTotal": "179.98"
      }
    ],
    "shippingAddress": {
      "firstName": "Jane",
      "lastName": "Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "subtotal": "179.98",
    "shippingCost": "9.99",
    "tax": "15.36",
    "total": "205.33",
    "createdAt": "2024-03-10T14:30:00Z"
  }
}
```

---

## Backend Implementation Steps

### `user.repository.ts`

```typescript
findById(id: number): Promise<User | null>
update(id: number, data: Partial<UpdateUserDto>): Promise<User>
updatePassword(id: number, passwordHash: string): Promise<void>
```

### `order.repository.ts`

```typescript
findByUserId(userId: number, page: number, limit: number): Promise<{ orders: OrderSummary[]; total: number }>
findByIdWithItems(orderId: number): Promise<OrderDetail | null>
```

### `user.service.ts`

```typescript
async updateProfile(userId, data) {
  if (data.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing && existing.id !== userId) {
      throw new AppError('Email already in use', ErrorCodes.EMAIL_ALREADY_EXISTS, 409);
    }
  }
  return userRepo.update(userId, data);
}

async changePassword(userId, currentPassword, newPassword) {
  const user = await userRepo.findByIdWithHash(userId); // includes password_hash
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Wrong password', ErrorCodes.INVALID_CREDENTIALS, 401);
  const newHash = await hashPassword(newPassword);
  await userRepo.updatePassword(userId, newHash);
}
```

---

## Frontend: Account Page

**URL:** `/account`

**Route:** Protected — requires authentication.

### Layout

Two-column layout (desktop: 280px sidebar + flex-1 main content):

**Sidebar navigation:**
```
[User avatar initials]
Jane Doe
jane@example.com

─────────────
📦 Order History    ← tab
👤 Profile          ← tab
🔒 Security         ← tab
```

On mobile: tabs shown as horizontal scrollable pills at the top.

Use URL hash or local state to track active tab (local state preferred — no need to deep-link).

---

### Tab: Order History

**Default view — Order List:**

- Each order shown as a `Card` with:
  - Order number (`#ORD-00142`) — left
  - Status badge (colored): `pending` (yellow), `processing` (blue), `shipped` (purple), `delivered` (green), `cancelled` (red)
  - Date placed
  - Total amount
  - Item count ("3 items")
  - "View Details" button

- Empty state: "No orders yet" with CTA to browse products

**Order Detail View (inline expansion or modal):**

When "View Details" is clicked, expand inline below the order row (accordion style) or open a modal. Show:
- All order items with thumbnail, name, qty, price
- Shipping address
- Cost breakdown (subtotal, shipping, tax, total)

---

### Tab: Profile

Form with:
- Name field (pre-filled)
- Email field (pre-filled)
- "Save Changes" button

Success: show success toast "Profile updated"
Error: show error toast if email taken

---

### Tab: Security

Form with:
- Current password
- New password
- Confirm new password (client-side match validation)

"Change Password" button.
Success: toast + clear the form fields.

---

## Order Status Badge Colors

```typescript
const statusStyles: Record<string, string> = {
  pending:    'bg-warning/15 text-warning border-warning/30',
  processing: 'bg-accent/15 text-accent border-accent/30',
  shipped:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered:  'bg-success/15 text-success border-success/30',
  cancelled:  'bg-error/15 text-error border-error/30',
};
```

---

## useAccount Hook

```typescript
// features/account/hooks/useAccount.ts
export function useAccount() {
  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: accountApi.getProfile });
  const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: accountApi.getOrders });

  const updateProfileMutation = useMutation({
    mutationFn: accountApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: accountApi.changePassword,
    onSuccess: () => toast.success('Password changed'),
    onError: (err) => toast.error(err.message),
  });

  return {
    profile: profileQuery.data,
    orders: ordersQuery.data,
    isLoading: profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
  };
}
```
