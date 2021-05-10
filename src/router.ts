import {
    createRouter,
    createWebHistory
} from 'vue-router'
const Vue3Test = () => import('./pages/vue3-test/menu.vue')
const Blog = () => import('./pages/blog/index.vue')
const SassPlayground = () => import('./pages/playground/sass.vue')
const VirtualMachine = () => import('./pages/virtual-machine/index.vue')

const routerHistory = createWebHistory()

export const routes = [{
    path: '/',
    name: 'home',
    component: SassPlayground
}, {
    path: '/blog',
    component: Blog,
    name: 'blog',
    query: {
        name: 'nuxt'
    }
}, {
    path: '/vue3-test',
    name: 'vue3Test',
    component: Vue3Test
}, {
    path: '/virtual-machine',
    name: 'VirtualMachine',
    component: VirtualMachine
}]

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;