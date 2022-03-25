import React, { ChangeEvent, FormEvent, useContext, useState } from "react";
import { TodoContext } from "./context";
import { ActionType } from "./hooks";

const ToDoForm = () => {

  let { state,dispatch } = useContext(TodoContext);

  const [userInput, setUserInput] = useState("");

  const handleChange = (e: ChangeEvent) => {
    setUserInput((e.currentTarget as HTMLInputElement).value);
  };

  const handleSubmit = (e:FormEvent) => {
    e.preventDefault();
    dispatch({
      type: ActionType.ADD,
      payload: {
        userInput,
      },
    });
    setUserInput("");
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={userInput}
        type="text"
        onChange={handleChange}
        placeholder="Enter task..."
      />
      <button>Submit</button>
    </form>
  );
};

export default ToDoForm;
