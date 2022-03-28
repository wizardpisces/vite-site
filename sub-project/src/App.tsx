import { useState } from 'react'
import { Provider } from "react-redux";
// import logo from './logo.svg'
import './App.css'
// @ts-ignore
import TodoList from './components/todoList/index'
import TodoListRedux from "./components/todoListRedux/index";
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <TodoList></TodoList>
      <TodoListRedux></TodoListRedux>
    </div>
  )
}

export default App
