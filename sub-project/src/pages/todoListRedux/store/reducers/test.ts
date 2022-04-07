import { ActionType, TestAction } from "../actions/test";

let initialState = {
    test:'this is test'
}

export default function test(state=initialState,action:TestAction){
    switch (action.type) {
        case ActionType.TEST:
            return {test:state.test+'+'};
        default: return state
    }
}