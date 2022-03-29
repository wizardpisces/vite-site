import { Observer } from "mobx-react";
import { useTodoContext } from "../context";
import ToDo from "./ToDo";
const ToDoList = () => {
  let todoList = useTodoContext();
  return (
    <Observer>
      {() => (
        <div>
          {todoList.list.map((todo) => {
            return <ToDo key={todo.id} todo={todo} />;
          })}
          <button
            style={{ margin: "20px" }}
            onClick={() => todoList.clearCompleted()}
          >
            Clear Completed
          </button>
        </div>
      )}
    </Observer>
  );
};

export default ToDoList;
