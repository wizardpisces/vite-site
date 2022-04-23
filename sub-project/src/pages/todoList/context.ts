import { createContext } from "react";
import { Action, State } from "./hooks";

type Ctx={
    state:State,
    dispatch:(action:Action)=>void
}

let defaultValue: Ctx = {
  state: [],
  dispatch: (action)=>{}
};

export const TodoContext = createContext(defaultValue);