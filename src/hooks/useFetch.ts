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

  const depsKey = JSON.stringify(deps);
  useEffect(() => {
    fetchData();
  }, [fetchData, depsKey]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch };
}
