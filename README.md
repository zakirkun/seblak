# 🍲 Seblak

A lightweight, TypeScript-first React state management library that's as spicy and flavorful as the Indonesian dish it's named after!

## Features

- 🚀 **Lightweight**: Minimal bundle size (~10KB)
- 🔷 **TypeScript First**: Built with TypeScript for excellent type safety
- 🎣 **React Hooks**: Simple and intuitive React hooks API
- 🔄 **Reactive**: Automatic re-renders when state changes
- 🛠 **Developer Tools**: Debug support in development mode
- 📦 **Zero Dependencies**: No external runtime dependencies
- ⚡ **Async State Management**: Powerful async store with built-in data fetching
- 🔄 **Server State**: Query and mutation hooks with caching and auto-refetching
- 🔁 **Smart Retries**: Configurable retry mechanisms with exponential backoff
- 🎯 **Cache Management**: Intelligent caching with stale-while-revalidate
- 🌐 **Network Aware**: Auto-refetch on window focus and network reconnection

## Installation

```bash
npm install @zakirkun/seblak
# or
yarn add @zakirkun/seblak
# or
pnpm add @zakirkun/seblak
```

## Quick Start

### Basic Store

```tsx
import { createStore, useSeblak } from '@zakirkun/seblak'

// Define your state shape
interface CounterState {
  count: number
  name: string
}

// Create a store
const counterStore = createStore<CounterState>({
  initialState: { count: 0, name: 'My Counter' },
  name: 'counter' // optional, for debugging
})

// Use in your React component
function Counter() {
  const [state, actions] = useSeblak(counterStore)
  
  const increment = () => {
    actions.setState({ count: state.data.count + 1 })
  }
  
  return (
    <div>
      <h2>{state.data.name}</h2>
      <p>Count: {state.data.count}</p>
      <button onClick={increment}>+</button>
      <button onClick={() => actions.reset()}>Reset</button>
    </div>
  )
}
```

### Async Store

```tsx
import { createAsyncStore, useAsyncSeblak } from '@zakirkun/seblak'

// Create async store for API data
const userStore = createAsyncStore({
  fetcher: () => fetch('/api/user').then(res => res.json()),
  name: 'user',
  staleTime: 60000, // 1 minute
  retry: 3
})

function UserProfile() {
  const [state, actions] = useAsyncSeblak(userStore)
  
  return (
    <div>
      {state.loading && <div>Loading...</div>}
      {state.error && <div>Error: {state.error}</div>}
      {state.data && (
        <div>
          <h2>{state.data.name}</h2>
          <p>{state.data.email}</p>
          <button onClick={() => actions.refetch()}>
            {state.isRefetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}
    </div>
  )
}
```

### Query Hooks (React Query-like)

```tsx
import { useQuery, useMutation } from '@zakirkun/seblak'

function UserList() {
  // Fetch data with useQuery
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    staleTime: 30000 // 30 seconds
  })

  // Mutations for data updates
  const { mutate: createUser, isLoading: isCreating } = useMutation({
    mutationFn: (userData) => 
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      }).then(res => res.json()),
    onSuccess: () => {
      refetch() // Refetch users after creating
    }
  })

  const handleCreateUser = () => {
    createUser({ name: 'New User', email: 'user@example.com' })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <button onClick={handleCreateUser} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create User'}
      </button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## API Reference

### Core Store

#### `createStore(options)`

Creates a new store instance.

```tsx
const store = createStore<StateType>({
  initialState: { /* your initial state */ },
  name: 'optional-store-name' // for debugging
})
```

#### `useSeblak(store)`

Primary hook for accessing store state and actions.

```tsx
const [state, actions] = useSeblak(store)

// state.data - your actual state
// state.loading - loading indicator
// state.error - error message

// actions.setState(partialState) - update state
// actions.setLoading(boolean) - set loading state
// actions.setError(string | null) - set error state
// actions.reset() - reset to initial state
```

### Async Store

#### `createAsyncStore(options)`

Creates an async store with built-in data fetching.

```tsx
const store = createAsyncStore<DataType>({
  fetcher: () => Promise<DataType>, // Required: async function
  initialState?: DataType,          // Optional: initial data
  name?: string,                    // Optional: for debugging
  staleTime?: number,               // Optional: staleness timeout (default: 5min)
  cacheTime?: number,               // Optional: cache timeout (default: 10min)
  retry?: number | function,        // Optional: retry attempts (default: 3)
  retryDelay?: number | function,   // Optional: retry delay (default: exponential)
  refetchOnWindowFocus?: boolean,   // Optional: auto-refetch (default: true)
  refetchOnReconnect?: boolean,     // Optional: auto-refetch (default: true)
  onSuccess?: (data) => void,       // Optional: success callback
  onError?: (error) => void         // Optional: error callback
})
```

#### `useAsyncSeblak(store)`

Hook for async store with additional async state.

```tsx
const [state, actions] = useAsyncSeblak(store)

// Additional async state properties:
// state.isFetching - currently fetching
// state.isRefetching - currently refetching
// state.lastFetched - timestamp of last fetch
// state.retryCount - current retry attempt

// Additional async actions:
// actions.fetch() - manual fetch
// actions.refetch() - force refetch
// actions.invalidate() - invalidate cache
// actions.retry() - retry failed request
// actions.mutate(data) - optimistic update
```

### Query Hooks

#### `useQuery(options)`

React Query-like hook for data fetching.

```tsx
const {
  data,                    // Fetched data
  isLoading,              // Initial loading state
  isFetching,             // Any fetching state
  isRefetching,           // Background refetching
  error,                  // Error message
  isError,                // Boolean error state
  isSuccess,              // Boolean success state
  lastFetched,            // Timestamp
  refetch,                // Refetch function
  remove                  // Remove from cache
} = useQuery({
  queryKey: ['users', userId],        // Unique key
  queryFn: () => fetchUser(userId),   // Fetch function
  staleTime: 60000,                   // Staleness (default: 5min)
  cacheTime: 300000,                  // Cache time (default: 10min)
  retry: 3,                           // Retry attempts
  enabled: true,                      // Auto-fetch enabled
  refetchOnWindowFocus: true,         // Auto-refetch on focus
  onSuccess: (data) => {},            // Success callback
  onError: (error) => {}              // Error callback
})
```

#### `useMutation(options)`

Hook for data mutations.

```tsx
const {
  mutate,         // Mutation function
  data,           // Mutation result
  error,          // Mutation error
  isLoading,      // Mutation loading state
  isError,        // Boolean error state
  isSuccess,      // Boolean success state
  reset           // Reset mutation state
} = useMutation({
  mutationFn: (variables) => updateUser(variables),
  onMutate: (variables) => {
    // Called before mutation
    // Good for optimistic updates
  },
  onSuccess: (data, variables) => {
    // Called on successful mutation
  },
  onError: (error, variables) => {
    // Called on failed mutation
  },
  onSettled: (data, error, variables) => {
    // Called after mutation (success or error)
  }
})
```

#### `useInfiniteQuery(options)`

Hook for paginated/infinite data.

```tsx
const {
  data,                    // { pages: [], pageParams: [] }
  fetchNextPage,           // Fetch next page function
  fetchPreviousPage,       // Fetch previous page function
  hasNextPage,             // Boolean: has more pages
  hasPreviousPage,         // Boolean: has previous pages
  isFetchingNextPage,      // Loading next page
  isFetchingPreviousPage,  // Loading previous page
  ...queryResult           // All useQuery results
} = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage, allPages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor
})
```

### Utility Hooks

```tsx
// Get query client instance
const queryClient = useQueryClient()

// Invalidate queries
const invalidate = useInvalidateQueries()
invalidate(['users']) // Specific query
invalidate()          // All queries

// Refetch queries
const refetch = useRefetchQueries()
refetch(['users'])    // Specific query
refetch()             // All queries
```

## Advanced Features

### Custom Retry Logic

```tsx
const store = createAsyncStore({
  fetcher: fetchData,
  retry: (failureCount, error) => {
    // Custom retry logic
    if (error.status === 404) return false
    return failureCount < 3
  },
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
})
```

### Optimistic Updates

```tsx
const { mutate } = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['users'])
    
    // Snapshot previous value
    const previousUsers = queryClient.getQueryData(['users'])
    
    // Optimistically update
    queryClient.setQueryData(['users'], old => [...old, newUser])
    
    return { previousUsers }
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['users'], context.previousUsers)
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['users'])
  }
})
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build:lib

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT

## Performance Considerations

### Bundle Size
- Core library: ~10KB (3KB gzipped)
- Zero dependencies for basic state management
- Tree-shakeable - only import what you use

### Memory Management
```tsx
// Automatic cleanup
useEffect(() => {
  return () => {
    queryClient.removeQueries(['inactive-data'])
  }
}, [])

// Manual cache control
const store = createAsyncStore({
  fetcher: fetchData,
  cacheTime: 0 // No caching for ephemeral data
})
```

### Optimization Tips
```tsx
// Use selectors to prevent unnecessary re-renders
const count = useSeblakSelector(store, state => state.data.count)

// Debounce mutations
const { mutate } = useMutation({
  mutationFn: useMemo(() => 
    debounce(updateUser, 300), [])
})

// Prefetch data
const queryClient = useQueryClient()
queryClient.prefetchQuery(['users'], fetchUsers)
```

## TypeScript Support

Seblak is built with TypeScript and provides excellent type safety:

```tsx
interface UserState {
  users: User[]
  selectedUser: User | null
}

// Fully typed store
const userStore = createStore<UserState>({
  initialState: {
    users: [],
    selectedUser: null
  }
})

// Type-safe async store
const postsStore = createAsyncStore<Post[]>({
  fetcher: () => fetchPosts() // Return type inferred
})

// Generic query hook
const { data } = useQuery<User[], Error>({
  queryKey: ['users'],
  queryFn: fetchUsers
})
```

## Migration Guide

### From React Query

```tsx
// React Query
const { data, isLoading, error, refetch } = useQuery(['users'], fetchUsers)

// Seblak equivalent
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})
```

### From Redux Toolkit

```tsx
// Redux Toolkit
const dispatch = useDispatch()
const users = useSelector(state => state.users)

// Seblak equivalent
const [state, actions] = useSeblak(userStore)
const users = useSeblakSelector(userStore, state => state.data.users)
```

### From Zustand

```tsx
// Zustand
const useStore = create(set => ({
  users: [],
  addUser: user => set(state => ({ users: [...state.users, user] }))
}))

// Seblak equivalent
const userStore = createStore({
  initialState: { users: [] }
})

// In component
const [state, actions] = useSeblak(userStore)
const addUser = user => actions.setState({
  users: [...state.data.users, user]
})
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Why "Seblak"?

Seblak is a popular Indonesian street food known for being spicy, flavorful, and customizable - just like this state management library! It's lightweight yet powerful, simple yet flexible.

## License

MIT © [zakirkun](https://github.com/zakirkun)

## Support

- 📝 [Documentation](https://github.com/zakirkun/seblak#readme)
- 🐛 [Issues](https://github.com/zakirkun/seblak/issues)
- 💬 [Discussions](https://github.com/zakirkun/seblak/discussions)

---

**Made with ❤️ and 🌶️ by [zakirkun](https://github.com/zakirkun)**
