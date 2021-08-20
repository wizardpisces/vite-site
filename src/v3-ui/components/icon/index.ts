import { App } from 'vue'

import Icon from './src/icon.vue';
import '../../styles/components/icon.scss'

Icon.install = function (app: App) {
    app.component(Icon.name, Icon);
};

export default Icon;
