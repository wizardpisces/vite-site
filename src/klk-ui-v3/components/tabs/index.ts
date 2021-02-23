import { App } from 'vue'

import Tabs from './src/tabs.vue';
import TabPanel from './src/tab-panel.vue';
import {
    SFCWithInstall
} from '../../utils/types'
import '../../styles/components/tabs.scss'

Tabs.install = function (app: App) {
    app.component(Tabs.name, Tabs);
    app.component(TabPanel.name, TabPanel);
};

const _tabs: SFCWithInstall<typeof Tabs> = Tabs

export default _tabs;
