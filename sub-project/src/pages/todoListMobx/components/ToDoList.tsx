import { Observer } from "mobx-react";
import { useTodoContext } from "../context";
import ToDo from "./ToDo";
const ToDoList = () => {
  let todoList = useTodoContext();
  console.log('todolist executed')
  return (
    <Observer>
      {() => {
        console.log('todo list rendered')
        return (
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
        )
      }}
    </Observer>
  );
};

export default ToDoList;
