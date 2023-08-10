import {
  createRouter,
  createWebHistory,
  RouteRecordRaw
} from 'vue-router'
const Test = () => import('./pages/test/index.vue')
const NotFound = () => import('./pages/not-found/index.vue')
const Blog = () => import('./pages/blog/index.vue')
const Home = () => import('./pages/home/index.vue')
const SubAppReact = () => import("./pages/sub-app-react/index.vue");

const Huffman = () => import('./pages/playground/huffman/index.vue')
const JSONSchema = () => import('./pages/playground/typescript-json-schema/index.vue')

const SassPlayground = () => {
  // @ts-ignore
  return import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/codemirror.min.js')
    .then(_ =>
      Promise.all([
        // @ts-ignore
        import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/mode/css/css.min.js'),
        // @ts-ignore
        import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/mode/sass/sass.min.js'),
      ]))
    .then(_ => {
      return import('./pages/playground/sass.vue')
    })

}

const VirtualMachine = () => import('./pages/virtual-machine/index.vue')
const Bookmark = () => import('./pages/bookmark/index.vue')

const MachineLearning = () => import('./pages/machine-learning/index.vue')

const routerHistory = createWebHistory()

export let navRoutes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Home hello world",
    }
  },
  {
    path: "/sass",
    name: "Sass",
    component: SassPlayground,
    meta: {
      title: "Tiny sass playground",
    },
  },
  {
    path: "/blog/:blogName",
    component: Blog,
    name: "Blog",
  },
  {
    path: "/playground/huffman",
    name: "Huffman",
    component: Huffman,
    meta: {
      title: "huffman online",
    },
  },{
    path: "/machine-learning",
    name: "MachineLearning",
    component: MachineLearning,
    meta: {
      title: "Machine Learning",
    },
  }
];

// @ts-ignore
if (import.meta.env.DEV) {
  navRoutes = navRoutes.concat(
    {
      path: "/virtual-machine",
      name: "VirtualMachine",
      component: VirtualMachine,
      meta: {
        title: "virtual machine",
      },
    },
    {
      path: "/test",
      name: "Test",
      component: Test,
      meta: {
        title: "Test",
      },
    },
    {
      path: "/app-react",
      name: "SubAppReact",
      component: SubAppReact,
    },
    {
      path: "/bookmark",
      name: "Bookmark",
      component: Bookmark,
      meta: {
        title: "Bookmarks",
      },
    },
    {
      path: "/playground/typescript-json-schema",
      name: "TypeScript-Json-Schema",
      component: JSONSchema,
      meta: {
        title: "typescript json schema playground",
      },
    }
  );
}

let routes: RouteRecordRaw[] = navRoutes.concat([
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
    meta:{
      title: "not found - test en-SG for liuze'blog and tiny- sass - compiler's demo"
    }
  }
]);

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