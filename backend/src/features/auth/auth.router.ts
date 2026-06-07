import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { authenticate } from '../../shared/middleware/authenticate';
import { authController } from './auth.controller';
import { LoginSchema, SignupSchema } from './auth.types';

const router = Router();

const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            20,
  message:        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders:  false,
});

router.post('/signup', authLimiter, validate(SignupSchema), asyncHandler(authController.signup));
router.post('/login',  authLimiter, validate(LoginSchema),  asyncHandler(authController.login));
router.get('/me',      authenticate, asyncHandler(authController.me));

export default router;
