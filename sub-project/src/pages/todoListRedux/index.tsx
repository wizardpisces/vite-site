

import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
//components
import Header from "./components/Header";
import ToDoList from "./components/ToDoList";
import ToDoForm from "./components/ToDoForm";
import "./index.css";
import { store, persistor } from "./store";

function TodoListRedux() {
  return (
    <div className="TodoListRedux">
      <Header />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ToDoList />
          <ToDoForm />
        </PersistGate>
      </Provider>
    </div>
  );
}

export default TodoListRedux;
