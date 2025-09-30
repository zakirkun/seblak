export interface StoreState<T = unknown> {
  data: T
  loading: boolean
  error: string | null
}

export interface StoreActions<T = unknown> {
  setState: (newState: Partial<T>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export interface Store<T = unknown> {
  getState: () => StoreState<T>
  subscribe: (listener: (state: StoreState<T>) => void) => () => void
  actions: StoreActions<T>
}

export type StoreListener<T = unknown> = (state: StoreState<T>) => void

export interface CreateStoreOptions<T = unknown> {
  initialState?: T
  name?: string
  middleware?: Middleware<T>[]
}

export interface Action {
  type: string
  payload?: unknown
}

export type Middleware<T = unknown> = (
  store: Store<T>
) => (next: (action: Action) => void) => (action: Action) => void
