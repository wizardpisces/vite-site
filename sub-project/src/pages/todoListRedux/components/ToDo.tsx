import { MouseEvent } from "react";
import { connect } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
import { Todo, toggleTodo } from "../store-v2/reducers/todoListSlice";

const ToDo = ({ todo }:{todo:Todo}) => {
  const dispatch = useDispatch()
  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    dispatch(toggleTodo(+e.currentTarget.id));
  };
  console.log('executed redux todo')
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
