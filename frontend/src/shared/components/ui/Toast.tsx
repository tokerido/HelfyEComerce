import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/shared/utils/cn';

interface ToastItem {
  id:      string;
  type:    'success' | 'error' | 'info';
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  add:    (type: ToastItem['type'], message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => useToastStore.getState().remove(id), 4000);
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().add('success', msg),
  error:   (msg: string) => useToastStore.getState().add('error', msg),
  info:    (msg: string) => useToastStore.getState().add('info', msg),
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card min-w-[280px]',
              t.type === 'success' ? 'bg-success/10 border-success/30 text-success' :
              t.type === 'error'   ? 'bg-error/10 border-error/30 text-error' :
                                     'bg-accent/10 border-accent/30 text-accent'
            )}
          >
            {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)}><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
