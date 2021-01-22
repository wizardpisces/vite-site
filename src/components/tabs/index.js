import Tabs from './tabs.vue';
import TabPanel from './tab-panel.vue';

Tabs.install = function (Vue) {
    Vue.component(Tabs.name, Tabs);
    Vue.component(TabPanel.name, TabPanel);
};

export {
    Tabs,
    TabPanel,
};

export default Tabs;
