<template>
  <div id="app">
    <tabs v-model="active">
      {{active}}
      <tab-panel
        v-for="menu in menuList"
        :key='menu.name'
        :name='menu.name'
      >
        <router-link :to="menu.route">{{menu.name}}</router-link>
      </tab-panel>
    </tabs>
    <router-view />
  </div>
</template>

<script>
import { ref } from 'vue'
import { Tabs, TabPanel } from './components/tabs'

export default {
  name: 'App',
  components: {
    TabPanel,
    Tabs
  },
  setup(props, ctx) {
    let active = ref('Home')
    const menuList = [
      {
        route: '/',
        name: 'Home'
      },
      {
        route: '/blog',
        name: 'Blog'
      },
      {
        route: '/vue3-test',
        name: 'Vue3-test'
      },
    ]

    return {
      menuList,
      active
    }
  }
}
</script>
<style lang="scss">
#app {
  .head-menu {
    display: flex;
    flex-direction: row;
    margin: 5px 0;
    padding: 0;
    li {
      display: flex;
      padding: 10px;
      &:first-child {
        padding-left: 0;
      }
    }
  }
}
</style>
