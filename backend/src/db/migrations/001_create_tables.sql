-- eCommerce Platform Database Schema
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255)  NOT NULL,
  slug             VARCHAR(255)  NOT NULL UNIQUE,
  description      TEXT,
  price            DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) DEFAULT NULL,
  category_id      INT UNSIGNED  NOT NULL,
  stock_quantity   INT UNSIGNED  NOT NULL DEFAULT 0,
  image_url        VARCHAR(1000) NOT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url  VARCHAR(1000) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_image_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  cart_id      INT UNSIGNED  NOT NULL,
  product_id   INT UNSIGNED  NOT NULL,
  quantity     INT UNSIGNED  NOT NULL DEFAULT 1,
  price_at_add DECIMAL(10,2) NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  CONSTRAINT fk_cartitem_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(20)   NOT NULL UNIQUE,
  user_id          INT UNSIGNED  NOT NULL,
  status           ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(10,2) NOT NULL,
  shipping_cost    DECIMAL(10,2) NOT NULL,
  tax              DECIMAL(10,2) NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  shipping_address JSON          NOT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id                INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_id          INT UNSIGNED  NOT NULL,
  product_id        INT UNSIGNED  DEFAULT NULL,
  product_name      VARCHAR(255)  NOT NULL,
  product_image_url VARCHAR(1000) NOT NULL,
  quantity          INT UNSIGNED  NOT NULL,
  unit_price        DECIMAL(10,2) NOT NULL,
  line_total        DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_orderitem_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
