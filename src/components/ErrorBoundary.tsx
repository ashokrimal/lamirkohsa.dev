'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <ErrorState
      error={error}
      digest={error.digest}
      onRetry={reset}
      retryLabel="Reload the page"
    />
  );
}
