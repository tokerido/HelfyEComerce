-- Seed Data
INSERT IGNORE INTO categories (name, slug) VALUES
  ('Clothing',      'clothing'),
  ('Electronics',   'electronics'),
  ('Home & Living', 'home-living'),
  ('Accessories',   'accessories'),
  ('Footwear',      'footwear');

INSERT IGNORE INTO products (name, slug, description, price, compare_at_price, category_id, stock_quantity, image_url) VALUES
  ('Aether Hoodie', 'aether-hoodie',
   'Premium heavyweight French terry hoodie crafted for all-season comfort. Garment-washed for an instant vintage feel with reinforced kangaroo pocket and ribbed cuffs.',
   89.99, 119.99, 1, 45, 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&h=1000&fit=crop'),

  ('Eclipse Crewneck', 'eclipse-crewneck',
   'Ultra-soft 100% organic cotton crewneck. Oversized silhouette, dropped shoulders, and a washed finish that only gets better with age.',
   74.99, NULL, 1, 30, 'https://images.unsplash.com/photo-1581791538161-8a7b7a5d8e5e?w=800&h=1000&fit=crop'),

  ('Obsidian Cargo Pants', 'obsidian-cargo-pants',
   'Technical cargo pants with 8 pockets, adjustable hem drawstrings, and a water-resistant finish. Built for the city and beyond.',
   129.99, 159.99, 1, 20, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop'),

  ('Vapor Tee', 'vapor-tee',
   'Impossibly lightweight modal-cotton blend tee. Barely-there fabric that drapes beautifully and breathes all day.',
   39.99, NULL, 1, 80, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop'),

  ('Flux Quarter-Zip', 'flux-quarter-zip',
   'Brushed fleece quarter-zip with reflective logo detail. The perfect mid-layer for transitional weather.',
   94.99, NULL, 1, 35, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=1000&fit=crop'),

  ('Horizon Denim Jacket', 'horizon-denim-jacket',
   'Stone-washed selvedge denim jacket with custom aged brass hardware. A classic silhouette updated for today.',
   149.99, 189.99, 1, 15, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=1000&fit=crop'),

  ('Phantom Wireless Earbuds', 'phantom-wireless-earbuds',
   'Active noise cancellation with 32-hour total battery life. Custom-tuned drivers deliver studio-grade sound in a compact, weather-resistant form.',
   199.99, 249.99, 2, 60, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=1000&fit=crop'),

  ('Monolith Portable Speaker', 'monolith-portable-speaker',
   'Omnidirectional 360 sound in a rugged, IPX7 waterproof chassis. 20-hour battery and USB-C passthrough charging.',
   149.99, NULL, 2, 40, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=1000&fit=crop'),

  ('Aurora Smart Watch', 'aurora-smart-watch',
   'Health-first smartwatch with ECG, SpO2, and continuous HRV monitoring. Always-on AMOLED display with 7-day battery.',
   349.99, 399.99, 2, 25, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop'),

  ('Lumen Desk Lamp', 'lumen-desk-lamp',
   'Architectural LED desk lamp with touch-dimming and 5 color temperatures. Wireless charging base built in.',
   119.99, NULL, 2, 50, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=1000&fit=crop'),

  ('Nexus Mechanical Keyboard', 'nexus-mechanical-keyboard',
   'Compact 75% layout with hot-swappable switches and per-key RGB. Aluminum frame with programmable OLED display.',
   189.99, 219.99, 2, 30, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=1000&fit=crop'),

  ('Solstice Ceramic Mug Set', 'solstice-ceramic-mug-set',
   'Set of 4 hand-thrown ceramic mugs with speckled matte glaze. Each piece uniquely imperfect, exactly as it should be.',
   64.99, NULL, 3, 40, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=1000&fit=crop'),

  ('Grove Candle Trio', 'grove-candle-trio',
   'Three coconut-wax candles in hand-blown amber glass. Scents: Hinoki and Cedar, Bergamot and Vetiver, Rain and Petrichor.',
   79.99, NULL, 3, 55, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=1000&fit=crop'),

  ('Linen Throw Blanket', 'linen-throw-blanket',
   'Pre-washed European linen throw in a generous 140x200cm size. Softens beautifully over time, naturally temperature-regulating.',
   109.99, 139.99, 3, 30, 'https://images.unsplash.com/photo-1580301762395-a586c61ea9bc?w=800&h=1000&fit=crop'),

  ('Timber Serving Board', 'timber-serving-board',
   'Live-edge black walnut charcuterie board with integrated juice groove. No two boards are the same.',
   84.99, NULL, 3, 20, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop'),

  ('Obsidian Leather Wallet', 'obsidian-leather-wallet',
   'Slim bifold in full-grain vegetable-tanned leather. 6 card slots, 2 bill compartments, ages to a gorgeous patina.',
   79.99, NULL, 4, 65, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=1000&fit=crop'),

  ('Meridian Canvas Tote', 'meridian-canvas-tote',
   'Heavy 16oz canvas tote with leather reinforced handles and a waxed cotton inner lining. Market bag that lasts a decade.',
   54.99, 69.99, 4, 45, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=1000&fit=crop'),

  ('Solar Titanium Sunglasses', 'solar-titanium-sunglasses',
   'Monocoque titanium frame with polarized mineral glass lenses. Weighs just 18 grams. Comes in a handmade leather case.',
   229.99, 279.99, 4, 20, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop'),

  ('Wax Canvas Backpack', 'wax-canvas-backpack',
   '25L waxed canvas backpack with full-grain leather trims. Laptop sleeve fits up to 16 inches. Gets better every adventure.',
   219.99, NULL, 4, 18, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop'),

  ('Dune Low Sneaker', 'dune-low-sneaker',
   'Minimalist low-top in natural suede with a cupsole construction. Cork-lined insole, unbleached cotton laces.',
   159.99, 189.99, 5, 35, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop'),

  ('Ashen Chelsea Boot', 'ashen-chelsea-boot',
   'Full-grain leather Chelsea with a crepe sole and elastic side gussets in a tonal black. Resoleable Goodyear welt.',
   279.99, NULL, 5, 22, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&h=1000&fit=crop'),

  ('Tide Sandal', 'tide-sandal',
   'Water-ready sandal with a recycled rubber outsole and adjustable webbing straps. From river hikes to rooftop bars.',
   89.99, NULL, 5, 50, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&h=1000&fit=crop');

INSERT IGNORE INTO product_images (product_id, image_url, sort_order)
SELECT id, image_url, 0 FROM products;
