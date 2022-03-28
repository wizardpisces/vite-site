import { useReducer } from "react";

//mock data
import { data, Todo } from "./mock-data";

let nextTodoId = data.length

export enum ActionType {
  ADD,
  COMPLETE,
  TOGGLE,
}

export type State = Todo[];
export type Action = { type: ActionType; payload?: any };

const reducer = (state: State, action: Action) => {
  const handleToggle = (id: number) =>
    state.map((task: Todo) => {
      return task.id === Number(id)
        ? { ...task, complete: !task.complete }
        : { ...task };
    });

  const handleFilter = () =>
    state.filter((task: Todo) => {
      return !task.complete;
    });

  const addTask = (userInput: string) => [
    ...state,
    { id: ++nextTodoId, task: userInput, complete: false },
  ];

  switch (action.type) {
    case ActionType.ADD:
      return addTask(action.payload.userInput);
    case ActionType.COMPLETE:
      return handleFilter();
    case ActionType.TOGGLE:
      return handleToggle(action.payload.id);
    default:
      return state;
  }
};

export const useTodoList = () => useReducer(reducer, data);
