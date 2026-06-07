import { Request, Response } from 'express';
import { productService } from './product.service';
import type { ProductFilters } from './product.types';

export const productController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const filters: ProductFilters = {
      search:   req.query.search   as string | undefined,
      category: req.query.category as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sortBy:   req.query.sortBy   as ProductFilters['sortBy'],
      page:     req.query.page     ? Number(req.query.page)  : 1,
      limit:    req.query.limit    ? Number(req.query.limit) : 20,
    };
    const { products, meta } = await productService.getAll(filters);
    res.json({ success: true, data: products, meta });
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const product = await productService.getBySlug(req.params.slug);
    res.json({ success: true, data: product });
  },
};
