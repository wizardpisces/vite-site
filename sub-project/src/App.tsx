// import logo from './logo.svg'
import './App.css'
import TodoList from './components/todoList/index'
import TodoListRedux from "./components/todoListRedux/index";
import TodoListMobx from "./components/todoListMobx/index";
function App() {
  return (
    <div className="App">
      <TodoList></TodoList>
      <TodoListRedux></TodoListRedux>
      <TodoListMobx></TodoListMobx>
    </div>
  )
}

export default App
