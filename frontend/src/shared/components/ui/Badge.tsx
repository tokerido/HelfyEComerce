import { cn } from '@/shared/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface text-text-secondary border-border',
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    error:   'bg-error/15 text-error border-error/30',
    accent:  'bg-accent/15 text-accent border-accent/30',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
