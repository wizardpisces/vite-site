import {
    createRouter,
    createWebHistory,
    RouteRecordRaw
} from 'vue-router'
const Test = () => import('./pages/test/index.vue')
const Blog = () => import('./pages/blog/index.vue')
const Home = () => import('./pages/home/index.vue')

const Huffman = () => import('./pages/playground/huffman/index.vue')

const SassPlayground = () => {
    return import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/codemirror.min.js')
        .then(_ =>
            Promise.all([
                import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/mode/css/css.min.js'),
                import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/mode/sass/sass.min.js'),
            ]))
        .then(_ => {
            return import('./pages/playground/sass.vue')
        })

}

const VirtualMachine = () => import('./pages/virtual-machine/index.vue')
const Bookmark = () => import('./pages/bookmark/index.vue')


export {
    routes
}

const routerHistory = createWebHistory()

let routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            title: 'Home hello world'
        }
    },
    {
        path: '/sass',
        name: 'Sass',
        component: SassPlayground,
        meta: {
            title: 'Tiny sass playground'
        }
    },
    {
        path: '/blog/:blogName',
        component: Blog,
        name: 'Blog'
    },
    {
        path: '/bookmark',
        name: 'Bookmark',
        component: Bookmark,
        meta: {
            title: 'Bookmarks'
        }
    },
    {
        path: '/playground/huffman',
        name: 'Huffman',
        component: Huffman,
        meta: {
            title: "huffman online"
        }
    },
]
// @ts-ignore
// console.log(import.meta.env)
// @ts-ignore
if (import.meta.env.DEV) {
    routes = routes.concat(
        {
            path: '/virtual-machine',
            name: 'VirtualMachine',
            component: VirtualMachine,
            meta: {
                title: "virtual machine"
            }
        },
        {
            path: '/test',
            name: 'Test',
            component: Test,
            meta: {
                title: "Test"
            }
        }
    )
}

const router = createRouter({
    history: routerHistory,
    routes
})

router.beforeEach((to, from) => {
    if (to.meta.title) {
        document.title = to.meta.title as string
    }
})

export default router;