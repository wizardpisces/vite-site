import { MouseEvent } from "react";
import { connect } from "react-redux";
import { toggleTodo } from "./actions";

const ToDo = ({ todo, dispatch }) => {
  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    dispatch(toggleTodo(+e.currentTarget.id));
  };

  return (
    <div
      id={todo.id + ""}
      key={todo.id + todo.task}
      onClick={toggle}
      className={todo.complete ? "todo strike" : "todo"}
    >
      {todo.task}
    </div>
  );
};

export default connect()(ToDo);
