'use client';

import { ReactNode, Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundaryWrapper';
import { ErrorPage } from '../ErrorPage';
import { Loading } from '../Loading';

interface PageLayoutProps {
  children: ReactNode;
  loadingVariant?: 'page' | 'card' | 'list' | 'hero' | 'profile';
  errorTitle?: string;
  errorMessage?: string;
}

export function PageLayout({
  children,
  loadingVariant = 'page',
  errorTitle = 'Something went wrong',
  errorMessage = "We're sorry, but an unexpected error has occurred. Please try again later.",
}: PageLayoutProps) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorPage
          title={errorTitle}
          message={errorMessage}
        />
      }
    >
      <Suspense fallback={<Loading variant={loadingVariant} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
