import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi';

export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search:   searchParams.get('search')   ?? '',
    category: searchParams.get('category') ?? '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy:   searchParams.get('sortBy')   ?? 'newest',
    page:     Number(searchParams.get('page') ?? 1),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn:  () => productsApi.getAll(filters),
  });

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams(prev => {
      if (!value) prev.delete(key);
      else prev.set(key, value);
      prev.set('page', '1');
      return prev;
    });
  };

  return { products: data?.data ?? [], meta: data?.meta, isLoading, filters, setFilter };
}
