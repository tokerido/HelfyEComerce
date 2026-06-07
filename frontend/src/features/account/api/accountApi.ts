import { api } from '@/shared/api/axiosInstance';
import type { ApiResponse, User, OrderSummary, OrderDetail } from '@/shared/types';

export const accountApi = {
  getProfile: () =>
    api.get<ApiResponse<User>>('/users/me').then(r => r.data.data),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.patch<ApiResponse<User>>('/users/me', data).then(r => r.data.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<ApiResponse<{ message: string }>>('/users/me/password', data).then(r => r.data.data),
  getOrders: (page = 1) =>
    api.get<ApiResponse<OrderSummary[]>>(`/orders?page=${page}`).then(r => r.data),
  getOrderById: (id: number) =>
    api.get<ApiResponse<OrderDetail>>(`/orders/${id}`).then(r => r.data.data),
};
