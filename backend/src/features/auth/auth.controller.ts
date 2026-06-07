import { Response } from 'express';
import { authService } from './auth.service';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticate';

export const authController = {
  async signup(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    res.status(201).json({ success: true, data: result });
  },

  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json({ success: true, data: user });
  },
};
