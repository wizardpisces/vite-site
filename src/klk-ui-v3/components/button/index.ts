import { App } from 'vue'

import Button from './src/button.vue';
import '../../styles/components/button.scss'

Button.install = function (app: App) {
    app.component(Button.name, Button);
};

export default Button;
