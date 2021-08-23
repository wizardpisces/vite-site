import {
    createRouter,
    createWebHistory
} from 'vue-router'
const Test = () => import('./pages/test/index.vue')
const Blog = () => import('./pages/blog/index.vue')
const SassPlayground = () => import('./pages/playground/sass.vue')
const VirtualMachine = () => import('./pages/virtual-machine/index.vue')
const Bookmark = () => import('./pages/bookmark/index.vue')

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
// {
//     path: '/virtual-machine',
//     name: 'VirtualMachine',
//     component: VirtualMachine
// }, 
{
    path: '/test',
    name: 'Test',
    component: Test
},
{
    path: '/bookmark',
    name: 'Bookmark',
    component: Bookmark
},
]

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;