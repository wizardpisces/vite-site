import {
    createApp
} from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import KlkUi from './klk-ui-v3'

createApp(App).use(router).use(KlkUi).mount('#app');