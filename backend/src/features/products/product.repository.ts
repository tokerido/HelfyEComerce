import mysql from 'mysql2/promise';
import { pool } from '../../db/connection';
import type { Product, ProductDetail, ProductFilters } from './product.types';

function mapRow(row: mysql.RowDataPacket): Product {
  return {
    id:             row.id,
    name:           row.name,
    slug:           row.slug,
    description:    row.description,
    price:          row.price,
    compareAtPrice: row.compare_at_price ?? null,
    category:       { id: row.category_id, name: row.category_name, slug: row.category_slug },
    stockQuantity:  row.stock_quantity,
    imageUrl:       row.image_url,
    createdAt:      row.created_at,
  };
}

export const productRepository = {
  async findAll(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
    const conditions: string[] = ['1=1'];
    const params: (string | number)[] = [];

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
      price_asc:  'p.price ASC',
      price_desc: 'p.price DESC',
      newest:     'p.created_at DESC',
      name_asc:   'p.name ASC',
    };
    const orderBy = sortMap[filters.sortBy ?? 'newest'] ?? 'p.created_at DESC';
    const limit  = Math.min(filters.limit ?? 20, 50);
    const offset = ((filters.page ?? 1) - 1) * limit;
    const where  = conditions.join(' AND ');

    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE ${where}`,
      params
    );

    return {
      products: (rows as mysql.RowDataPacket[]).map(mapRow),
      total:    countRows[0].total as number,
    };
  },

  async findBySlug(slug: string): Promise<ProductDetail | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );
    if (!rows[0]) return null;

    const product = mapRow(rows[0]);

    const [imgRows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id, image_url AS url, sort_order AS sortOrder FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    );

    const related = await productRepository.findRelated(rows[0].category_id as number, product.id, 4);

    return { ...product, images: imgRows as { id: number; url: string; sortOrder: number }[], relatedProducts: related };
  },

  async findRelated(categoryId: number, excludeId: number, limit: number): Promise<Product[]> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ?
       ORDER BY RAND()
       LIMIT ?`,
      [categoryId, excludeId, limit]
    );
    return (rows as mysql.RowDataPacket[]).map(mapRow);
  },

  async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },
};
