import { api } from '@/shared/api/axiosInstance';
import type { ApiResponse, User } from '@/shared/types';

interface AuthResult { token: string; user: User }
interface LoginPayload  { email: string; password: string }
interface SignupPayload { name: string; email: string; password: string }

export const authApi = {
  signup: (data: SignupPayload) =>
    api.post<ApiResponse<AuthResult>>('/auth/signup', data).then(r => r.data.data),
  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthResult>>('/auth/login', data).then(r => r.data.data),
  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then(r => r.data.data),
};
