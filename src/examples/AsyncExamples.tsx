import { useQuery, useMutation, createAsyncStore, useAsyncSeblak } from '../lib'

// Example API functions
const fetchUser = async (userId: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${userId}`
  }
}

const fetchPosts = async () => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return [
    { id: 1, title: 'First Post', content: 'This is the first post content.' },
    { id: 2, title: 'Second Post', content: 'This is the second post content.' },
    { id: 3, title: 'Third Post', content: 'This is the third post content.' }
  ]
}

const updateUserProfile = async (data: { name: string; email: string }) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { ...data, updatedAt: new Date().toISOString() }
}

// Async Store Example
const weatherStore = createAsyncStore({
  fetcher: async () => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      temperature: Math.round(Math.random() * 30 + 10),
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
      location: 'Jakarta, Indonesia'
    }
  },
  name: 'weather',
  staleTime: 30000, // 30 seconds
  retry: 2
})

// Query Hook Example
export function UserProfile() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', 1],
    queryFn: () => fetchUser(1),
    staleTime: 60000 // 1 minute
  })

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 30000 // 30 seconds
  })

  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      alert('Profile updated successfully!')
    },
    onError: (error) => {
      alert(`Update failed: ${error.message}`)
    }
  })

  const handleUpdateProfile = () => {
    if (user) {
      updateProfile({
        name: user.name + ' (Updated)',
        email: user.email
      })
    }
  }

  if (isLoading) return <div className="loading">Loading user...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="user-profile-async">
      <h3>🔄 Async User Profile</h3>
      {user && (
        <div className="user-info">
          <img src={user.avatar} alt={user.name} width="60" height="60" />
          <div>
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
        </div>
      )}
      
      <div className="actions">
        <button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh User'}
        </button>
        <button onClick={handleUpdateProfile} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </div>

      <div className="posts-section">
        <h4>📝 Posts</h4>
        {postsLoading ? (
          <div>Loading posts...</div>
        ) : (
          <ul>
            {posts?.map(post => (
              <li key={post.id}>
                <strong>{post.title}</strong>
                <p>{post.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Async Store Example
export function WeatherWidget() {
  const [state, actions] = useAsyncSeblak(weatherStore)

  return (
    <div className="weather-widget">
      <h3>🌤️ Weather Widget</h3>
      
      {state.loading && <div>Loading weather...</div>}
      {state.error && <div className="error">Error: {state.error}</div>}
      
      {state.data && (
        <div className="weather-info">
          <h4>{state.data.location}</h4>
          <p className="temperature">{state.data.temperature}°C</p>
          <p className="condition">{state.data.condition}</p>
          {state.lastFetched && (
            <small>
              Last updated: {new Date(state.lastFetched).toLocaleTimeString()}
            </small>
          )}
        </div>
      )}
      
      <div className="weather-actions">
        <button onClick={() => actions.refetch()} disabled={state.isFetching}>
          {state.isFetching ? 'Refreshing...' : 'Refresh Weather'}
        </button>
        <button onClick={() => actions.invalidate()}>
          Invalidate Cache
        </button>
      </div>
      
      <div className="weather-status">
        <p>Is Fetching: {state.isFetching ? 'Yes' : 'No'}</p>
        <p>Is Refetching: {state.isRefetching ? 'Yes' : 'No'}</p>
        <p>Retry Count: {state.retryCount}</p>
      </div>
    </div>
  )
}
