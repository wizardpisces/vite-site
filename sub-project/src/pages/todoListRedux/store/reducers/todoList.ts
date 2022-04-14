//mock data
import { data } from "../../mock-data";
import { Action, ActionType } from "../actions";
import { Todo } from "..";

const initialState: Todo[] = data;
let nextTodoId = data.length;

export default function todoList(state = initialState, action: Action | {type:undefined}){
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