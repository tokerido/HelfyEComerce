import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';

interface ProductFiltersProps {
  filters:   { category: string; sortBy: string };
  setFilter: (key: string, value: string | undefined) => void;
}

export function ProductFilters({ filters, setFilter }: ProductFiltersProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  productsApi.getCategories,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Categories</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="category" checked={!filters.category} onChange={() => setFilter('category', undefined)} className="accent-accent" />
            <span className="text-sm text-text-secondary">All</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" checked={filters.category === cat.slug} onChange={() => setFilter('category', cat.slug)} className="accent-accent" />
              <span className="text-sm text-text-secondary">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={e => setFilter('sortBy', e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name A-Z</option>
        </select>
      </div>
    </div>
  );
}
