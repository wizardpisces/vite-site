import VueRouter, { Route } from 'vue-router'

/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'vue/types/vue' {
    interface Vue {
        $router: VueRouter
    }
}
declare module '*.md' {
    let html: string;
    export {
        html
    };
}