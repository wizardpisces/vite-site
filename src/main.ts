import {
    createApp
} from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import KlkUi from './klk-ui-v3'
import store,{key} from './store'
createApp(App)
    .use(router)
    .use(store, key)
    .use(KlkUi)
    .mount('#app');