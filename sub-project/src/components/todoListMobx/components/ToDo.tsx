import { MouseEvent, useMemo } from "react";
import { Observer } from "mobx-react";
import { Todo } from "../store";

const ToDo = ({ todo }: { todo: Todo }) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    todo.toggle();
  };

  // useMemo avoid <TodoContext.Provider value={todoList}> 's vallue trigger whole rerender
  
  // return (
  //   <Observer>
  //     {() => {
  //       console.log("rendered!!");
  //      return  <div
  //         id={todo.id + ""}
  //         key={todo.id + todo.task}
  //         onClick={handleClick}
  //         className={todo.complete ? "todo strike" : "todo"}
  //       >
  //         {todo.task}
  //       </div>
  //     }}
  //   </Observer>
  // );
  return useMemo(() => {
    console.log("rendered!!");
    return (
      <Observer>
        {() => (
          <div
            id={todo.id + ""}
            key={todo.id + todo.task}
            onClick={handleClick}
            className={todo.complete ? "todo strike" : "todo"}
          >
            {todo.task}
          </div>
        )}
      </Observer>
    );
  }, [todo.id, todo.task, todo.complete]);
};

export default ToDo;
