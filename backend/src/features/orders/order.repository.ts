import mysql from 'mysql2/promise';
import { pool } from '../../db/connection';
import type { OrderDetail, OrderSummary } from './order.types';

export const orderRepository = {
  async create(
    userId: number,
    subtotal: string,
    shippingCost: string,
    tax: string,
    total: string,
    shippingAddress: object,
    items: { productId: number; productName: string; productImageUrl: string; quantity: number; unitPrice: string; lineTotal: string }[]
  ): Promise<{ orderId: number; orderNumber: string }> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO orders (order_number, user_id, subtotal, shipping_cost, tax, total, shipping_address)
         VALUES ('TEMP', ?, ?, ?, ?, ?, ?)`,
        [userId, subtotal, shippingCost, tax, total, JSON.stringify(shippingAddress)]
      );
      const orderId = orderResult.insertId;
      const orderNumber = `ORD-${String(orderId).padStart(5, '0')}`;

      await conn.execute('UPDATE orders SET order_number = ? WHERE id = ?', [orderNumber, orderId]);

      for (const item of items) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image_url, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.productName, item.productImageUrl, item.quantity, item.unitPrice, item.lineTotal]
        );
        await conn.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      await conn.commit();
      return { orderId, orderNumber };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findByUserId(userId: number, page: number, limit: number): Promise<{ orders: OrderSummary[]; total: number }> {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT o.id, o.order_number, o.status, o.total, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const [countRows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
      [userId]
    );
    const orders: OrderSummary[] = (rows as mysql.RowDataPacket[]).map(r => ({
      id:          r.id as number,
      orderNumber: r.order_number as string,
      status:      r.status as string,
      total:       r.total as string,
      itemCount:   r.item_count as number,
      createdAt:   r.created_at as string,
    }));
    return { orders, total: countRows[0].total as number };
  },

  async findByIdForUser(orderId: number, userId: number): Promise<OrderDetail | null> {
    const [orderRows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    if (!orderRows[0]) return null;
    return orderRepository.findByIdWithItems(orderId);
  },

  async findByIdWithItems(orderId: number): Promise<OrderDetail | null> {
    const [orderRows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    if (!orderRows[0]) return null;
    const o = orderRows[0];

    const [itemRows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    return {
      id:              o.id as number,
      orderNumber:     o.order_number as string,
      status:          o.status as string,
      shippingAddress: JSON.parse(o.shipping_address as string),
      subtotal:        o.subtotal as string,
      shippingCost:    o.shipping_cost as string,
      tax:             o.tax as string,
      total:           o.total as string,
      createdAt:       o.created_at as string,
      items:           (itemRows as mysql.RowDataPacket[]).map(i => ({
        id:              i.id as number,
        productId:       i.product_id as number | null,
        productName:     i.product_name as string,
        productImageUrl: i.product_image_url as string,
        quantity:        i.quantity as number,
        unitPrice:       i.unit_price as string,
        lineTotal:       i.line_total as string,
      })),
    };
  },
};
