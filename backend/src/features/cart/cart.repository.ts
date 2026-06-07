import mysql from 'mysql2/promise';
import { pool } from '../../db/connection';
import type { Cart, CartItem } from './cart.types';

export const cartRepository = {
  async getOrCreateCart(userId: number): Promise<{ id: number }> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM carts WHERE user_id = ?',
      [userId]
    );
    if (rows[0]) return { id: rows[0].id as number };

    const [result] = await pool.execute<mysql.ResultSetHeader>(
      'INSERT INTO carts (user_id) VALUES (?)',
      [userId]
    );
    return { id: result.insertId };
  },

  async getCartWithItems(userId: number): Promise<Cart | null> {
    const [cartRows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM carts WHERE user_id = ?',
      [userId]
    );
    if (!cartRows[0]) return null;
    const cartId = cartRows[0].id as number;

    const [itemRows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT ci.id, ci.quantity, ci.price_at_add,
              p.id AS product_id, p.name AS product_name,
              p.slug AS product_slug, p.image_url AS product_image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    const items: CartItem[] = (itemRows as mysql.RowDataPacket[]).map(r => ({
      id:         r.id as number,
      product:    { id: r.product_id as number, name: r.product_name as string, slug: r.product_slug as string, imageUrl: r.product_image_url as string },
      quantity:   r.quantity as number,
      priceAtAdd: r.price_at_add as string,
      lineTotal:  (Number(r.price_at_add) * (r.quantity as number)).toFixed(2),
    }));

    const subtotal     = items.reduce((s, i) => s + Number(i.priceAtAdd) * i.quantity, 0);
    const shippingCost = subtotal >= 75 ? 0 : 9.99;
    const tax          = subtotal * 0.08;
    const total        = subtotal + shippingCost + tax;

    return {
      id:           cartId,
      items,
      subtotal:     subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      tax:          tax.toFixed(2),
      total:        total.toFixed(2),
    };
  },

  async findItem(cartId: number, productId: number): Promise<{ id: number; quantity: number } | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    return rows[0] ? { id: rows[0].id as number, quantity: rows[0].quantity as number } : null;
  },

  async addItem(cartId: number, productId: number, quantity: number, price: string): Promise<void> {
    await pool.execute(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_add) VALUES (?, ?, ?, ?)',
      [cartId, productId, quantity, price]
    );
  },

  async updateItemQuantity(itemId: number, quantity: number): Promise<void> {
    await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
  },

  async removeItem(itemId: number): Promise<void> {
    await pool.execute('DELETE FROM cart_items WHERE id = ?', [itemId]);
  },

  async clearCart(cartId: number): Promise<void> {
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  },

  async findItemById(itemId: number, userId: number): Promise<{ id: number; cartId: number } | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT ci.id, ci.cart_id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId]
    );
    return rows[0] ? { id: rows[0].id as number, cartId: rows[0].cart_id as number } : null;
  },
};
