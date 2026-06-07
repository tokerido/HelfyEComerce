import { cn } from '@/shared/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(
      'bg-surface border border-border rounded-2xl shadow-card',
      hover && 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300',
      className
    )}>
      {children}
    </div>
  );
}
