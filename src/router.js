import {
    createRouter,
    createWebHistory
} from 'vue-router'
import Vue3Test from './pages/vue3-test/menu.vue'
import Blog from './pages/blog/index.vue'
import SassPlayground from './pages/playground/sass.vue'
import VirtualMachine from './pages/virtual-machine/index.vue'

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