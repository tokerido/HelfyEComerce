export interface Product {
  id:             number;
  name:           string;
  slug:           string;
  description:    string;
  price:          string;
  compareAtPrice: string | null;
  category:       { id: number; name: string; slug: string };
  stockQuantity:  number;
  imageUrl:       string;
  createdAt:      string;
}

export interface ProductImage {
  id:        number;
  url:       string;
  sortOrder: number;
}

export interface ProductDetail extends Product {
  images:          ProductImage[];
  relatedProducts: Product[];
}

export interface ProductFilters {
  search?:   string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?:   'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  page?:     number;
  limit?:    number;
}
