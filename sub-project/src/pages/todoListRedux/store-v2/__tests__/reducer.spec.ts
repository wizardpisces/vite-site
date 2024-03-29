
import { addTodo, completeTodo, toggleTodo, Todo, default as todoListReducer, refreshData } from '../reducers/todoListSlice'
import {store} from '../index'

let previousState: Todo[] = []

beforeEach(()=>{
    previousState = [{
        id: 1,
        task: "Give dog a bath",
        complete: true,
    },
    {
        id: 2,
        task: "Do laundry",
        complete: true,
    },
    {
        id: 3,
        task: "Vacuum floor",
        complete: false,
    }]
})

describe('reducer test', () => {
    it('should return the initial state', () => {
        expect(todoListReducer(undefined, { type: undefined })).toEqual([])
    })

    it('resetData action', async () => {
        let state = await store.dispatch(refreshData())
        // expect(todoListReducer([],refreshData())).
        // expect(state).toHaveLength()
    })

    it('should handle a todo being added to an list', () => {
        expect(todoListReducer(previousState, addTodo('userInput'))).toHaveLength(4)
    })

    it('should toggleTodo toggle todo complete', () => {
        expect(todoListReducer(previousState, toggleTodo(1))[0].complete).toEqual(false)
    })
    it('should completeTodo', () => {
        expect(todoListReducer(previousState, completeTodo())).toHaveLength(1)
    })
})
