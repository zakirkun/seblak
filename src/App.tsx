import { createStore, useSeblak } from './lib'
import { UserProfileDemo } from './examples/UserProfile'
import './App.css'

// Define the shape of our counter state
interface CounterState {
  count: number
  name: string
}

// Create a store with initial state
const counterStore = createStore<CounterState>({
  initialState: { count: 0, name: 'Seblak Counter' },
  name: 'counter'
})

function Counter() {
  const [state, actions] = useSeblak(counterStore)
  
  const increment = () => {
    actions.setState({ count: state.data.count + 1 })
  }
  
  const decrement = () => {
    actions.setState({ count: state.data.count - 1 })
  }
  
  const reset = () => {
    actions.reset()
  }
  
  const updateName = (newName: string) => {
    actions.setState({ name: newName })
  }
  
  return (
    <div className="counter">
      <h2>{state.data.name}</h2>
      <div className="counter-display">
        <button onClick={decrement}>-</button>
        <span className="count">{state.data.count}</span>
        <button onClick={increment}>+</button>
      </div>
      <div className="counter-actions">
        <button onClick={reset}>Reset</button>
        <input
          type="text"
          value={state.data.name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="Counter name"
        />
      </div>
      <div className="state-info">
        <p>Loading: {state.loading ? 'Yes' : 'No'}</p>
        <p>Error: {state.error || 'None'}</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <h1>🍲 Seblak State Management Demo</h1>
      <p>A lightweight React state management library</p>
      
      <div className="demo-grid">
        <Counter />
        <UserProfileDemo />
      </div>
      
      <div className="info-section">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✅ TypeScript-first design</li>
          <li>✅ Reactive state updates</li>
          <li>✅ Multiple independent stores</li>
          <li>✅ Built-in loading and error states</li>
          <li>✅ Reset functionality</li>
          <li>✅ Debug information</li>
        </ul>
      </div>
    </div>
  )
}

export default App
