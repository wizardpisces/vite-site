import Tabs from './tabs'
import Button from './button'

const components = {
    Tabs,
    Button
}

function install(Vue, opts = {}) {
    Object.keys(components).forEach((key) => {
        Vue.use(components[key]);
    });
}

if (typeof window !== 'undefined' && window.Vue) install(window.Vue);

export {
    install
}

export default {
    ...components,
    install
}