import Button from './button.vue';
import '../style/components/button.scss'

Button.install = function (Vue) {
    Vue.component(Button.name, Button);
};

export default Button;
