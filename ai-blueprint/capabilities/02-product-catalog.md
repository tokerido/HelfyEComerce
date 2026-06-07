# Capability: Product Catalog

Search, filter, and detailed product views.

---

## Scope

| Feature | Included |
|---|---|
| Product listing with pagination | ✅ |
| Full-text search by name/description | ✅ |
| Filter by category | ✅ |
| Filter by price range | ✅ |
| Sort by price / newest / name | ✅ |
| Detailed product view page | ✅ |
| Product image gallery | ✅ |
| Stock availability indicator | ✅ |
| Product reviews/ratings | ❌ Out of scope |
| Wishlist / saved items | ❌ Out of scope |
| Related products section | ✅ (basic — same category) |

---

## Data Model

See `05-database-schema.md` for full DDL. Key fields:

```
products: id, name, description, price, compare_at_price (for sale), 
          category_id, stock_quantity, image_url, slug, created_at

categories: id, name, slug

product_images: id, product_id, image_url, sort_order
```

---

## Backend API Endpoints

### GET `/api/products`

**Query params:**
```
search?       string   — full-text search against name and description
category?     string   — category slug
minPrice?     number
maxPrice?     number
sortBy?       'price_asc' | 'price_desc' | 'newest' | 'name_asc'
page?         number   — default 1
limit?        number   — default 20, max 50
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Aether Hoodie",
      "slug": "aether-hoodie",
      "description": "...",
      "price": "89.99",
      "compareAtPrice": "119.99",
      "category": { "id": 2, "name": "Clothing", "slug": "clothing" },
      "stockQuantity": 14,
      "imageUrl": "https://...",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 84, "totalPages": 5 }
}
```

---

### GET `/api/products/:slug`

Returns full product detail including all images.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Aether Hoodie",
    "slug": "aether-hoodie",
    "description": "Full markdown description here...",
    "price": "89.99",
    "compareAtPrice": "119.99",
    "category": { "id": 2, "name": "Clothing", "slug": "clothing" },
    "stockQuantity": 14,
    "images": [
      { "id": 1, "url": "https://...", "sortOrder": 0 },
      { "id": 2, "url": "https://...", "sortOrder": 1 }
    ],
    "relatedProducts": [ /* up to 4 products from same category */ ]
  }
}
```

**Errors:**
- `404` — `PRODUCT_NOT_FOUND`

---

### GET `/api/categories`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Electronics", "slug": "electronics" },
    { "id": 2, "name": "Clothing", "slug": "clothing" }
  ]
}
```

---

## Backend Implementation Steps

### `product.repository.ts`

```typescript
findAll(filters: ProductFilters): Promise<{ products: Product[]; total: number }>
findBySlug(slug: string): Promise<ProductDetail | null>
findRelated(categoryId: number, excludeId: number, limit: number): Promise<Product[]>
```

**`findAll` query pattern:**

```typescript
async findAll(filters) {
  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }
  if (filters.category) {
    conditions.push('c.slug = ?');
    params.push(filters.category);
  }
  if (filters.minPrice != null) {
    conditions.push('p.price >= ?');
    params.push(filters.minPrice);
  }
  if (filters.maxPrice != null) {
    conditions.push('p.price <= ?');
    params.push(filters.maxPrice);
  }

  const sortMap: Record<string, string> = {
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    name_asc: 'p.name ASC',
  };
  const orderBy = sortMap[filters.sortBy ?? 'newest'];
  const offset = ((filters.page ?? 1) - 1) * (filters.limit ?? 20);

  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, filters.limit ?? 20, offset]
  );
  // Also run COUNT(*) query for pagination meta
}
```

---

## Frontend Implementation

### State & Data Fetching

Use **URL-driven filter state** — all filters live in the URL as query params, not component state. This makes filters shareable and handles browser back/forward correctly.

```typescript
// features/products/hooks/useProducts.ts
export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as SortOption) ?? 'newest',
    page: Number(searchParams.get('page') ?? 1),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
    keepPreviousData: true,   // smooth pagination
  });

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams(prev => {
      if (!value) prev.delete(key);
      else prev.set(key, value);
      prev.set('page', '1'); // reset to page 1 on filter change
      return prev;
    });
  };

  return { products: data?.data, meta: data?.meta, isLoading, filters, setFilter };
}
```

### Search Bar Component

- Debounced input (300ms) using `useDebounce` hook
- Clear button when search has a value
- Shows result count below: "84 products found"

### Filter Sidebar / Panel

For desktop: fixed left sidebar, sticky while scrolling
For mobile: filters in a bottom sheet modal triggered by a "Filters" button

**Filter sections:**
1. **Categories** — checkbox list, fetched from `/api/categories`
2. **Price Range** — dual-handle range slider or two number inputs (min/max)
3. **Sort By** — select dropdown: Newest, Price: Low–High, Price: High–Low, Name A–Z

Active filters shown as dismissible badge chips above the product grid.

### Product Grid

- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Staggered entrance animation (see `05-ui-design-system.md`)
- Skeleton loading: show 8 placeholder cards while fetching

### Product Detail Page

**URL pattern:** `/products/:slug`

**Layout:**
- Left (60%): image gallery — main image large, thumbnail strip below
- Right (40%): 
  - Category breadcrumb
  - Product name (H1)
  - Price (with compare-at price strikethrough if on sale)
  - Stock status badge ("In Stock" / "Low Stock <5" / "Out of Stock")
  - Description (rendered as markdown using `react-markdown`)
  - Quantity selector (+/- stepper, max = stock_quantity)
  - "Add to Cart" button (disabled if out of stock)

**Image Gallery:**
- Click thumbnail to change main image
- Main image: smooth crossfade transition

**Related Products:**
- "You might also like" section below main content
- Horizontal scroll on mobile, 4-column grid on desktop
- Same `ProductCard` component

### Pagination

- Previous / Next buttons + page numbers
- Show up to 5 page number buttons with `...` ellipsis
- Updates URL param `page=N` on click
