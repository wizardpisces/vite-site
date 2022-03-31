import { createStore, combineReducers } from "redux";
import todoList from "./reducers";

export type Todo = {
  id: number;
  task: string;
  complete: boolean;
};

const rootReducer = combineReducers({ todoList });

export type AppState = ReturnType<typeof rootReducer>;

let store = createStore(rootReducer);

export default store;
