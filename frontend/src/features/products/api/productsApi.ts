import { api } from '@/shared/api/axiosInstance';
import type { ApiResponse, Product, ProductDetail, Category } from '@/shared/types';

interface ProductFilters {
  search?:   string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?:   string;
  page?:     number;
  limit?:    number;
}

export const productsApi = {
  getAll: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)); });
    return api.get<ApiResponse<Product[]>>(`/products?${params}`).then(r => r.data);
  },
  getBySlug: (slug: string) =>
    api.get<ApiResponse<ProductDetail>>(`/products/${slug}`).then(r => r.data.data),
  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/categories').then(r => r.data.data),
};
