import { formatCurrency } from '@/shared/utils/formatCurrency';

interface CartSummaryProps {
  subtotal:     string | number;
  shippingCost: string | number;
  tax:          string | number;
  total:        string | number;
}

export function CartSummary({ subtotal, shippingCost, tax, total }: CartSummaryProps) {
  const shipping = Number(shippingCost);
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Subtotal</span>
        <span className="text-text-primary">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Shipping</span>
        <span className={shipping === 0 ? 'text-success font-medium' : 'text-text-primary'}>
          {shipping === 0 ? 'Free' : formatCurrency(shippingCost)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Tax (8%)</span>
        <span className="text-text-primary">{formatCurrency(tax)}</span>
      </div>
      <div className="border-t border-border pt-3 flex justify-between">
        <span className="font-semibold text-text-primary">Total</span>
        <span className="font-bold text-lg text-accent">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
