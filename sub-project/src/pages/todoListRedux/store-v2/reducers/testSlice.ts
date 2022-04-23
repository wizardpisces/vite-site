import { createSlice, PayloadAction } from '@reduxjs/toolkit'

let initialState = {
    test: 'this is test'
}

export const testSlice = createSlice({
    name:"test",
    initialState,
    reducers:{
        test:(state)=>{
            state.test = state.test + '+'
        },
        add:()=>{
            console.log('test reducer has been executed')
        }
    }
})

export const { test,add} = testSlice.actions

export default testSlice.reducer