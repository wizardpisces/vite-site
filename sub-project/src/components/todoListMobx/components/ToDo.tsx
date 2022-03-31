import { MouseEvent, useMemo } from "react";
import { Observer } from "mobx-react";
import { Todo } from "../store";

const ToDo = ({ todo }: { todo: Todo }) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    todo.toggle();
  };
  console.log('executed mobx todo')
  // useMemo avoid <TodoContext.Provider value={todoList}> 's vallue trigger whole rerender

  return useMemo(() => {
    // console.log("renderred!!");
    return (
      <Observer>
        {() => {
          console.log('mobx todo rendered')
          return (
            <div
              id={todo.id + ""}
              key={todo.id + todo.task}
              onClick={handleClick}
              className={todo.complete ? "todo strike" : "todo"}
            >
              {todo.task}
            </div>
          )
        }}
      </Observer>
    );
  }, [todo.id, todo.task, todo.complete]);
};

export default ToDo;
