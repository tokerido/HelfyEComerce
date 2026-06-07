import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import { Button } from '@/shared/components/ui/Button';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal     = items.reduce((s, i) => s + Number(i.priceAtAdd) * i.quantity, 0);
  const shippingCost = subtotal >= 75 ? 0 : 9.99;
  const tax          = subtotal * 0.08;
  const total        = subtotal + shippingCost + tax;
  const freeShippingRemaining = Math.max(0, 75 - subtotal);

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-text-primary mb-8">Your Cart</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart size={64} className="text-text-muted mb-6" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Your cart is empty</h2>
          <p className="text-text-secondary mb-6">Add some products to get started</p>
          <Link to={ROUTES.CATALOG}><Button variant="primary">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-2">
            {items.map(item => (
              <motion.div key={item.product.id} layout>
                <CartItem
                  item={{ id: item.product.id, product: item.product, quantity: item.quantity, priceAtAdd: item.priceAtAdd, lineTotal: (Number(item.priceAtAdd) * item.quantity).toFixed(2) }}
                  onUpdateQuantity={(_, qty) => updateQuantity(item.product.id, qty)}
                  onRemove={() => removeItem(item.product.id)}
                />
              </motion.div>
            ))}
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
            {freeShippingRemaining > 0 && (
              <div className="mb-4 p-3 bg-accent/10 rounded-xl text-sm text-accent">
                Add {formatCurrency(freeShippingRemaining)} more for free shipping!
              </div>
            )}
            <CartSummary subtotal={subtotal} shippingCost={shippingCost} tax={tax} total={total} />
            <Link to={ROUTES.CHECKOUT} className="block mt-4">
              <Button variant="primary" className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
