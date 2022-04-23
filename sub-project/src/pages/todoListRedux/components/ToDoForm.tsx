import { ChangeEvent, FormEvent, useState } from "react";
import { connect } from "react-redux";
import { addTodo, refreshData } from "../store-v2/reducers/todoListSlice";
import { useSelector, useDispatch } from "react-redux";

const ToDoForm = () => {
  const dispatch = useDispatch()
  const [userInput, setUserInput] = useState("");

  const handleChange = (e: ChangeEvent) => {
    setUserInput((e.currentTarget as HTMLInputElement).value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(addTodo(userInput));
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
      <button onClick={() => dispatch(refreshData())}>resetData</button>
    </form>
  );
};

export default connect()(ToDoForm);
