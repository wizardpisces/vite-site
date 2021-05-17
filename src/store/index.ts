import { InjectionKey } from 'vue'
import { createStore, createLogger, useStore as baseUseStore, Store, Module, ModuleTree } from 'vuex'

type GlobContext = {
    [key: string]: { [key: string]: any; 'default': any }
}
export interface State {
    count: number
    test: string
}

const debug = process.env.NODE_ENV !== 'production'

export const key: InjectionKey<Store<State>> = Symbol()

let pathList: any = []

function loadModules(): any {
    // @ts-ignore
    const contextGlob: GlobContext = import.meta.globEager('./modules/*.ts')
    console.log('modules', contextGlob)
    pathList = Object.keys(contextGlob)
    return pathList.reduce((modules: { [key: string]: any }, modulePath: string) => {
        //@ts-ignore
        let moduleName = modulePath.match(/([a-z_]+)\.ts$/i)[1]
        modules[moduleName] = contextGlob[modulePath].default
        return modules
    }, {})
}

let modules = loadModules()
const store = createStore<State>({
    modules,
    plugins: debug ? [createLogger()] : [],
    state() {
        return {
            count: 1,
            test: 'test string'
        }
    },
    mutations: {
        increment(state) {
            state.count++
        }
    }
})

console.log('old store', store)

export function useStore() {
    return baseUseStore(key)
}

// @ts-ignore
if (import.meta.hot) {

    /**
     * 如何解决 hot.accept没法传递变量，导致没法批量hot.accept？
     */

    // @ts-ignore
    import.meta.hot.accept(['./modules/gaModule.ts'], (newModules) => {
        console.log('newGaModule', newModules)
        
        store.hotUpdate({
            modules: {
                gaModule: newModules[0].default
            }
        })
        console.log('new store', store)
    })
}

export default store