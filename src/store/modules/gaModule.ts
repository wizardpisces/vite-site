import { Module } from 'vuex'

export type State = {
    count: number
}

/**
 * how to import rootState ts without cyclical dependency?
 */
const module: Module<State, any> = {
    namespaced: true,

    state: () => ({
        count: 0
    }),

    mutations: {
        increment(state) {
            state.count++
        }
    },

    getters:{
        count:(state)=>state.count
    }
}

export default module