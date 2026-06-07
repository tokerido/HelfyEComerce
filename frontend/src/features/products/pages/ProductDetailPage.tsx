import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Package } from 'lucide-react';
import { productsApi } from '../api/productsApi';
import { ProductCard } from '../components/ProductCard';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Spinner } from '@/shared/components/ui/Spinner';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ROUTES } from '@/constants/routes';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, openDrawer } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn:  () => productsApi.getBySlug(slug!),
    enabled:  !!slug,
  });

  if (isLoading) return <PageLayout><div className="flex justify-center py-24"><Spinner size="lg" /></div></PageLayout>;
  if (!product)  return <PageLayout><div className="text-center py-24 text-text-secondary">Product not found</div></PageLayout>;

  const stockStatus = product.stockQuantity === 0 ? 'out' : product.stockQuantity < 5 ? 'low' : 'in';
  const images = product.images?.length ? product.images : [{ id: 0, url: product.imageUrl, sortOrder: 0 }];

  const handleAddToCart = () => {
    addItem(product, quantity);
    openDrawer();
  };

  return (
    <PageLayout>
      <Link to={ROUTES.CATALOG} className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <motion.div key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[4/5] rounded-2xl overflow-hidden mb-3">
            <img src={images[selectedImage]?.url ?? product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedImage ? 'border-accent' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-text-secondary text-sm mb-1">{product.category.name}</p>
            <h1 className="text-3xl font-bold text-text-primary">{product.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-accent">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && <span className="text-lg text-text-muted line-through">{formatCurrency(product.compareAtPrice)}</span>}
          </div>
          <Badge variant={stockStatus === 'out' ? 'error' : stockStatus === 'low' ? 'warning' : 'success'}>
            <Package size={12} className="mr-1" />
            {stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? `Only ${product.stockQuantity} left` : 'In Stock'}
          </Badge>
          <p className="text-text-secondary text-sm leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surfaceHover transition-colors">−</button>
              <span className="px-4 py-2 text-text-primary font-medium">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surfaceHover transition-colors">+</button>
            </div>
            <Button variant="primary" className="flex-1 gap-2" onClick={handleAddToCart} disabled={stockStatus === 'out'}>
              <ShoppingCart size={16} /> Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {product.relatedProducts?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
