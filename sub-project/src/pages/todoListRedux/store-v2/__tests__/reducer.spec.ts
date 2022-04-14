import { data } from '../../mock-data'
import { todoListSlice as todoListReducer, testSlice as testReducer } from '../reducers'
describe('reducer test',()=>{
    it('should return the initial state', () => {
        expect(todoListReducer(undefined, { type: undefined })).toEqual(data)
    })
})
