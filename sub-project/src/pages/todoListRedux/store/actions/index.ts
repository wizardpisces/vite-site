export enum ActionType {
  ADD,
  COMPLETE,
  TOGGLE,
  TEST
}
export interface TestAction {
  type: ActionType.TEST
}
interface AddAction {
  type: ActionType.ADD;
  payload: { userInput: string };
}

interface CompleteAction {
  type: ActionType.COMPLETE;
}

interface ToggleAction {
  type: ActionType.TOGGLE;
  payload: { id: number };
}

export const addTodo = (userInput: string): AddAction => ({
  type: ActionType.ADD,
  payload: { userInput },
});

export const toggleTodo = (id: number): ToggleAction => ({
  type: ActionType.TOGGLE,
  payload: { id },
});

export const completeTodo = (): CompleteAction => ({
  type: ActionType.COMPLETE,
});

export type Action = AddAction | CompleteAction | ToggleAction | TestAction;
