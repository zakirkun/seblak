import { createStore } from '../lib'

// Example: User Profile Store
interface UserProfile {
  name: string
  email: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark'
    language: string
  }
}

export const userStore = createStore<UserProfile>({
  initialState: {
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      language: 'en'
    }
  },
  name: 'user-profile'
})

// Example: Simple Counter Store
interface CounterState {
  count: number
}

export const counterStore = createStore<CounterState>({
  initialState: { count: 0 },
  name: 'counter'
})

// Example: Task Store
interface Todo {
  id: number
  text: string
  completed: boolean
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}

export const todoStore = createStore<TodoState>({
  initialState: { 
    todos: [],
    filter: 'all'
  },
  name: 'todos'
})

export type { UserProfile, CounterState, Todo, TodoState }
