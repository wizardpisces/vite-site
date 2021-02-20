import Tabs from './src/tabs.vue';
import TabPanel from './src/tab-panel.vue';
import '../../styles/components/tabs.scss'

Tabs.install = function (Vue) {
    Vue.component(Tabs.name, Tabs);
    Vue.component(TabPanel.name, TabPanel);
};

export default Tabs;
