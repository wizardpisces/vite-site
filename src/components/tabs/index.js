import Tabs from './tabs.vue';
import TabPanel from './tab-panel.vue';
import '../style/components/tabs.scss'

Tabs.install = function (Vue) {
    Vue.component(Tabs.name, Tabs);
    Vue.component(TabPanel.name, TabPanel);
};

export default Tabs;
