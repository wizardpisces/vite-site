import {
    createRouter,
    createWebHistory
} from 'vue-router'
const Test = () => import('./pages/test/test.vue')
const Blog = () => import('./pages/blog/index.vue')
const SassPlayground = () => import('./pages/playground/sass.vue')
const VirtualMachine = () => import('./pages/virtual-machine/index.vue')

const routerHistory = createWebHistory()

export const routes = [{
    path: '/',
    name: 'home',
    component: SassPlayground
}, {
    path: '/blog/:blogName',
    component: Blog,
    name: 'blog'
}, 
{
    path: '/virtual-machine',
    name: 'VirtualMachine',
    component: VirtualMachine
}, 
{
    path: '/test',
    name: 'Test',
    component: Test
}]

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;