import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { queryClient } from './app/queryClient';
import { useAuthStore } from './features/auth/store/authStore';
import { authApi } from './features/auth/api/authApi';
import { CartDrawer } from './features/cart/components/CartDrawer';
import { ToastContainer } from './shared/components/ui/Toast';
import { ProtectedRoute } from './shared/components/guards/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { CatalogPage } from './features/products/pages/CatalogPage';
import { ProductDetailPage } from './features/products/pages/ProductDetailPage';
import { CartPage } from './features/cart/pages/CartPage';
import { CheckoutPage } from './features/checkout/pages/CheckoutPage';
import { AccountPage } from './features/account/pages/AccountPage';
import { ROUTES } from './constants/routes';

function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-text-primary mb-4">Helfy<span className="text-accent">.</span></h1>
      <p className="text-text-secondary text-xl mb-8">Premium products, curated for the discerning.</p>
      <a href={ROUTES.CATALOG} className="px-8 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors shadow-glow">
        Shop Now
      </a>
    </div>
  );
}

function AppContent() {
  const { token, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      authApi.me().catch(() => logout());
    }
  }, []);

  return (
    <>
      <CartDrawer />
      <ToastContainer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path={ROUTES.HOME}     element={<HomePage />} />
          <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP}   element={<SignupPage />} />
          <Route path={ROUTES.CATALOG}  element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path={ROUTES.CART}     element={<CartPage />} />
          <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path={ROUTES.ACCOUNT}  element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
