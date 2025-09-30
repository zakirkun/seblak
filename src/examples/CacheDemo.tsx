import { createAsyncStore, useAsyncSeblak } from '../lib'
import './CacheDemo.css'

// Mock API with delay to demonstrate stale-while-revalidate
const fetchCacheData = async (): Promise<{ timestamp: number; value: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
  return {
    timestamp: Date.now(),
    value: `Data fetched at ${new Date().toLocaleTimeString()}`
  }
}

// Create store with stale-while-revalidate settings
const cacheStore = createAsyncStore({
  fetcher: fetchCacheData,
  name: 'cache-demo',
  staleTime: 5000,  // 5 seconds - data becomes stale after 5s
  cacheTime: 30000, // 30 seconds - data expires from cache after 30s
  refetchOnWindowFocus: true
})

export function CacheDemo() {
  const [state, actions] = useAsyncSeblak(cacheStore)

  return (
    <div className="demo-container">
      <h3>🚀 Stale-While-Revalidate Cache Demo</h3>
      
      <div className="cache-status">
        <div className={`status-indicator ${state.isStale ? 'stale' : 'fresh'}`}>
          {state.isStale ? '🔶 Stale' : '🟢 Fresh'}
        </div>
        <div className={`status-indicator ${state.isCacheExpired ? 'expired' : 'cached'}`}>
          {state.isCacheExpired ? '🔴 Expired' : '💾 Cached'}
        </div>
        <div className={`status-indicator ${state.isFetching ? 'fetching' : 'idle'}`}>
          {state.isFetching ? '🔄 Fetching' : '⏸️ Idle'}
        </div>
      </div>

      <div className="data-display">
        {state.loading && !state.data && <p>Initial loading...</p>}
        {state.data && (
          <div>
            <p><strong>Value:</strong> {state.data.value}</p>
            <p><strong>Timestamp:</strong> {state.data.timestamp}</p>
            <p><strong>Last Fetched:</strong> {
              state.lastFetched ? new Date(state.lastFetched).toLocaleTimeString() : 'Never'
            }</p>
          </div>
        )}
        {state.error && <p className="error">Error: {state.error}</p>}
      </div>

      <div className="cache-actions">
        <button onClick={() => actions.fetch()} disabled={state.isFetching}>
          Fetch Data
        </button>
        <button onClick={() => actions.refetch()} disabled={state.isFetching}>
          Force Refetch
        </button>
        <button onClick={() => actions.invalidate()}>
          Invalidate Cache
        </button>
        <button onClick={() => actions.reset()}>
          Reset Store
        </button>
      </div>

      <div className="cache-explanation">
        <h4>How Stale-While-Revalidate Works:</h4>
        <ul>
          <li>🟢 <strong>Fresh (0-5s):</strong> Data is served immediately from cache</li>
          <li>🔶 <strong>Stale (5-30s):</strong> Returns cached data instantly + refetches in background</li>
          <li>🔴 <strong>Expired (30s+):</strong> Shows loading state while fetching fresh data</li>
          <li>🔄 <strong>Background updates:</strong> UI shows old data while new data loads</li>
        </ul>
      </div>
    </div>
  )
}
