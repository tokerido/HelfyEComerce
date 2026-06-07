import { Response } from 'express';
import { cartService } from './cart.service';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticate';

export const cartController = {
  async getCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    const cart = await cartService.getCart(req.user!.userId);
    res.json({ success: true, data: cart });
  },

  async addItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user!.userId, productId, quantity);
    res.json({ success: true, data: cart });
  },

  async updateItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.user!.userId, Number(req.params.itemId), quantity);
    res.json({ success: true, data: cart });
  },

  async removeItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const cart = await cartService.removeItem(req.user!.userId, Number(req.params.itemId));
    res.json({ success: true, data: cart });
  },

  async syncCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { items } = req.body;
    const cart = await cartService.syncCart(req.user!.userId, items);
    res.json({ success: true, data: cart });
  },
};
