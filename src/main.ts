import {
    createApp
} from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import v3Ui from './v3-ui'
import store,{key} from './store'
// inject svg sprites
import 'virtual:svg-icons-register';

createApp(App)
    .use(router)
    .use(store, key)
    .use(v3Ui)
    .mount('#app');