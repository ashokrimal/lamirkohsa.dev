'use client';

import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'card' | 'avatar';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  lines?: number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function Skeleton({
  variant = 'text',
  lines = 1,
  rounded = 'md',
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variants = {
    text: 'h-4',
    circle: 'rounded-full',
    rectangle: '',
    card: 'rounded-lg p-4 space-y-3',
    avatar: 'rounded-full h-10 w-10',
  };

  const radius = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2 w-full">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants[variant],
              radius[rounded],
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        variant !== 'circle' && variant !== 'avatar' && radius[rounded],
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Skeleton variant="rectangle" className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" lines={3} />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center p-2">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
