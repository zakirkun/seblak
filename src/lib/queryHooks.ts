import { useState } from 'react'
import type { QueryOptions, MutationOptions } from './types'
import { queryClient } from './queryClient'
import { useAsyncSeblak } from './asyncHooks'

export function useQuery<T = unknown>(options: QueryOptions<T>) {
  const store = queryClient.query(options)
  const [state, actions] = useAsyncSeblak(store)
  
  return {
    data: state.data,
    isLoading: state.loading,
    isFetching: state.isFetching,
    isRefetching: state.isRefetching,
    error: state.error,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== undefined,
    lastFetched: state.lastFetched,
    refetch: actions.refetch,
    remove: () => queryClient.removeQueries(options.queryKey)
  }
}

export function useMutation<TData = unknown, TVariables = unknown>(
  options: MutationOptions<TData, TVariables>
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TData | undefined>()

  const mutation = queryClient.mutation<TData, TVariables>({
    ...options,
    onMutate: (variables) => {
      setIsLoading(true)
      setError(null)
      options.onMutate?.(variables)
    },
    onSuccess: (data, variables) => {
      setIsLoading(false)
      setData(data)
      options.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      setIsLoading(false)
      setError(error)
      options.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      setIsLoading(false)
      options.onSettled?.(data, error, variables)
    }
  })

  const reset = () => {
    setIsLoading(false)
    setError(null)
    setData(undefined)
    mutation.reset()
  }

  return {
    mutate: mutation.mutate,
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !isLoading && !error && data !== undefined,
    reset
  }
}

export function useInfiniteQuery<T = unknown>(
  options: QueryOptions<T[]> & {
    getNextPageParam?: (lastPage: T[], allPages: T[][]) => unknown
    getPreviousPageParam?: (firstPage: T[], allPages: T[][]) => unknown
  }
) {
  const [pages, setPages] = useState<T[][]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [isFetchingPreviousPage, setIsFetchingPreviousPage] = useState(false)

  const baseQuery = useQuery({
    ...options,
    queryFn: async () => {
      const data = await options.queryFn()
      setPages([data])
      
      // Check if there's a next page
      if (options.getNextPageParam) {
        const nextParam = options.getNextPageParam(data, [data])
        setHasNextPage(nextParam !== undefined && nextParam !== null)
      }
      
      return data
    }
  })

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return

    setIsFetchingNextPage(true)
    try {
      const lastPage = pages[pages.length - 1]
      if (lastPage && options.getNextPageParam) {
        const nextParam = options.getNextPageParam(lastPage, pages)
        if (nextParam !== undefined && nextParam !== null) {
          const nextData = await options.queryFn()
          setPages(prev => [...prev, nextData])
          
          const newNextParam = options.getNextPageParam(nextData, [...pages, nextData])
          setHasNextPage(newNextParam !== undefined && newNextParam !== null)
        }
      }
    } finally {
      setIsFetchingNextPage(false)
    }
  }

  const fetchPreviousPage = async () => {
    if (!hasPreviousPage || isFetchingPreviousPage) return

    setIsFetchingPreviousPage(true)
    try {
      const firstPage = pages[0]
      if (firstPage && options.getPreviousPageParam) {
        const prevParam = options.getPreviousPageParam(firstPage, pages)
        if (prevParam !== undefined && prevParam !== null) {
          const prevData = await options.queryFn()
          setPages(prev => [prevData, ...prev])
          
          const newPrevParam = options.getPreviousPageParam(prevData, [prevData, ...pages])
          setHasPreviousPage(newPrevParam !== undefined && newPrevParam !== null)
        }
      }
    } finally {
      setIsFetchingPreviousPage(false)
    }
  }

  return {
    ...baseQuery,
    data: {
      pages,
      pageParams: pages.map((_, index) => index)
    },
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage
  }
}

// Utility hooks
export function useQueryClient() {
  return queryClient
}

export function useInvalidateQueries() {
  return (queryKey?: (string | number)[]) => {
    queryClient.invalidateQueries(queryKey)
  }
}

export function useRefetchQueries() {
  return (queryKey?: (string | number)[]) => {
    return queryClient.refetchQueries(queryKey)
  }
}
