import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/shared/utils/cn';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems, openDrawer } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.HOME} className="text-xl font-bold text-text-primary tracking-tight">
            Helfy<span className="text-accent">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to={ROUTES.CATALOG} className="text-text-secondary hover:text-text-primary text-sm transition-colors">
              Shop
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openDrawer}
              className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to={ROUTES.ACCOUNT}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User size={16} />
                    {user?.name?.split(' ')[0]}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to={ROUTES.LOGIN}><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to={ROUTES.SIGNUP}><Button variant="primary" size="sm">Sign up</Button></Link>
              </div>
            )}

            <button className="md:hidden p-2 text-text-secondary" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3"
          >
            <Link to={ROUTES.CATALOG} className="block text-text-secondary hover:text-text-primary py-2" onClick={() => setMobileOpen(false)}>Shop</Link>
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.ACCOUNT} className="block text-text-secondary hover:text-text-primary py-2" onClick={() => setMobileOpen(false)}>Account</Link>
                <button onClick={handleLogout} className="block text-text-secondary hover:text-text-primary py-2 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="block text-text-secondary hover:text-text-primary py-2" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to={ROUTES.SIGNUP} className="block text-accent py-2" onClick={() => setMobileOpen(false)}>Sign up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
