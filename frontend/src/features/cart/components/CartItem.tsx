import { Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { cn } from '@/shared/utils/cn';

interface CartItemProps {
  item: {
    id:         number;
    product:    { id: number; name: string; slug: string; imageUrl: string };
    quantity:   number;
    priceAtAdd: string;
    lineTotal:  string;
  };
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove:         (id: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.product.name}</p>
        <p className="text-xs text-text-secondary mt-0.5">{formatCurrency(item.priceAtAdd)} each</p>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-md bg-surfaceHover flex items-center justify-center text-text-secondary hover:text-text-primary">
            <Minus size={12} />
          </button>
          <span className="text-sm text-text-primary w-6 text-center">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-surfaceHover flex items-center justify-center text-text-secondary hover:text-text-primary">
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.lineTotal)}</span>
        <button onClick={() => onRemove(item.id)} className="text-text-muted hover:text-error transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
