import type { 
  AsyncStore, 
  AsyncStoreState, 
  AsyncStoreListener, 
  CreateAsyncStoreOptions 
} from './types'

export function createAsyncStore<T = unknown>(
  options: CreateAsyncStoreOptions<T>
): AsyncStore<T> {
  const {
    fetcher,
    initialState,
    name = 'SeblakAsyncStore',
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry: retryOption = 3,
    retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    onSuccess,
    onError
  } = options

  let state: AsyncStoreState<T> = {
    data: initialState as T,
    loading: false,
    error: null,
    isRefetching: false,
    isFetching: false,
    lastFetched: undefined,
    retryCount: 0
  }

  const listeners = new Set<AsyncStoreListener<T>>()
  let abortController: AbortController | null = null

  const notifyListeners = () => {
    listeners.forEach(listener => listener(state))
  }

  const getState = (): AsyncStoreState<T> => state

  const subscribe = (listener: AsyncStoreListener<T>) => {
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
    state = { ...state, error, loading: false, isFetching: false, isRefetching: false }
    notifyListeners()
  }

  const reset = () => {
    state = {
      data: initialState as T,
      loading: false,
      error: null,
      isRefetching: false,
      isFetching: false,
      lastFetched: undefined,
      retryCount: 0
    }
    notifyListeners()
  }

  const shouldRetry = (failureCount: number, error: Error): boolean => {
    if (typeof retryOption === 'number') {
      return failureCount < retryOption
    }
    return retryOption(failureCount, error)
  }

  const getRetryDelay = (attempt: number): number => {
    if (typeof retryDelay === 'number') {
      return retryDelay
    }
    return retryDelay(attempt)
  }

  const executeFetch = async (isRefetch = false): Promise<T> => {
    // Cancel previous request
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    state = {
      ...state,
      loading: !isRefetch,
      isFetching: true,
      isRefetching: isRefetch,
      error: null
    }
    notifyListeners()

    try {
      const data = await fetcher()
      
      state = {
        ...state,
        data,
        loading: false,
        isFetching: false,
        isRefetching: false,
        error: null,
        lastFetched: Date.now(),
        retryCount: 0
      }
      notifyListeners()
      
      onSuccess?.(data)
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      
      if (shouldRetry(state.retryCount, error as Error)) {
        const delay = getRetryDelay(state.retryCount)
        state = { ...state, retryCount: state.retryCount + 1 }
        
        setTimeout(() => {
          executeFetch(isRefetch)
        }, delay)
        
        return Promise.reject(error)
      }

      state = {
        ...state,
        loading: false,
        isFetching: false,
        isRefetching: false,
        error: errorMessage,
        retryCount: 0
      }
      notifyListeners()
      
      onError?.(error as Error)
      throw error
    }
  }

  const fetch = (): Promise<T> => {
    return executeFetch(false)
  }

  const refetch = (): Promise<T> => {
    return executeFetch(true)
  }

  const invalidate = () => {
    state = { ...state, lastFetched: undefined }
    notifyListeners()
  }

  const retryAction = (): Promise<T> => {
    state = { ...state, retryCount: 0 }
    return executeFetch(state.data !== undefined)
  }

  const mutate = (data: T | ((prev: T) => T)) => {
    const newData = typeof data === 'function' ? (data as (prev: T) => T)(state.data) : data
    state = { ...state, data: newData }
    notifyListeners()
  }

  const isStale = (): boolean => {
    if (!state.lastFetched) return true
    return Date.now() - state.lastFetched > staleTime
  }

  // Auto-fetch on creation if no initial data
  if (initialState === undefined) {
    fetch().catch(() => {
      // Error already handled in executeFetch
    })
  }

  // Setup window focus refetch
  if (refetchOnWindowFocus && typeof window !== 'undefined') {
    const handleFocus = () => {
      if (isStale() && !state.isFetching) {
        refetch().catch(() => {
          // Error already handled in executeFetch
        })
      }
    }
    window.addEventListener('focus', handleFocus)
  }

  // Setup online/offline refetch
  if (refetchOnReconnect && typeof window !== 'undefined') {
    const handleOnline = () => {
      if (isStale() && !state.isFetching) {
        refetch().catch(() => {
          // Error already handled in executeFetch
        })
      }
    }
    window.addEventListener('online', handleOnline)
  }

  const actions = {
    setState,
    setLoading,
    setError,
    reset,
    fetch,
    refetch,
    invalidate,
    retry: retryAction,
    mutate
  }

  // Debug info in development
  if (typeof window !== 'undefined') {
    interface SeblakWindow extends Window {
      __SEBLAK_ASYNC_STORES__?: Record<string, { getState: () => AsyncStoreState<unknown>; actions: unknown }>
    }
    const seblakWindow = window as SeblakWindow
    seblakWindow.__SEBLAK_ASYNC_STORES__ = {
      ...seblakWindow.__SEBLAK_ASYNC_STORES__,
      [name]: { getState, actions }
    }
  }

  return {
    getState,
    subscribe,
    actions
  }
}
