import { Skeleton, SkeletonCard, SkeletonList } from './Skeleton';

type LoadingVariant = 'page' | 'card' | 'list' | 'hero' | 'profile';

interface LoadingProps {
  variant?: LoadingVariant;
  className?: string;
}

export function Loading({ variant = 'page', className = '' }: LoadingProps) {
  const renderContent = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <SkeletonList count={5} />
          </div>
        );
      
      case 'hero':
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-3xl">
              <Skeleton variant="text" className="h-12 w-3/4 mx-auto" />
              <Skeleton variant="text" lines={3} className="max-w-2xl mx-auto" />
              <div className="flex gap-4 justify-center">
                <Skeleton variant="rectangle" className="h-12 w-32" />
                <Skeleton variant="rectangle" className="h-12 w-32" />
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <Skeleton variant="avatar" className="h-32 w-32" />
              <div className="flex-1 w-full space-y-4">
                <Skeleton variant="text" className="h-8 w-1/2" />
                <Skeleton variant="text" className="h-4 w-1/3" />
                <Skeleton variant="text" lines={4} />
              </div>
            </div>
          </div>
        );
      
      default: // 'page'
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16">
                <Skeleton variant="circle" className="w-full h-full" />
              </div>
              <Skeleton variant="text" className="h-8 w-64 mx-auto" />
              <Skeleton variant="text" className="h-4 w-48 mx-auto" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
