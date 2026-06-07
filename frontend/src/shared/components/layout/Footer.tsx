import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Helfy<span className="text-accent">.</span>
            </h3>
            <p className="text-text-secondary text-sm">Premium products, curated for the discerning.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to={ROUTES.CATALOG} className="hover:text-text-primary transition-colors">Shop</Link></li>
              <li><Link to={ROUTES.ACCOUNT} className="hover:text-text-primary transition-colors">Account</Link></li>
              <li><Link to={ROUTES.CART} className="hover:text-text-primary transition-colors">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Newsletter</h4>
            <p className="text-text-secondary text-sm mb-3">Get the latest drops and exclusive offers.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/60"
              />
              <button className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm rounded-lg transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-text-muted text-xs">
          © {new Date().getFullYear()} Helfy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
