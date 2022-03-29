

import { Provider } from "react-redux";
//components
import Header from "./components/Header";
import ToDoList from "./components/ToDoList";
import ToDoForm from "./components/ToDoForm";
import "./index.css";
import store from "./store";

function TodoListRedux() {
  return (
    <div className="TodoListRedux">
      <Header />
      <Provider store={store}>
        <ToDoList />
        <ToDoForm />
      </Provider>
    </div>
  );
}

export default TodoListRedux;
