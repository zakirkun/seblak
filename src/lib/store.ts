import type { Store, StoreState, StoreListener, CreateStoreOptions } from './types'

export function createStore<T = unknown>(options: CreateStoreOptions<T> = {}): Store<T> {
  const { initialState, name = 'SeblakStore' } = options
  
  let state: StoreState<T> = {
    data: initialState as T,
    loading: false,
    error: null
  }
  
  const listeners = new Set<StoreListener<T>>()
  
  const notifyListeners = () => {
    listeners.forEach(listener => listener(state))
  }
  
  const getState = (): StoreState<T> => state
  
  const subscribe = (listener: StoreListener<T>) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  
  const setState = (newState: Partial<T>) => {
    state = {
      ...state,
      data: { ...state.data, ...newState },
      error: null
    }
    notifyListeners()
  }
  
  const setLoading = (loading: boolean) => {
    state = { ...state, loading }
    notifyListeners()
  }
  
  const setError = (error: string | null) => {
    state = { ...state, error, loading: false }
    notifyListeners()
  }
  
  const reset = () => {
    state = {
      data: initialState as T,
      loading: false,
      error: null
    }
    notifyListeners()
  }
  
  const actions = {
    setState,
    setLoading,
    setError,
    reset
  }
  
  // Debug info in development
  if (process.env.NODE_ENV === 'development') {
    interface SeblakWindow extends Window {
      __SEBLAK_STORES__?: Record<string, { getState: () => StoreState<unknown>; actions: unknown }>
    }
    const seblakWindow = window as SeblakWindow
    seblakWindow.__SEBLAK_STORES__ = {
      ...seblakWindow.__SEBLAK_STORES__,
      [name]: { getState, actions }
    }
  }
  
  return {
    getState,
    subscribe,
    actions
  }
}
