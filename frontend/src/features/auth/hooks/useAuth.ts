import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';
import { toast } from '@/shared/components/ui/Toast';
import { ROUTES } from '@/constants/routes';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      navigate(ROUTES.HOME);
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      navigate(ROUTES.HOME);
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  return { user, token, isAuthenticated, loginMutation, signupMutation, logout };
}
