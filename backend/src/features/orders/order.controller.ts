import { Response } from 'express';
import { orderService } from './order.service';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticate';

export const orderController = {
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await orderService.createOrder(req.user!.userId, req.body.shippingAddress);
    res.status(201).json({ success: true, data: result });
  },

  async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page  = Number(req.query.page  ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const { orders, meta } = await orderService.getOrders(req.user!.userId, page, limit);
    res.json({ success: true, data: orders, meta });
  },

  async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const order = await orderService.getOrderById(Number(req.params.id), req.user!.userId);
    res.json({ success: true, data: order });
  },
};
