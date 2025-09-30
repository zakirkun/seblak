import { useSeblak } from '../lib'
import { userStore, type UserProfile } from './stores'

export function UserProfileDemo() {
  const [state, actions] = useSeblak(userStore)
  
  const updateProfile = (updates: Partial<UserProfile>) => {
    actions.setState(updates)
  }
  
  const updatePreferences = (preferences: Partial<UserProfile['preferences']>) => {
    actions.setState({
      preferences: { ...state.data.preferences, ...preferences }
    })
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>User Profile Example</h3>
      
      <div>
        <label>
          Name:{' '}
          <input
            value={state.data.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />
        </label>
      </div>
      
      <div>
        <label>
          Email:{' '}
          <input
            value={state.data.email}
            onChange={(e) => updateProfile({ email: e.target.value })}
          />
        </label>
      </div>
      
      <div>
        <label>
          Theme:{' '}
          <select
            value={state.data.preferences.theme}
            onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      
      <div>
        <label>
          Language:{' '}
          <select
            value={state.data.preferences.language}
            onChange={(e) => updatePreferences({ language: e.target.value })}
          >
            <option value="en">English</option>
            <option value="id">Indonesian</option>
            <option value="es">Spanish</option>
          </select>
        </label>
      </div>
      
      <button onClick={() => actions.reset()}>Reset Profile</button>
      
      <div style={{ marginTop: '20px', fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
        <strong>State Debug:</strong>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  )
}
