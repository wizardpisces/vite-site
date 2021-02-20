import Tabs from './components/tabs'
import Button from './components/button'
import Message from './components/message'

const components = {
    Tabs,
    Button,
    Message
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