import Button from './src/button.vue';
import '../../styles/components/button.scss'

Button.install = function (Vue) {
    Vue.component(Button.name, Button);
};

export default Button;
