import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageLayoutProps { children: React.ReactNode }

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
