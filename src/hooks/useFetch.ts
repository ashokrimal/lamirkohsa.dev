import { useState, useEffect, useCallback } from 'react';
import { useLoadingState } from './useLoadingState';

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
) {
  const { data, error, isLoading, execute } = useLoadingState<T>();

  const fetchData = useCallback(async () => {
    try {
      await execute(fetchFn());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [execute, fetchFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData, JSON.stringify(deps)]); // Using JSON.stringify for stable dependency comparison

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch };
}
