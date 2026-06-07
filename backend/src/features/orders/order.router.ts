import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { orderController } from './order.controller';
import { CreateOrderSchema } from './order.types';

const router = Router();

router.use(authenticate);

router.post('/',    validate(CreateOrderSchema), asyncHandler(orderController.createOrder));
router.get('/',     asyncHandler(orderController.getOrders));
router.get('/:id',  asyncHandler(orderController.getOrderById));

export default router;
