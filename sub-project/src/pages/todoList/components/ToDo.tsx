import { MouseEvent, useContext, useMemo } from "react";
import { TodoContext } from "../context";
import { ActionType, useTodoList } from "../hooks";
import { Todo } from "../mock-data";

const ToDo = ({ todo }: { todo: Todo }) => {
  let { dispatch } = useContext(TodoContext);
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    dispatch({
      type: ActionType.TOGGLE,
      payload: {
        id: +e.currentTarget.id,
      },
    });
  };

  // useMemo avoid dep "useContext(TodoContext)" trigger rerender
  return useMemo(() => {
    console.log('rerendered!!')
    return (
      <div
        id={todo.id + ""}
        key={todo.id + todo.task}
        onClick={handleClick}
        className={todo.complete ? "todo strike" : "todo"}
      >
        {todo.task}
      </div>
    );
  }, [todo.id,todo.task,todo.complete]);
};

export default ToDo;
