import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';
import { productRepository } from './product.repository';
import type { ProductFilters } from './product.types';

export const productService = {
  async getAll(filters: ProductFilters) {
    const limit = Math.min(filters.limit ?? 20, 50);
    const page  = filters.page ?? 1;
    const { products, total } = await productRepository.findAll({ ...filters, limit, page });
    return {
      products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new AppError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND, 404);
    }
    return product;
  },
};
