import { Response } from 'express';
import { userService } from './user.service';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticate';

export const userController = {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await userService.getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  },

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, data: result });
  },
};
