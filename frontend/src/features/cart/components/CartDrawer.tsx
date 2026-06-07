import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CartItem } from './CartItem';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { ROUTES } from '@/constants/routes';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((s, i) => s + Number(i.priceAtAdd) * i.quantity, 0);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                <ShoppingCart size={18} /> Cart ({items.length})
              </h2>
              <button onClick={closeDrawer} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart size={48} className="text-text-muted mb-4" />
                  <p className="text-text-secondary">Your cart is empty</p>
                  <Link to={ROUTES.CATALOG} onClick={closeDrawer}>
                    <Button variant="secondary" size="sm" className="mt-4">Browse Products</Button>
                  </Link>
                </div>
              ) : (
                items.map(item => (
                  <CartItem
                    key={item.product.id}
                    item={{ id: item.product.id, product: item.product, quantity: item.quantity, priceAtAdd: item.priceAtAdd, lineTotal: (Number(item.priceAtAdd) * item.quantity).toFixed(2) }}
                    onUpdateQuantity={(_, qty) => updateQuantity(item.product.id, qty)}
                    onRemove={() => removeItem(item.product.id)}
                  />
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-semibold text-text-primary">{formatCurrency(subtotal)}</span>
                </div>
                <Link to={ROUTES.CART} onClick={closeDrawer}>
                  <Button variant="secondary" className="w-full">View Cart</Button>
                </Link>
                <Link to={ROUTES.CHECKOUT} onClick={closeDrawer}>
                  <Button variant="primary" className="w-full">Checkout</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
