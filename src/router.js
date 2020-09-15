import {
    createRouter,
    createWebHistory
} from 'vue-router'
import Blog from './blog/index.vue'
import NuxtBlog from './blog/nuxt.vue'
import SourceMapBlog from './blog/source-map.vue'
import VueSsrBlog from './blog/vue-ssr.vue'

import SassPlayground from './playground/sass.vue'

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
}]

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;