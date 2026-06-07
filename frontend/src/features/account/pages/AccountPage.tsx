import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, User, Lock } from 'lucide-react';
import { useAccount } from '../hooks/useAccount';
import { OrderHistoryList } from '../components/OrderHistoryList';
import { ProfileForm } from '../components/ProfileForm';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { useAuthStore } from '@/features/auth/store/authStore';
import { cn } from '@/shared/utils/cn';

type Tab = 'orders' | 'profile' | 'security';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'orders',   label: 'Order History', icon: <Package size={16} /> },
  { id: 'profile',  label: 'Profile',       icon: <User size={16} /> },
  { id: 'security', label: 'Security',      icon: <Lock size={16} /> },
];

export function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const user = useAuthStore(s => s.user);
  const { profile, orders, isLoading, updateProfile, changePassword, isUpdating, isChangingPass } = useAccount();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-lg mb-3">
                {initials}
              </div>
              <p className="font-semibold text-text-primary">{user?.name}</p>
              <p className="text-text-secondary text-sm">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHover'
                  )}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 bg-surface border border-border rounded-2xl p-6">
            {activeTab === 'orders'  && <OrderHistoryList orders={orders} isLoading={isLoading} />}
            {activeTab === 'profile' && (
              <ProfileForm
                user={profile}
                onUpdateProfile={updateProfile}
                onChangePassword={changePassword}
                isUpdating={isUpdating}
                isChangingPass={isChangingPass}
                showPasswordSection={false}
              />
            )}
            {activeTab === 'security' && (
              <ProfileForm
                user={profile}
                onUpdateProfile={updateProfile}
                onChangePassword={changePassword}
                isUpdating={isUpdating}
                isChangingPass={isChangingPass}
                showPasswordSection={true}
                showProfileSection={false}
              />
            )}
          </main>
        </div>
      </motion.div>
    </PageLayout>
  );
}
