import type { QueryOptions, MutationOptions, AsyncStore } from './types'
import { createAsyncStore } from './asyncStore'

export class QueryClient {
  private readonly queries = new Map<string, AsyncStore<unknown>>()
  private readonly mutations = new Map<string, unknown>()

  private getQueryKey(key: (string | number)[]): string {
    return JSON.stringify(key)
  }

  query<T = unknown>(options: QueryOptions<T>): AsyncStore<T> {
    const {
      queryKey,
      queryFn,
      enabled = true,
      ...storeOptions
    } = options

    const key = this.getQueryKey(queryKey)
    
    if (!this.queries.has(key)) {
      const store = createAsyncStore<T>({
        fetcher: queryFn,
        name: `Query-${key}`,
        ...storeOptions
      })
      
      this.queries.set(key, store as AsyncStore<unknown>)
    }
    
    const store = this.queries.get(key) as AsyncStore<T>
    
    // Auto-fetch if enabled
    if (enabled && !store.getState().lastFetched && !store.getState().isFetching) {
      store.actions.fetch().catch(() => {
        // Error already handled in store
      })
    }
    
    return store
  }

  mutation<TData = unknown, TVariables = unknown>(
    options: MutationOptions<TData, TVariables>
  ) {
    const {
      mutationFn,
      onMutate,
      onSuccess,
      onError,
      onSettled
    } = options

    let isLoading = false
    let error: Error | null = null
    let data: TData | undefined

    const mutate = async (variables: TVariables): Promise<TData> => {
      try {
        isLoading = true
        error = null
        
        onMutate?.(variables)
        
        const result = await mutationFn(variables)
        data = result
        
        onSuccess?.(result, variables)
        onSettled?.(result, null, variables)
        
        return result
      } catch (err) {
        error = err as Error
        onError?.(error, variables)
        onSettled?.(undefined, error, variables)
        throw error
      } finally {
        isLoading = false
      }
    }

    const reset = () => {
      isLoading = false
      error = null
      data = undefined
    }

    return {
      mutate,
      reset,
      isLoading: () => isLoading,
      error: () => error,
      data: () => data
    }
  }

  invalidateQueries(queryKey?: (string | number)[]): void {
    if (queryKey) {
      const key = this.getQueryKey(queryKey)
      const store = this.queries.get(key)
      if (store) {
        store.actions.invalidate()
      }
    } else {
      // Invalidate all queries
      this.queries.forEach(store => {
        store.actions.invalidate()
      })
    }
  }

  refetchQueries(queryKey?: (string | number)[]): Promise<unknown[]> {
    if (queryKey) {
      const key = this.getQueryKey(queryKey)
      const store = this.queries.get(key)
      if (store) {
        return Promise.all([store.actions.refetch()])
      }
      return Promise.resolve([])
    } else {
      // Refetch all queries
      const promises = Array.from(this.queries.values()).map(store => 
        store.actions.refetch().catch(() => null)
      )
      return Promise.all(promises)
    }
  }

  removeQueries(queryKey?: (string | number)[]): void {
    if (queryKey) {
      const key = this.getQueryKey(queryKey)
      this.queries.delete(key)
    } else {
      // Remove all queries
      this.queries.clear()
    }
  }

  getQueryData<T = unknown>(queryKey: (string | number)[]): T | undefined {
    const key = this.getQueryKey(queryKey)
    const store = this.queries.get(key) as AsyncStore<T> | undefined
    return store?.getState().data
  }

  setQueryData<T = unknown>(
    queryKey: (string | number)[],
    data: T | ((oldData?: T) => T)
  ): void {
    const key = this.getQueryKey(queryKey)
    const store = this.queries.get(key) as AsyncStore<T> | undefined
    
    if (store) {
      if (typeof data === 'function') {
        const currentData = store.getState().data
        const newData = (data as (oldData?: T) => T)(currentData)
        store.actions.mutate(newData)
      } else {
        store.actions.mutate(data)
      }
    }
  }

  clear(): void {
    this.queries.clear()
    this.mutations.clear()
  }
}

// Default query client instance
export const queryClient = new QueryClient()
