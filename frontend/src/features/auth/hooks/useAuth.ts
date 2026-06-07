import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { cartApi } from '@/features/cart/api/cartApi';
import { authApi } from '../api/authApi';
import { toast } from '@/shared/components/ui/Toast';
import { ROUTES } from '@/constants/routes';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const { items: localCartItems, clearCart } = useCartStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const syncAndLogin = async (result: { token: string; user: typeof user }) => {
    setAuth(result.user!, result.token);
    if (localCartItems.length > 0) {
      try {
        await cartApi.syncCart(localCartItems.map(i => ({ productId: i.product.id, quantity: i.quantity })));
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } catch { /* sync is best-effort */ }
    }
    navigate(ROUTES.HOME);
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: syncAndLogin,
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: syncAndLogin,
    onError: (err: { message: string }) => toast.error(err.message),
  });

  return { user, token, isAuthenticated, loginMutation, signupMutation, logout };
}
