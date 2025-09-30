import { useEffect, useState } from 'react'
import type { Store, StoreState } from './types'

export function useSeblak<T = unknown>(store: Store<T>): [StoreState<T>, Store<T>['actions']] {
  const [state, setState] = useState<StoreState<T>>(store.getState())
  
  useEffect(() => {
    const unsubscribe = store.subscribe(setState)
    return unsubscribe
  }, [store])
  
  return [state, store.actions]
}

export function useSeblakSelector<T = unknown, R = unknown>(
  store: Store<T>,
  selector: (state: StoreState<T>) => R
): R {
  const [state] = useSeblak(store)
  return selector(state)
}

export function useSeblakActions<T = unknown>(store: Store<T>): Store<T>['actions'] {
  return store.actions
}
