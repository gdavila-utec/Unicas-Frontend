import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
}: LoadingSpinnerProps = {}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
  };

  return (
    <div className='flex items-center justify-center'>
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-t-transparent',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role='status'
        aria-label='Loading'
      >
        <span className='sr-only'>Loading...</span>
      </div>
    </div>
  );
}
