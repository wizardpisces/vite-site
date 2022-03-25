import { useState } from 'react'
// import logo from './logo.svg'
import './App.css'
// @ts-ignore
import TodoList from './components/todoList/index'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <TodoList></TodoList>
    </div>
  )
}

export default App
