export interface StoreState<T = unknown> {
  data: T
  loading: boolean
  error: string | null
}

export interface AsyncStoreState<T = unknown> extends StoreState<T> {
  isRefetching: boolean
  isFetching: boolean
  lastFetched?: number
  retryCount: number
  isStale: boolean
  isCacheExpired: boolean
}

export interface StoreActions<T = unknown> {
  setState: (newState: Partial<T>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export interface AsyncStoreActions<T = unknown> extends StoreActions<T> {
  fetch: () => Promise<T>
  refetch: () => Promise<T>
  invalidate: () => void
  retry: () => Promise<T>
  mutate: (data: T | ((prev: T) => T)) => void
  cleanup: () => void
}

export interface Store<T = unknown> {
  getState: () => StoreState<T>
  subscribe: (listener: (state: StoreState<T>) => void) => () => void
  actions: StoreActions<T>
}

export interface AsyncStore<T = unknown> {
  getState: () => AsyncStoreState<T>
  subscribe: (listener: (state: AsyncStoreState<T>) => void) => () => void
  actions: AsyncStoreActions<T>
}

export type StoreListener<T = unknown> = (state: StoreState<T>) => void
export type AsyncStoreListener<T = unknown> = (state: AsyncStoreState<T>) => void

export interface CreateStoreOptions<T = unknown> {
  initialState?: T
  name?: string
  middleware?: Middleware<T>[]
}

export interface CreateAsyncStoreOptions<T = unknown> {
  fetcher: () => Promise<T>
  initialState?: T
  name?: string
  middleware?: Middleware<T>[]
  staleTime?: number
  cacheTime?: number
  retry?: number | ((failureCount: number, error: Error) => boolean)
  retryDelay?: number | ((retryAttempt: number) => number)
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface QueryOptions<T = unknown> {
  queryKey: (string | number)[]
  queryFn: () => Promise<T>
  staleTime?: number
  cacheTime?: number
  retry?: number | ((failureCount: number, error: Error) => boolean)
  retryDelay?: number | ((retryAttempt: number) => number)
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface MutationOptions<TData = unknown, TVariables = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate?: (variables: TVariables) => void
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
}

export interface Action {
  type: string
  payload?: unknown
}

export type Middleware<T = unknown> = (
  store: Store<T>
) => (next: (action: Action) => void) => (action: Action) => void
