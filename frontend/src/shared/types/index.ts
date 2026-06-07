export interface User {
  id:        number;
  name:      string;
  email:     string;
  createdAt: string;
}

export interface Category {
  id:   number;
  name: string;
  slug: string;
}

export interface Product {
  id:             number;
  name:           string;
  slug:           string;
  description:    string;
  price:          string;
  compareAtPrice: string | null;
  category:       Category;
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

export interface CartItem {
  id:         number;
  product:    { id: number; name: string; slug: string; imageUrl: string };
  quantity:   number;
  priceAtAdd: string;
  lineTotal:  string;
}

export interface Cart {
  id:           number;
  items:        CartItem[];
  subtotal:     string;
  shippingCost: string;
  tax:          string;
  total:        string;
}

export interface OrderSummary {
  id:          number;
  orderNumber: string;
  status:      string;
  total:       string;
  itemCount:   number;
  createdAt:   string;
}

export interface OrderDetail {
  id:              number;
  orderNumber:     string;
  status:          string;
  items:           OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal:        string;
  shippingCost:    string;
  tax:             string;
  total:           string;
  createdAt:       string;
}

export interface OrderItem {
  id:              number;
  productId:       number | null;
  productName:     string;
  productImageUrl: string;
  quantity:        number;
  unitPrice:       string;
  lineTotal:       string;
}

export interface ShippingAddress {
  firstName:    string;
  lastName:     string;
  addressLine1: string;
  addressLine2?: string;
  city:         string;
  state:        string;
  zipCode:      string;
  country:      string;
  phone?:       string;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data:    T;
  meta?:   PaginationMeta;
}
