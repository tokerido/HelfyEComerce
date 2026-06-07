import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { productController } from './product.controller';

const router = Router();

router.get('/',      asyncHandler(productController.getAll));
router.get('/:slug', asyncHandler(productController.getBySlug));

export default router;
