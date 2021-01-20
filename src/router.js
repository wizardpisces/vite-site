import {
    createRouter,
    createWebHistory
} from 'vue-router'
import Vue3Test from './pages/vue3-test/menu.vue'
import Blog from './pages/blog/index.vue'
import NuxtBlog from './pages/blog/nuxt.vue'
import SourceMapBlog from './pages/blog/source-map.vue'
import VueSsrBlog from './pages/blog/vue-ssr.vue'

import SassPlayground from './pages/playground/sass.vue'

const routerHistory = createWebHistory()

const routes = [{
    path: '/blog',
    component: Blog,
    children: [{
            path: 'nuxt',
            component: NuxtBlog
        },
        {
            path: 'source-map',
            component: SourceMapBlog
        },
        {
            path: 'vue-ssr',
            component: VueSsrBlog
        },
    ]
}, {
    path: '/',
    component: SassPlayground
}, {
    path: '/vue3-test',
    component: Vue3Test
}]

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;