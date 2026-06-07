import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/constants/routes';

interface ConfirmationStepProps {
  orderNumber: string;
  total:       string;
}

export function ConfirmationStep({ orderNumber, total }: ConfirmationStepProps) {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 size={40} className="text-success" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Order Placed!</h2>
        <p className="text-text-secondary mb-1">Your order has been confirmed.</p>
        <p className="text-accent font-semibold text-lg mb-1">#{orderNumber}</p>
        <p className="text-text-secondary text-sm mb-8">Estimated delivery: 5–7 business days</p>
        <div className="flex gap-3 justify-center">
          <Link to={ROUTES.HOME}><Button variant="secondary">Continue Shopping</Button></Link>
          <Link to={ROUTES.ACCOUNT}><Button variant="primary">View Order</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
