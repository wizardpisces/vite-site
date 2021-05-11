import { InjectionKey } from 'vue'
import { createStore, createLogger, useStore as baseUseStore, Store } from 'vuex'
import gaModule, { State as GaModuleState} from './modules/gaModule'

const debug = process.env.NODE_ENV !== 'production'

export interface State {
    count: number
    test: string
}

export const key: InjectionKey<Store<State>> = Symbol()

export default createStore<State>({
    modules: {
        gaModule
    },
    plugins: debug ? [createLogger()] : [],
    state() {
        return {
            count: 0,
            test: 'test string'
        }
    },
    mutations: {
        increment(state) {
            state.count++
        }
    }
})

export function useStore() {
    return baseUseStore(key)
}

// // Load all modules.
// function loadModules() {
//     const context = require.context("./modules", false, /([a-z_]+)\.js$/i)

//     const modules = context
//         .keys()
//         .map((key) => ({ key, name: key.match(/([a-z_]+)\.js$/i)[1] }))
//         .reduce(
//             (modules, { key, name }) => ({
//                 ...modules,
//                 [name]: context(key).default
//             }),
//             {}
//         )

//     return { context, modules }
// }
