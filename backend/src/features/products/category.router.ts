import { Router } from 'express';
import mysql from 'mysql2/promise';
import { pool } from '../../db/connection';
import { asyncHandler } from '../../shared/middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, name, slug FROM categories ORDER BY name'
  );
  res.json({ success: true, data: rows });
}));

export default router;
