import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/shared/types';

export interface LocalCartItem {
  product:    Product;
  quantity:   number;
  priceAtAdd: string;
}

interface CartState {
  items:          LocalCartItem[];
  isDrawerOpen:   boolean;
  addItem:        (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem:     (productId: number) => void;
  clearCart:      () => void;
  openDrawer:     () => void;
  closeDrawer:    () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items:        [],
      isDrawerOpen: false,
      addItem: (product, quantity) => set(s => {
        const existing = s.items.find(i => i.product.id === product.id);
        if (existing) {
          return { items: s.items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i) };
        }
        return { items: [...s.items, { product, quantity, priceAtAdd: product.price }] };
      }),
      updateQuantity: (productId, quantity) => set(s => ({
        items: quantity <= 0
          ? s.items.filter(i => i.product.id !== productId)
          : s.items.map(i => i.product.id === productId ? { ...i, quantity } : i),
      })),
      removeItem: (productId) => set(s => ({ items: s.items.filter(i => i.product.id !== productId) })),
      clearCart:  () => set({ items: [] }),
      openDrawer:  () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    { name: 'cart-storage', partialize: (s) => ({ items: s.items }) }
  )
);
