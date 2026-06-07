import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '../store/cartStore';
import { cartApi } from '../api/cartApi';
import type { Product } from '@/shared/types';

export function useCart() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const localCart = useCartStore();
  const queryClient = useQueryClient();

  const serverCartQuery = useQuery({
    queryKey: ['cart'],
    queryFn:  cartApi.getCart,
    enabled:  isAuthenticated,
  });

  const addItemMutation = useMutation({
    mutationFn: isAuthenticated
      ? (data: { product: Product; quantity: number }) => cartApi.addItem({ productId: data.product.id, quantity: data.quantity })
      : (data: { product: Product; quantity: number }) => { localCart.addItem(data.product, data.quantity); return Promise.resolve(null); },
    onSuccess: () => { if (isAuthenticated) queryClient.invalidateQueries({ queryKey: ['cart'] }); },
  });

  const cart = isAuthenticated ? serverCartQuery.data : null;
  const items = isAuthenticated
    ? (cart?.items ?? [])
    : localCart.items.map(i => ({
        id:         i.product.id,
        product:    { id: i.product.id, name: i.product.name, slug: i.product.slug, imageUrl: i.product.imageUrl },
        quantity:   i.quantity,
        priceAtAdd: i.priceAtAdd,
        lineTotal:  (Number(i.priceAtAdd) * i.quantity).toFixed(2),
      }));

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return {
    cart,
    items,
    itemCount,
    isLoading: isAuthenticated ? serverCartQuery.isLoading : false,
    addItem:   (product: Product, quantity = 1) => addItemMutation.mutate({ product, quantity }),
    openDrawer: localCart.openDrawer,
  };
}
