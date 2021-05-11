// import { ComponentCustomProperties } from 'vue'
// import { Store } from 'vuex'
declare module '*.vue' {
    import { App, defineComponent } from 'vue'
    const component: ReturnType<typeof defineComponent> & {
        install(app: App): void
    }
    export default component
}

declare module '*.md' {
    let html:string;
    export {
        html
    };
}

// declare module '@vue/runtime-core' {
//     // declare your own store states
//     interface State {
//         count: number
//     }

//     // provide typings for `this.$store`
//     interface ComponentCustomProperties {
//         $store: Store<State>
//     }
// }