import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/ProductGrid';
import { ProductFilters } from '../components/ProductFilters';
import { SearchBar } from '../components/SearchBar';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export function CatalogPage() {
  const { products, meta, isLoading, filters, setFilter } = useProducts();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <PageLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Shop All</h1>
          <p className="text-text-secondary">Discover our curated collection</p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={filters.search} onChange={v => setFilter('search', v || undefined)} total={meta?.total} />
          </div>
          <Button variant="secondary" className="md:hidden gap-2" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} /> Filters
          </Button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-56 flex-shrink-0">
            <ProductFilters filters={filters} setFilter={setFilter} />
          </aside>
          <div className="flex-1">
            <ProductGrid products={products} isLoading={isLoading} />
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilter('page', String(p))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === filters.page ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:bg-surfaceHover'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
          <ProductFilters filters={filters} setFilter={(k, v) => { setFilter(k, v); setFiltersOpen(false); }} />
        </Modal>
      </motion.div>
    </PageLayout>
  );
}
