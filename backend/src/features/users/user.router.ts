import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { userController } from './user.controller';
import { UpdateProfileSchema, ChangePasswordSchema } from './user.types';

const router = Router();

router.use(authenticate);

router.get('/me',           asyncHandler(userController.getProfile));
router.patch('/me',         validate(UpdateProfileSchema),  asyncHandler(userController.updateProfile));
router.patch('/me/password', validate(ChangePasswordSchema), asyncHandler(userController.changePassword));

export default router;
