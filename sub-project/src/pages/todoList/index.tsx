//components
import Header from "./components/Header";
import ToDoList from "./components/ToDoList";
import ToDoForm from "./components/ToDoForm";
import "./index.css";
import { useTodoList } from "./hooks";
import { TodoContext } from "./context";
function TodoList() {
  const [state, dispatch] = useTodoList();
  return (
    <div className="TodoList">
      <Header />
      <TodoContext.Provider value={{ state, dispatch }}>
        <ToDoList />
        <ToDoForm />
      </TodoContext.Provider>
    </div>
  );
}

export default TodoList;
