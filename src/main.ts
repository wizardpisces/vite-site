import {
    createApp
} from 'vue'
import App from './App.vue'
import router from './router'
import v3Ui from './v3-ui'
import store,{key} from './store'
// inject svg sprites
import 'virtual:svg-icons-register';
import nameof from "ts-nameof.macro";

// 以下是不同的微前端框架
import microApp from '@micro-zoe/micro-app'
import WujieVue from "wujie-vue3";

console.log(nameof(window.alert));

createApp(App)
.use(router)
.use(store, key)
.use(v3Ui)
.use(WujieVue)
.mount('#app');


microApp.start()


const { bus, setupApp, preloadApp, destroyApp } = WujieVue;
// 在 xxx-sub 路由下子应用将激活路由同步给主应用，主应用跳转对应路由高亮菜单栏
bus.$on("sub-route-change", (name:string, path:string) => {
    // const mainName = `${name}-sub`;
    // const mainPath = `/${name}-sub${path}`;
    // const currentName = router.currentRoute.name;
    // const currentPath = router.currentRoute.path;
    // if (mainName === currentName && mainPath !== currentPath) {
    //     router.push({ path: mainPath });
    // }
});
