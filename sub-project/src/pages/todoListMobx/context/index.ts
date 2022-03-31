import { createContext, useContext } from "react";
import { TodoList } from "../store";

export const TodoContext = createContext<TodoList>({} as TodoList);

export const useTodoContext = () => useContext(TodoContext);
