'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showRetry?: boolean;
  retryText?: string;
  onRetry?: () => void;
}

export function ErrorPage({
  statusCode = 500,
  title = 'Something went wrong',
  message = "We're sorry, but an unexpected error has occurred. Please try again later.",
  showRetry = true,
  retryText = 'Try again',
  onRetry,
}: ErrorPageProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          {statusCode && (
            <p className="text-sm font-medium text-gray-500">Error {statusCode}</p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          <p className="text-gray-600">{message}</p>
        </div>
        {showRetry && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="px-4"
            >
              Go back
            </Button>
            <Button onClick={handleRetry} className="px-4">
              {retryText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
