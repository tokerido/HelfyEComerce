import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps { children: React.ReactNode }

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}
