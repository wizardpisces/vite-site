//components
import Header from "./components/Header";
import ToDoList from "./components/ToDoList";
import ToDoForm from "./components/ToDoForm";
import "./index.css";
import { TodoContext } from "./context";
import { TodoList } from "./store";
import { data } from "./store/mock-data";

let todoList = new TodoList(data)

function TodoListMobx() {
  return (
    <div className="TodoListMobx">
      <Header />
      <TodoContext.Provider value={todoList}>
        <ToDoList />
        <ToDoForm />
      </TodoContext.Provider>
    </div>
  );
}

export default TodoListMobx;
