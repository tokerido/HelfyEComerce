import { api } from '@/shared/api/axiosInstance';
import type { ApiResponse, Cart } from '@/shared/types';

export const cartApi = {
  getCart: () =>
    api.get<ApiResponse<Cart>>('/cart').then(r => r.data.data),
  addItem: (data: { productId: number; quantity: number }) =>
    api.post<ApiResponse<Cart>>('/cart/items', data).then(r => r.data.data),
  updateItem: (itemId: number, quantity: number) =>
    api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }).then(r => r.data.data),
  removeItem: (itemId: number) =>
    api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`).then(r => r.data.data),
  syncCart: (items: { productId: number; quantity: number }[]) =>
    api.post<ApiResponse<Cart>>('/cart/sync', { items }).then(r => r.data.data),
};
