import { ChangeEvent, FormEvent, useState } from "react";
import { useTodoContext } from "../context";

const ToDoForm = () => {

  let todoList = useTodoContext()

  const [userInput, setUserInput] = useState("");

  const handleChange = (e: ChangeEvent) => {
    setUserInput((e.currentTarget as HTMLInputElement).value);
  };

  const handleSubmit = (e:FormEvent) => {
    e.preventDefault();
    todoList.addTask(userInput);
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
