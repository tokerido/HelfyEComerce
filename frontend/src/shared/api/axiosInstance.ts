import axios from 'axios';

export const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: false,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { token?: string } };
      const token = parsed?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch { /* ignore */ }
  return config;
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } };
    if (axiosError.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject({
      code:    axiosError.response?.data?.error?.code    ?? 'NETWORK_ERROR',
      message: axiosError.response?.data?.error?.message ?? 'Network error',
      status:  axiosError.response?.status ?? 0,
    });
  }
);
