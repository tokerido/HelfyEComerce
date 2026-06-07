import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ROUTES } from '@/constants/routes';
import type { Product } from '@/shared/types';

interface ProductCardProps { product: Product }

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openDrawer } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    openDrawer();
  };

  return (
    <motion.div whileHover={{ y: -4 }} className="group relative bg-surface border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
      <Link to={ROUTES.PRODUCT(product.slug)}>
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
          <Badge className="absolute top-3 left-3">{product.category.name}</Badge>
          {product.stockQuantity === 0 && (
            <Badge variant="error" className="absolute top-3 right-3">Out of Stock</Badge>
          )}
        </div>
        <div className="p-4 pb-14">
          <h3 className="text-base font-semibold text-text-primary truncate">{product.name}</h3>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-accent">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-text-muted line-through">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute bottom-4 inset-x-4">
        <Button
          variant="primary"
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart size={14} className="mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
