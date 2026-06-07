import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { OrderDetailCard } from './OrderDetailCard';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { accountApi } from '../api/accountApi';
import { ROUTES } from '@/constants/routes';
import type { OrderSummary } from '@/shared/types';

const statusVariant: Record<string, 'warning' | 'accent' | 'default' | 'success' | 'error'> = {
  pending:    'warning',
  processing: 'accent',
  shipped:    'default',
  delivered:  'success',
  cancelled:  'error',
};

function OrderDetailExpanded({ orderId }: { orderId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => accountApi.getOrderById(orderId),
  });
  if (isLoading) return <div className="flex justify-center py-4"><Spinner size="sm" /></div>;
  if (!data) return null;
  return <div className="px-4 pb-4"><OrderDetailCard order={data} /></div>;
}

interface OrderHistoryListProps { orders: OrderSummary[]; isLoading?: boolean }

export function OrderHistoryList({ orders, isLoading }: OrderHistoryListProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (isLoading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-surface border border-border rounded-xl animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <Package size={48} className="text-text-muted mx-auto mb-4" />
      <p className="text-text-secondary">No orders yet</p>
      <Link to={ROUTES.CATALOG}><Button variant="secondary" size="sm" className="mt-4">Browse Products</Button></Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-text-primary text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-text-muted">{formatDate(order.createdAt)}</p>
              </div>
              <Badge variant={statusVariant[order.status] ?? 'default'}>{order.status}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-text-primary">{formatCurrency(order.total)}</p>
                <p className="text-xs text-text-muted">{order.itemCount} items</p>
              </div>
              <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-text-muted hover:text-text-primary transition-colors">
                <ChevronDown size={16} className={expanded === order.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
            </div>
          </div>
          {expanded === order.id && (
            <div className="border-t border-border">
              <OrderDetailExpanded orderId={order.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
