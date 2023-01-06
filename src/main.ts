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

console.log(nameof(window.alert));

createApp(App)
    .use(router)
    .use(store, key)
    .use(v3Ui)
    .mount('#app');