'use client';

import { useState, useTransition } from 'react';

export interface OptimisticActionOptions<T> {
  onSuccess?: (result: any) => void;
  onError?: (error: any, rollbackState: T) => void;
}

export function useOptimisticAction<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [isPending, startTransition] = useTransition();

  const performAction = async (
    optimisticUpdate: (prev: T) => T,
    asyncFn: () => Promise<any>,
    options?: OptimisticActionOptions<T>
  ) => {
    const previousState = state;

    // Apply optimistic update immediately
    setState(optimisticUpdate(previousState));

    startTransition(async () => {
      try {
        const result = await asyncFn();
        options?.onSuccess?.(result);
      } catch (err) {
        // Rollback state on error
        setState(previousState);
        options?.onError?.(err, previousState);
      }
    });
  };

  return {
    state,
    setState,
    isPending,
    performAction,
  };
}
