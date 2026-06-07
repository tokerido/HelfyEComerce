import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface CheckoutStepperProps { currentStep: number }

const steps = ['Shipping', 'Payment', 'Confirmation'];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
              i < currentStep  ? 'bg-accent border-accent text-white' :
              i === currentStep ? 'border-accent text-accent bg-accent/10' :
                                  'border-border text-text-muted'
            )}>
              {i < currentStep ? <Check size={16} /> : i + 1}
            </div>
            <span className={cn('text-xs mt-1', i === currentStep ? 'text-accent' : 'text-text-muted')}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('w-16 h-0.5 mx-2 mb-4', i < currentStep ? 'bg-accent' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  );
}
