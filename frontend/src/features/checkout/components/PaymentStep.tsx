import { useForm } from 'react-hook-form';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { useCartStore } from '@/features/cart/store/cartStore';

interface PaymentStepProps {
  onNext:  () => void;
  onBack:  () => void;
  loading: boolean;
}

export function PaymentStep({ onNext, onBack, loading }: PaymentStepProps) {
  const { register, handleSubmit } = useForm();
  const items = useCartStore(s => s.items);
  const subtotal     = items.reduce((s, i) => s + Number(i.priceAtAdd) * i.quantity, 0);
  const shippingCost = subtotal >= 75 ? 0 : 9.99;
  const tax          = subtotal * 0.08;
  const total        = subtotal + shippingCost + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Payment Details</h2>
        <p className="text-xs text-text-muted bg-surface border border-border rounded-lg p-3">
          This is a demo store. No real payment is processed.
        </p>
        <Input label="Cardholder Name" placeholder="John Doe" {...register('name')} />
        <Input label="Card Number" placeholder="4242 4242 4242 4242" {...register('cardNumber')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Expiry (MM/YY)" placeholder="12/26" {...register('expiry')} />
          <Input label="CVV" placeholder="123" {...register('cvv')} />
        </div>
        <div className="flex gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>Place Order</Button>
        </div>
      </form>
      <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
        <h3 className="font-semibold text-text-primary mb-4">Order Summary</h3>
        <CartSummary subtotal={subtotal} shippingCost={shippingCost} tax={tax} total={total} />
      </div>
    </div>
  );
}
