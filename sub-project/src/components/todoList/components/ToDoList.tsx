import React, { useContext } from "react";
import { TodoContext } from "../context";
import { ActionType } from "../hooks";
import { Todo } from "../mock-data";
import ToDo from "./ToDo";

const ToDoList = () => {
  let { state, dispatch } = useContext(TodoContext);
  return (
    <div>
      {state.map((todo: Todo) => {
        return <ToDo key={todo.id} todo={todo} />;
      })}
      <button
        style={{ margin: "20px" }}
        onClick={() =>
          dispatch({
            type: ActionType.COMPLETE,
          })
        }
      >
        Clear Completed
      </button>
    </div>
  );
};

export default ToDoList;
