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

function SkeletonButton({ className = '' }: { className?: string }) {
  return <Skeleton variant="rectangle" rounded="full" className={cn('h-10 w-28', className)} />;
}

export function SkeletonCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={cn('skeleton-card space-y-4 p-5', compact && 'skeleton-card-compact')}>
      <div className="flex items-center justify-between"><Skeleton variant="circle" className="h-9 w-9" /><Skeleton className="h-3 w-16" /></div>
      {!compact && <Skeleton variant="rectangle" className="h-32 w-full" rounded="lg" />}
      <div className="space-y-3"><Skeleton className="h-6 w-4/5" /><Skeleton lines={2} /><div className="flex gap-2"><Skeleton className="h-3 w-14" rounded="full" /><Skeleton className="h-3 w-20" rounded="full" /></div></div>
    </div>
  );
}

function HomeSkeleton() {
  return <div className="portfolio-skeleton-page portfolio-skeleton-home">
    <div className="skeleton-nav"><Skeleton className="h-5 w-20" /><div className="hidden gap-4 md:flex"><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-16" /></div><SkeletonButton className="h-8 w-20" /></div>
    <div className="skeleton-hero"><div className="space-y-5"><Skeleton className="h-3 w-28" /><Skeleton className="h-20 w-full max-w-xl" rounded="lg" /><Skeleton lines={3} /><div className="flex gap-3"><SkeletonButton /><SkeletonButton className="w-24" /></div></div><Skeleton className="h-72 w-full" rounded="lg" /></div>
    <div className="skeleton-section-heading"><div className="space-y-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-64" /></div><Skeleton className="h-3 w-24" /></div>
    <div className="grid gap-4 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
    <div className="skeleton-about"><div className="space-y-4"><Skeleton className="h-3 w-16" /><Skeleton className="h-10 w-56" /><Skeleton lines={4} /></div><div className="space-y-3"><Skeleton className="h-3 w-32" /><Skeleton lines={5} /></div></div>
    <div className="skeleton-contact"><Skeleton className="h-3 w-20" /><Skeleton className="h-12 w-72" rounded="lg" /><SkeletonButton className="w-36" /></div>
  </div>;
}

export function SkeletonPage({ variant = 'page' }: { variant?: 'page' | 'home' | 'cards' }) {
  if (variant === 'home') return <HomeSkeleton />;
  return <div className="portfolio-skeleton-page portfolio-skeleton-inner"><div className="skeleton-nav"><Skeleton className="h-5 w-20" /><SkeletonButton className="h-8 w-20" /></div><div className="space-y-4"><Skeleton className="h-3 w-24" /><Skeleton className="h-16 w-3/4" rounded="lg" /><Skeleton lines={3} /></div><div className="grid gap-5 md:grid-cols-3">{Array.from({ length: variant === 'cards' ? 6 : 3 }).map((_, i) => <SkeletonCard key={i} compact={variant === 'cards'} />)}</div></div>;
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
