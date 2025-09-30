# 🍲 Seblak

A lightweight, TypeScript-first React state management library that's as spicy and flavorful as the Indonesian dish it's named after!

## Features

- 🚀 **Lightweight**: Minimal bundle size
- 🔷 **TypeScript First**: Built with TypeScript for excellent type safety
- 🎣 **React Hooks**: Simple and intuitive React hooks API
- 🔄 **Reactive**: Automatic re-renders when state changes
- 🛠 **Developer Tools**: Debug support in development mode
- 📦 **Zero Dependencies**: No external runtime dependencies

## Installation

```bash
npm install seblak
# or
yarn add seblak
# or
pnpm add seblak
```

## Quick Start

```tsx
import { createStore, useSeblak } from 'seblak'

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

## API Reference

### `createStore(options)`

Creates a new store instance.

```tsx
const store = createStore<StateType>({
  initialState: { /* your initial state */ },
  name: 'optional-store-name' // for debugging
})
```

### `useSeblak(store)`

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

### `useSeblakSelector(store, selector)`

Hook for selecting specific parts of the state.

```tsx
const count = useSeblakSelector(store, state => state.data.count)
```

### `useSeblakActions(store)`

Hook for accessing only the actions (no state subscription).

```tsx
const actions = useSeblakActions(store)
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

## Why "Seblak"?

Seblak is a popular Indonesian street food known for being spicy, flavorful, and customizable - just like this state management library! It's lightweight yet powerful, simple yet flexible.

---

Made with ❤️ and 🌶️
