//mock data
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { data } from "../../mock-data";

export type Todo = {
    id: number;
    task: string;
    complete: boolean;
};

function asyncGetData(): Promise<Todo[]> {
    return new Promise(resolve => setTimeout(() => resolve(data), 1000))
}

// create the thunk
const refreshData = createAsyncThunk(
    'todoListSlice/asyncGetData',
    async () => {
        const data = await asyncGetData()
        return data
    }
)

const initialState: Todo[] = [];
export let nextTodoId = ()=>new Date().getTime();

export const todoListSlice = createSlice({
    name: 'todoListSlice',
    initialState,
    reducers: {
        // fetchTodoList:(state) => {
        //     console.warn('sending fetch todolist request')
        //     asyncGetData().then((data)=>{
        //         console.warn('finish fetch todolist request')
        //         state = data
        //     })
        // },
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
    },
    extraReducers:{
        [refreshData.pending.type]: (state, action) => { console.log('loading todolist...', action.type)},
        [refreshData.fulfilled.type]: (state, action: PayloadAction<Todo[]>)=>{
            console.log('loading todolist finished....', action.type)
            return action.payload
        },
    }
    
    // (builder)=>{
    //     builder.addCase(refreshData.fulfilled,(state,action:PayloadAction<Todo[]>)=>{
    //         return action.payload
    //     })
    // }
})

export const { addTodo, completeTodo, toggleTodo } = todoListSlice.actions
export { refreshData }

export default todoListSlice.reducer