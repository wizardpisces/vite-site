import { MouseEvent } from "react";
import { connect } from "react-redux";
import { toggleTodo } from "./store/actions";
import { useSelector, useDispatch } from "react-redux";
import { Todo } from "./store";

const ToDo = ({ todo }:{todo:Todo}) => {
  const dispatch = useDispatch()
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
