# Capability: Cart & Checkout

Persistent cart and multi-step checkout process.

---

## Scope

| Feature | Included |
|---|---|
| Server-side persistent cart (DB) | ✅ |
| Cart synced on login | ✅ |
| Local cart for unauthenticated users | ✅ (Zustand, merged on login) |
| Add / update quantity / remove items | ✅ |
| Cart drawer (slide-in from right) | ✅ |
| Full cart page | ✅ |
| Multi-step checkout (3 steps) | ✅ |
| Order placement (creates DB record) | ✅ |
| Payment processing (real) | ❌ Mock form only |
| Coupon / discount codes | ❌ Out of scope |
| Shipping cost calculation | ✅ (flat rate: $9.99, free over $75) |
| Tax calculation | ✅ (flat rate: 8% on subtotal) |

---

## Cart Persistence Strategy

- **Unauthenticated**: cart stored in Zustand with `localStorage` persistence
- **Authenticated**: cart stored in DB, synced on every mutation
- **On login**: merge local cart into the DB cart (add quantities for same products)
- **On logout**: clear local cart store

---

## Data Model

See `05-database-schema.md`. Key tables:

```
carts:      id, user_id (FK), created_at, updated_at
cart_items: id, cart_id (FK), product_id (FK), quantity, price_at_add
```

`price_at_add` stores the product price at the time the item was added — protects against price changes affecting the cart.

---

## Backend API Endpoints (all protected)

### GET `/api/cart`

Returns the authenticated user's cart.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "items": [
      {
        "id": 12,
        "product": { "id": 3, "name": "Aether Hoodie", "slug": "aether-hoodie", "imageUrl": "..." },
        "quantity": 2,
        "priceAtAdd": "89.99",
        "lineTotal": "179.98"
      }
    ],
    "subtotal": "179.98",
    "shippingCost": "9.99",
    "tax": "15.36",
    "total": "205.33"
  }
}
```

---

### POST `/api/cart/items`

Add item or increment quantity if already in cart.

**Request:**
```json
{ "productId": 3, "quantity": 1 }
```

**Response 200:** Updated cart (same shape as GET)

**Errors:**
- `400` — `INSUFFICIENT_STOCK` (if requested qty > stock)
- `404` — `PRODUCT_NOT_FOUND`

---

### PATCH `/api/cart/items/:itemId`

Update quantity of a cart item.

**Request:**
```json
{ "quantity": 3 }
```

**Response 200:** Updated cart

**Errors:**
- `400` — `INSUFFICIENT_STOCK`
- `404` — `CART_ITEM_NOT_FOUND`

---

### DELETE `/api/cart/items/:itemId`

Remove an item from the cart.

**Response 200:** Updated cart

---

### POST `/api/cart/sync`

Merge a local cart (from unauthenticated session) into the DB cart after login.

**Request:**
```json
{
  "items": [
    { "productId": 3, "quantity": 2 },
    { "productId": 7, "quantity": 1 }
  ]
}
```

**Response 200:** Merged cart

**Behavior:** For each item in the payload — if already in cart, add the quantities; if not, add as new item.

---

## Cart Service Logic

```typescript
// Key business rules in cart.service.ts:

async addItem(userId, productId, quantity) {
  const product = await productRepo.findById(productId);
  if (!product) throw PRODUCT_NOT_FOUND;
  
  const cart = await this.getOrCreateCart(userId);
  const existing = await cartRepo.findItem(cart.id, productId);

  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stockQuantity) throw INSUFFICIENT_STOCK;

  if (existing) {
    await cartRepo.updateItemQuantity(existing.id, newQty);
  } else {
    await cartRepo.addItem(cart.id, productId, quantity, product.price);
  }
  
  return this.getCart(userId); // return full updated cart
}

calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) =>
    sum + Number(item.priceAtAdd) * item.quantity, 0);
  const shippingCost = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  return {
    subtotal: subtotal.toFixed(2),
    shippingCost: shippingCost.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  };
}
```

---

## Frontend Cart Store (Unauthenticated)

```typescript
// features/cart/store/cartStore.ts
// Used for local cart when not logged in
interface LocalCartState {
  items: LocalCartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}
```

When authenticated, the `useCart` hook reads from React Query (server cart), not this store.

### useCart Hook

```typescript
export function useCart() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const localCart = useCartStore();

  // Server cart (authenticated)
  const serverCartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  const addItemMutation = useMutation({
    mutationFn: isAuthenticated
      ? cartApi.addItem
      : (data) => { localCart.addItem(data.product, data.quantity); return Promise.resolve(); },
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });

  // Return unified interface regardless of auth state
  const cart = isAuthenticated ? serverCartQuery.data : localCart.derivedCart;
  return { cart, isLoading: serverCartQuery.isLoading, addItem: addItemMutation.mutate, ... };
}
```

---

## Cart UI Components

### CartDrawer

- Triggered by clicking cart icon in Navbar
- Slides in from right (Framer Motion `x: '100%'` → `x: 0`)
- Backdrop overlay with click-to-close
- Contains:
  - Header with item count and X close button
  - Scrollable list of `CartItem` components
  - Sticky bottom: subtotal + "View Cart" + "Checkout" buttons

### CartItem Component

- Product image (40×40px thumbnail)
- Product name + truncated description
- Price per unit
- Quantity stepper: `−` `[n]` `+` (inline update on change with 300ms debounce)
- Remove button (trash icon)
- Line total on right

### CartPage (`/cart`)

- Full page version of the cart
- Two-column layout (desktop): cart items left, order summary right
- Order summary shows: subtotal, shipping (or "Free" badge), tax, **total**
- Shipping threshold progress bar: "X more for free shipping"
- "Proceed to Checkout" CTA (disabled if cart empty)
- Empty state: illustration + "Your cart is empty" + CTA to browse products

---

## Checkout Flow (3 Steps)

URL: `/checkout`

Use a local step state (not URL) — no need to deep-link into checkout steps.

```
Step 1: Shipping → Step 2: Payment → Step 3: Confirmation
```

**Progress indicator:** Numbered stepper at the top showing current step.

### Step 1 — Shipping Information

Fields:
- First name, Last name
- Address line 1, Address line 2 (optional)
- City, State/Region, ZIP Code, Country
- Phone number

Pre-fill from user profile if available. Validate with Zod before proceeding.

"Continue to Payment" button advances to Step 2.

### Step 2 — Payment

**Mock form only** — no real payment processing.

Fields:
- Cardholder name
- Card number (format: `1234 5678 9012 3456`) — display only, not sent to backend
- Expiry (MM/YY), CVV
- Billing address checkbox: "Same as shipping" (default checked)

Order summary sidebar remains visible on desktop.

"Place Order" button:
1. Validates form
2. Calls `POST /api/orders` with shipping info
3. Navigates to Step 3 on success

### Step 3 — Confirmation

**No form.** Success state only.

- ✓ checkmark animation (Framer Motion)
- "Order placed successfully!"
- Order number: `#ORD-00142`
- Summary: items ordered, shipping address, estimated delivery (5–7 business days)
- CTA buttons: "Continue Shopping" → `/`, "View Order" → `/account`

---

## Order Placement API

### POST `/api/orders` *(protected)*

**Request:**
```json
{
  "shippingAddress": {
    "firstName": "Jane",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "phone": "+1 555 000 1234"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "orderId": 142,
    "orderNumber": "ORD-00142",
    "status": "pending",
    "total": "205.33"
  }
}
```

**Backend logic:**
1. Get user's cart — error if empty
2. Validate stock for all items (throw `INSUFFICIENT_STOCK` if any item exceeds stock)
3. Create `orders` record with totals and shipping address (JSON column)
4. Create `order_items` records (snapshot of product name, price, qty)
5. Decrement `stock_quantity` for each product
6. Delete all items from user's cart
7. Return order summary
