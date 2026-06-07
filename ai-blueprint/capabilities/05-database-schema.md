# Database Schema

Full MySQL schema for the eCommerce platform. All migrations live in `backend/src/db/migrations/` and run automatically on container startup via `migrate.ts`.

---

## Migration Files

```
backend/src/db/migrations/
├── 001_create_tables.sql
└── 002_seed_data.sql
```

---

## 001_create_tables.sql

```sql
-- ============================================================
-- eCommerce Platform — Database Schema
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  slug       VARCHAR(100)  NOT NULL UNIQUE,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255)  NOT NULL,
  slug             VARCHAR(255)  NOT NULL UNIQUE,
  description      TEXT,
  price            DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) DEFAULT NULL,       -- original price (shows as strikethrough)
  category_id      INT UNSIGNED  NOT NULL,
  stock_quantity   INT UNSIGNED  NOT NULL DEFAULT 0,
  image_url        VARCHAR(1000) NOT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PRODUCT IMAGES (gallery)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url  VARCHAR(1000) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_image_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- CARTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,           -- one cart per user
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- CART ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  cart_id      INT UNSIGNED  NOT NULL,
  product_id   INT UNSIGNED  NOT NULL,
  quantity     INT UNSIGNED  NOT NULL DEFAULT 1,
  price_at_add DECIMAL(10,2) NOT NULL,               -- snapshot of price at time of add
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_product (cart_id, product_id),  -- one row per product per cart
  CONSTRAINT fk_cartitem_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(20)   NOT NULL UNIQUE,            -- e.g. ORD-00142
  user_id          INT UNSIGNED  NOT NULL,
  status           ENUM('pending','processing','shipped','delivered','cancelled')
                                 NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(10,2) NOT NULL,
  shipping_cost    DECIMAL(10,2) NOT NULL,
  tax              DECIMAL(10,2) NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  shipping_address JSON          NOT NULL,                   -- snapshot of shipping address
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id)
    REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED  NOT NULL,
  product_id       INT UNSIGNED  DEFAULT NULL,               -- nullable: product may be deleted
  product_name     VARCHAR(255)  NOT NULL,                   -- snapshot
  product_image_url VARCHAR(1000) NOT NULL,                  -- snapshot
  quantity         INT UNSIGNED  NOT NULL,
  unit_price       DECIMAL(10,2) NOT NULL,
  line_total       DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_orderitem_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

---

## 002_seed_data.sql

Provides realistic demo data. Use real product image URLs from a free CDN (e.g., Unsplash with static dimensions like `https://images.unsplash.com/photo-<id>?w=800&h=1000&fit=crop`).

```sql
-- ============================================================
-- Seed Data
-- ============================================================

-- Categories
INSERT INTO categories (name, slug) VALUES
  ('Clothing',     'clothing'),
  ('Electronics',  'electronics'),
  ('Home & Living','home-living'),
  ('Accessories',  'accessories'),
  ('Footwear',     'footwear');

-- Products (30 total across categories)
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, stock_quantity, image_url) VALUES
  -- Clothing
  ('Aether Hoodie',
   'aether-hoodie',
   'Premium heavyweight French terry hoodie crafted for all-season comfort. Garment-washed for an instant vintage feel with reinforced kangaroo pocket and ribbed cuffs.',
   89.99, 119.99, 1, 45, 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&h=1000&fit=crop'),

  ('Eclipse Crewneck',
   'eclipse-crewneck',
   'Ultra-soft 100% organic cotton crewneck. Oversized silhouette, dropped shoulders, and a washed finish that only gets better with age.',
   74.99, NULL, 1, 30, 'https://images.unsplash.com/photo-1581791538161-8a7b7a5d8e5e?w=800&h=1000&fit=crop'),

  ('Obsidian Cargo Pants',
   'obsidian-cargo-pants',
   'Technical cargo pants with 8 pockets, adjustable hem drawstrings, and a water-resistant finish. Built for the city and beyond.',
   129.99, 159.99, 1, 20, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop'),

  ('Vapor Tee',
   'vapor-tee',
   'Impossibly lightweight modal-cotton blend tee. Barely-there fabric that drapes beautifully and breathes all day.',
   39.99, NULL, 1, 80, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop'),

  ('Flux Quarter-Zip',
   'flux-quarter-zip',
   'Brushed fleece quarter-zip with reflective logo detail. The perfect mid-layer for transitional weather.',
   94.99, NULL, 1, 35, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=1000&fit=crop'),

  ('Horizon Denim Jacket',
   'horizon-denim-jacket',
   'Stone-washed selvedge denim jacket with custom aged brass hardware. A classic silhouette updated for today.',
   149.99, 189.99, 1, 15, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=1000&fit=crop'),

  -- Electronics
  ('Phantom Wireless Earbuds',
   'phantom-wireless-earbuds',
   'Active noise cancellation with 32-hour total battery life. Custom-tuned drivers deliver studio-grade sound in a compact, weather-resistant form.',
   199.99, 249.99, 2, 60, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=1000&fit=crop'),

  ('Monolith Portable Speaker',
   'monolith-portable-speaker',
   'Omnidirectional 360° sound in a rugged, IPX7 waterproof chassis. 20-hour battery and USB-C passthrough charging.',
   149.99, NULL, 2, 40, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=1000&fit=crop'),

  ('Aurora Smart Watch',
   'aurora-smart-watch',
   'Health-first smartwatch with ECG, SpO2, and continuous HRV monitoring. Always-on AMOLED display with 7-day battery.',
   349.99, 399.99, 2, 25, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=1000&fit=crop'),

  ('Lumen Desk Lamp',
   'lumen-desk-lamp',
   'Architectural LED desk lamp with touch-dimming and 5 color temperatures. Wireless charging base built in.',
   119.99, NULL, 2, 50, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=1000&fit=crop'),

  ('Nexus Mechanical Keyboard',
   'nexus-mechanical-keyboard',
   'Compact 75% layout with hot-swappable switches and per-key RGB. Aluminum frame with programmable OLED display.',
   189.99, 219.99, 2, 30, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=1000&fit=crop'),

  -- Home & Living
  ('Solstice Ceramic Mug Set',
   'solstice-ceramic-mug-set',
   'Set of 4 hand-thrown ceramic mugs with speckled matte glaze. Each piece uniquely imperfect, exactly as it should be.',
   64.99, NULL, 3, 40, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=1000&fit=crop'),

  ('Grove Candle Trio',
   'grove-candle-trio',
   'Three coconut-wax candles in hand-blown amber glass. Scents: Hinoki & Cedar, Bergamot & Vetiver, Rain & Petrichor.',
   79.99, NULL, 3, 55, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=1000&fit=crop'),

  ('Linen Throw Blanket',
   'linen-throw-blanket',
   'Pre-washed European linen throw in a generous 140×200cm size. Softens beautifully over time, naturally temperature-regulating.',
   109.99, 139.99, 3, 30, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=1000&fit=crop'),

  ('Timber Serving Board',
   'timber-serving-board',
   'Live-edge black walnut charcuterie board with integrated juice groove. No two boards are the same.',
   84.99, NULL, 3, 20, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop'),

  -- Accessories
  ('Obsidian Leather Wallet',
   'obsidian-leather-wallet',
   'Slim bifold in full-grain vegetable-tanned leather. 6 card slots, 2 bill compartments, ages to a gorgeous patina.',
   79.99, NULL, 4, 65, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=1000&fit=crop'),

  ('Meridian Canvas Tote',
   'meridian-canvas-tote',
   'Heavy 16oz canvas tote with leather reinforced handles and a waxed cotton inner lining. Market bag that lasts a decade.',
   54.99, 69.99, 4, 45, 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&h=1000&fit=crop'),

  ('Solar Titanium Sunglasses',
   'solar-titanium-sunglasses',
   'Monocoque titanium frame with polarized mineral glass lenses. Weighs just 18 grams. Comes in a handmade leather case.',
   229.99, 279.99, 4, 20, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop'),

  ('Wax Canvas Backpack',
   'wax-canvas-backpack',
   '25L waxed canvas backpack with full-grain leather trims. Laptop sleeve fits up to 16". Gets better every adventure.',
   219.99, NULL, 4, 18, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop'),

  -- Footwear
  ('Dune Low Sneaker',
   'dune-low-sneaker',
   'Minimalist low-top in natural suede with a cupsole construction. Cork-lined insole, unbleached cotton laces.',
   159.99, 189.99, 5, 35, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop'),

  ('Ashen Chelsea Boot',
   'ashen-chelsea-boot',
   'Full-grain leather Chelsea with a crepe sole and elastic side gussets in a tonal black. Resoleable Goodyear welt.',
   279.99, NULL, 5, 22, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&h=1000&fit=crop'),

  ('Tide Sandal',
   'tide-sandal',
   'Water-ready sandal with a recycled rubber outsole and adjustable webbing straps. From river hikes to rooftop bars.',
   89.99, NULL, 5, 50, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&h=1000&fit=crop');

-- Product images (additional gallery images per product — first matches image_url above)
INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, image_url, 0 FROM products;

-- (In production, add more gallery images per product here)
```

---

## Migration Runner

```typescript
// backend/src/db/migrate.ts
import fs from 'fs';
import path from 'path';
import { pool } from './connection';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // ensures 001, 002, ... order

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    // Split on semicolons to handle multi-statement files
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const statement of statements) {
      await pool.execute(statement);
    }
    console.log(`[migrate] ✓ ${file}`);
  }

  console.log('[migrate] All migrations complete');
  await pool.end();
}

runMigrations().catch(err => {
  console.error('[migrate] Migration failed:', err);
  process.exit(1);
});
```

Run as: `npx ts-node src/db/migrate.ts` (or compiled: `node dist/db/migrate.js`)

---

## DB Connection Pool

```typescript
// backend/src/db/connection.ts
import mysql from 'mysql2/promise';
import { config } from '../config';

export const pool = mysql.createPool({
  host:            config.db.host,
  port:            config.db.port,
  database:        config.db.name,
  user:            config.db.user,
  password:        config.db.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0,
  timezone:        'Z',             // UTC
  charset:         'utf8mb4',
});
```

---

## Order Number Generation

Order numbers like `ORD-00142` are generated in the order service:

```typescript
// order.service.ts
function generateOrderNumber(orderId: number): string {
  return `ORD-${String(orderId).padStart(5, '0')}`;
}
// Note: Generate after INSERT to use the auto-increment ID,
// then UPDATE orders SET order_number = ? WHERE id = ?
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| `price_at_add` in cart_items | Protects cart total from live price changes |
| `shipping_address` as JSON | Address is a snapshot — no need for a normalized address table |
| `product_name` + `product_image_url` in order_items | Protects order history if product is edited or deleted |
| `product_id` nullable in order_items | `ON DELETE SET NULL` — order item survives product deletion |
| Single cart per user (UNIQUE on user_id) | Simplifies cart management; no active/inactive cart logic needed |
