import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/shared/api/axiosInstance';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { ShippingStep } from '../components/ShippingStep';
import { PaymentStep } from '../components/PaymentStep';
import { ConfirmationStep } from '../components/ConfirmationStep';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { useCartStore } from '@/features/cart/store/cartStore';
import { toast } from '@/shared/components/ui/Toast';
import type { ShippingAddress, ApiResponse } from '@/shared/types';

interface OrderResult { orderId: number; orderNumber: string; total: string }

export function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const clearCart = useCartStore(s => s.clearCart);

  const orderMutation = useMutation({
    mutationFn: (addr: ShippingAddress) =>
      api.post<ApiResponse<OrderResult>>('/orders', { shippingAddress: addr }).then(r => r.data.data),
    onSuccess: (data) => {
      setOrderResult(data);
      clearCart();
      setStep(2);
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <CheckoutStepper currentStep={step} />
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <ShippingStep onNext={(addr) => { setShippingAddress(addr); setStep(1); }} />
          )}
          {step === 1 && shippingAddress && (
            <PaymentStep
              onNext={() => orderMutation.mutate(shippingAddress)}
              onBack={() => setStep(0)}
              loading={orderMutation.isPending}
            />
          )}
          {step === 2 && orderResult && (
            <ConfirmationStep orderNumber={orderResult.orderNumber} total={orderResult.total} />
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}
