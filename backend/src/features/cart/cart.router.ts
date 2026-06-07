import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { cartController } from './cart.controller';
import { AddItemSchema, UpdateItemSchema, SyncCartSchema } from './cart.types';

const router = Router();

router.use(authenticate);

router.get('/',              asyncHandler(cartController.getCart));
router.post('/items',        validate(AddItemSchema),    asyncHandler(cartController.addItem));
router.patch('/items/:itemId', validate(UpdateItemSchema), asyncHandler(cartController.updateItem));
router.delete('/items/:itemId', asyncHandler(cartController.removeItem));
router.post('/sync',         validate(SyncCartSchema),   asyncHandler(cartController.syncCart));

export default router;
