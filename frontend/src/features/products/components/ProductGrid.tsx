import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import type { Product } from '@/shared/types';

const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface ProductGridProps { products: Product[]; isLoading?: boolean }

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-surfaceHover" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-surfaceHover rounded w-3/4" />
        <div className="h-3 bg-surfaceHover rounded w-full" />
        <div className="h-5 bg-surfaceHover rounded w-1/3" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-text-secondary text-lg">No products found</p>
        <p className="text-text-muted text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }
  return (
    <motion.div
      variants={containerVariants} initial="initial" animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map(p => (
        <motion.div key={p.id} variants={itemVariants}>
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
