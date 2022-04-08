import { ActionType, Action } from "../actions";

let initialState = {
    test: 'this is test'
}

export default function test(state = initialState, action: Action) {
    switch (action.type) {
        case ActionType.TEST:
            return { test: state.test + '+' };
        case ActionType.ADD: {
            console.log('test reducer has been executed')
        }
        default: return state
    }
}