//components
import Header from "./Header";
import ToDoList from "./ToDoList";
import ToDoForm from "./ToDoForm";
import "./index.css";
import { useTodoList } from "./hooks";
import { TodoContext } from "./context";
function App() {
  const [state, dispatch] = useTodoList();
  return (
    <div className="App">
      <Header />
      <TodoContext.Provider value={{ state, dispatch }}>
        <ToDoList />
        <ToDoForm />
      </TodoContext.Provider>
    </div>
  );
}

export default App;
