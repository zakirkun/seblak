import { useSeblak, useSeblakSelector } from '../lib'
import { counterStore, todoStore, type Todo } from './stores'

export function SimpleCounter() {
  const [state, actions] = useSeblak(counterStore)
  
  return (
    <div>
      <h3>Simple Counter</h3>
      <p>Count: {state.data.count}</p>
      <button onClick={() => actions.setState({ count: state.data.count + 1 })}>
        Increment
      </button>
      <button onClick={() => actions.setState({ count: state.data.count - 1 })}>
        Decrement
      </button>
      <button onClick={() => actions.reset()}>Reset</button>
    </div>
  )
}

export function TaskList() {
  const [state, actions] = useSeblak(todoStore)
  const filteredTodos = useSeblakSelector(todoStore, (storeState) => {
    const todos = (storeState.data as { todos: Todo[]; filter: string }).todos
    const filter = (storeState.data as { todos: Todo[]; filter: string }).filter
    switch (filter) {
      case 'active': return todos.filter((task: Todo) => !task.completed)
      case 'completed': return todos.filter((task: Todo) => task.completed)
      default: return todos
    }
  })
  
  const addTask = (text: string) => {
    const newTask: Todo = {
      id: Date.now(),
      text,
      completed: false
    }
    const currentData = state.data as { todos: Todo[]; filter: string }
    actions.setState({
      todos: [...currentData.todos, newTask]
    })
  }
  
  const toggleTask = (id: number) => {
    const currentData = state.data as { todos: Todo[]; filter: string }
    actions.setState({
      todos: currentData.todos.map((task: Todo) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    })
  }
  
  return (
    <div>
      <h3>Task List</h3>
      <input
        type="text"
        placeholder="Add task..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            addTask(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />
      
      <div>
        {(['all', 'active', 'completed'] as const).map((filterValue) => (
          <button
            key={filterValue}
            onClick={() => actions.setState({ filter: filterValue })}
            style={{ 
              fontWeight: (state.data as { filter: string }).filter === filterValue ? 'bold' : 'normal' 
            }}
          >
            {filterValue}
          </button>
        ))}
      </div>
      
      <ul>
        {filteredTodos.map((task: Todo) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <span style={{ 
              textDecoration: task.completed ? 'line-through' : 'none' 
            }}>
              {task.text}
            </span>
          </li>
        ))}
      </ul>
      
      <p>Total: {filteredTodos.length} items</p>
    </div>
  )
}
