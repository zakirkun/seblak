import { useEffect, useState } from 'react'
import type { AsyncStore, AsyncStoreState } from './types'

export function useAsyncSeblak<T = unknown>(
  store: AsyncStore<T>
): [AsyncStoreState<T>, AsyncStore<T>['actions']] {
  const [state, setState] = useState<AsyncStoreState<T>>(store.getState())
  
  useEffect(() => {
    const unsubscribe = store.subscribe(setState)
    return unsubscribe
  }, [store])
  
  return [state, store.actions]
}

export function useAsyncSeblakSelector<T = unknown, R = unknown>(
  store: AsyncStore<T>,
  selector: (state: AsyncStoreState<T>) => R
): R {
  const [state] = useAsyncSeblak(store)
  return selector(state)
}

export function useAsyncSeblakActions<T = unknown>(store: AsyncStore<T>): AsyncStore<T>['actions'] {
  return store.actions
}
