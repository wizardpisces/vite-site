//mock data
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { data } from "../../mock-data";

export type Todo = {
    id: number;
    task: string;
    complete: boolean;
};

function asyncGetData():Promise<Todo[]>{
    return new Promise(resolve=>setTimeout(()=>resolve(data),1000))
}

const initialState: Todo[] = [];
let nextTodoId = ()=>new Date().getTime();

export const todoListSlice = createSlice({
    name: 'todoList',
    initialState,
    reducers: {
        fetchTodoList:(state) => {
            console.warn('sending fetch todolist request')
            asyncGetData().then((data)=>{
                console.warn('finish fetch todolist request')
                state = data
            })
        },
        addTodo: (state, action: PayloadAction<string>) => {
            let userInput = action.payload
            state.push({ id: nextTodoId(), task: userInput, complete: false })
        },
        completeTodo: (state) => {
            return state.filter((task: Todo) => {
                return !task.complete;
            });
        },
        toggleTodo: (state, action: PayloadAction<number>) => {
            let id = Number(action.payload)
            state.forEach((task: Todo) => {
                if (task.id === id) {
                    task.complete = !task.complete
                }
            })
        }
    }
})

export const { addTodo, completeTodo, toggleTodo, fetchTodoList } = todoListSlice.actions
export default todoListSlice.reducer