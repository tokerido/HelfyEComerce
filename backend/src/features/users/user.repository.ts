import mysql from 'mysql2/promise';
import { pool } from '../../db/connection';
import type { User } from './user.types';

export const userRepository = {
  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return { id: r.id as number, name: r.name as string, email: r.email as string, createdAt: r.created_at as string };
  },

  async findByIdWithHash(id: number): Promise<{ id: number; name: string; email: string; passwordHash: string } | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id, name, email, password_hash FROM users WHERE id = ?',
      [id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return { id: r.id as number, name: r.name as string, email: r.email as string, passwordHash: r.password_hash as string };
  },

  async findByEmail(email: string): Promise<{ id: number } | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    return rows[0] ? { id: rows[0].id as number } : null;
  },

  async update(id: number, data: { name?: string; email?: string }): Promise<User> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (data.name)  { fields.push('name = ?');  values.push(data.name); }
    if (data.email) { fields.push('email = ?'); values.push(data.email); }
    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return userRepository.findById(id) as Promise<User>;
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  },
};
