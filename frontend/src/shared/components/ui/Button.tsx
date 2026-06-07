import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
    const variants = {
      primary:   'bg-accent hover:bg-accent-light text-white shadow-glow hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'border border-border hover:border-accent/50 text-text-primary bg-transparent hover:bg-accent/5',
      ghost:     'text-text-secondary hover:text-text-primary hover:bg-surfaceHover',
      danger:    'bg-error/10 hover:bg-error/20 text-error border border-error/30',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);
Button.displayName = 'Button';
