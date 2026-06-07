import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import type { OrderDetail } from '@/shared/types';

interface OrderDetailCardProps { order: OrderDetail }

export function OrderDetailCard({ order }: OrderDetailCardProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {order.items.map(item => (
          <div key={item.id} className="flex gap-3 items-center">
            <img src={item.productImageUrl} alt={item.productName} className="w-12 h-12 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{item.productName}</p>
              <p className="text-xs text-text-secondary">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
            </div>
            <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 text-sm space-y-1">
        <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
        <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{Number(order.shippingCost) === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span></div>
        <div className="flex justify-between font-semibold text-text-primary pt-1 border-t border-border"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
      </div>
    </div>
  );
}
