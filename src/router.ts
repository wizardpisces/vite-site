import {
    createRouter,
    createWebHistory
} from 'vue-router'
const Test = () => import('./pages/test/index.vue')
const Blog = () => import('./pages/blog/index.vue')
const Home = () => import('./pages/home/index.vue')
const SassPlayground = () => import('./pages/playground/sass.vue')
const VirtualMachine = () => import('./pages/virtual-machine/index.vue')
const Bookmark = () => import('./pages/bookmark/index.vue')


export {
    routes
}

const routerHistory = createWebHistory()

let routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/sass',
        name: 'Sass',
        component: SassPlayground
    },
    {
        path: '/blog/:blogName',
        component: Blog,
        name: 'Blog'
    },
    {
        path: '/bookmark',
        name: 'Bookmark',
        component: Bookmark
    },
]
// @ts-ignore
// console.log(import.meta.env)
// @ts-ignore
if (import.meta.env.DEV){
    routes = routes.concat(
        {
            path: '/virtual-machine',
            name: 'VirtualMachine',
            component: VirtualMachine
        },
        {
            path: '/test',
            name: 'Test',
            component: Test
        },
    )
}

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;