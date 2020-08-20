import {createRouter,createWebHistory} from 'vue-router'
import BlogVueSsr from './blog/vue-ssr.vue'

const routerHistory = createWebHistory()

const routes = [{
    path: '/blog/vue-ssr',
    component: BlogVueSsr
}]

const router = createRouter({
    history:routerHistory,
    routes // short for `routes: routes`
})

export default router;