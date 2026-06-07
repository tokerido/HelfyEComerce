export const ROUTES = {
  HOME:       '/',
  LOGIN:      '/login',
  SIGNUP:     '/signup',
  CATALOG:    '/products',
  PRODUCT:    (slug: string) => `/products/${slug}`,
  CART:       '/cart',
  CHECKOUT:   '/checkout',
  ACCOUNT:    '/account',
} as const;
