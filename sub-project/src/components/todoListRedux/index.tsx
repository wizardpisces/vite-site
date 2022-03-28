

import { Provider } from "react-redux";
//components
import Header from "./Header";
import ToDoList from "./ToDoList";
import ToDoForm from "./ToDoForm";
import "./index.css";
import store from "./store";

function App() {
  return (
    <div className="App">
      <Header />
      <Provider store={store}>
        <ToDoList />
        <ToDoForm />
      </Provider>
    </div>
  );
}

export default App;
