import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  errorMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, errorMessage, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-text-secondary text-sm block">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-surface border rounded-xl px-4 py-3 text-text-primary text-sm',
          'placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all duration-200',
          error
            ? 'border-error/60 focus:border-error focus:ring-error/20'
            : 'border-border focus:border-accent/60 focus:ring-accent/20',
          className
        )}
        {...props}
      />
      {errorMessage && <p className="text-error text-xs">{errorMessage}</p>}
    </div>
  )
);
Input.displayName = 'Input';
