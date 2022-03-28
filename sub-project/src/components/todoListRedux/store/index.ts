import { createStore } from "redux";
import reducer from "../redux";

export type Todo = {
  id: number;
  task: string;
  complete: boolean;
};
export type State = Todo[];

let store = createStore(reducer);


export default store;
