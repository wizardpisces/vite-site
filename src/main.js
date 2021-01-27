import {
    createApp
} from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import KlkUi from './components'

createApp(App).use(router).use(KlkUi).mount('#app');