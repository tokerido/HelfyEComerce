import mysql from 'mysql2/promise';
import { pool } from '../../db/connection';

export interface UserRow {
  id:            number;
  name:          string;
  email:         string;
  password_hash: string;
  created_at:    Date;
}

export const authRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?',
      [email]
    );
    return (rows[0] as UserRow) ?? null;
  },

  async createUser(name: string, email: string, passwordHash: string): Promise<{ id: number; name: string; email: string }> {
    try {
      const [result] = await pool.execute<mysql.ResultSetHeader>(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, passwordHash]
      );
      return { id: result.insertId, name, email };
    } catch (err: unknown) {
      const mysqlErr = err as { code?: string };
      if (mysqlErr.code === 'ER_DUP_ENTRY') {
        const { AppError } = await import('../../shared/errors/AppError');
        const { ErrorCodes } = await import('../../constants/errorCodes');
        throw new AppError('Email already exists', ErrorCodes.EMAIL_ALREADY_EXISTS, 409);
      }
      throw err;
    }
  },

  async findById(id: number): Promise<{ id: number; name: string; email: string } | null> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id, name, email FROM users WHERE id = ?',
      [id]
    );
    return (rows[0] as { id: number; name: string; email: string }) ?? null;
  },
};
