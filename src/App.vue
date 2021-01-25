<template>
  <div id="app">
    <tabs
      v-model="route.name"
      @tab-click="onTabClick"
    >
      <tab-panel
        v-for="route in routes"
        :key='route.name'
        :name='route.name'
      >
        <!-- <router-link :to="menu.route">{{menu.name}}</router-link> -->
      </tab-panel>
    </tabs>
    <router-view />
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { Tabs, TabPanel } from './components/tabs'
import { useRoute, useRouter } from 'vue-router'
import { routes } from './router'
export default {
  name: 'App',
  components: {
    TabPanel,
    Tabs
  },
  setup(props, ctx) {
    let route = useRoute(),
      router = useRouter();

    // console.log('route',route.query,route.params)
    function onTabClick(name) {
      let path = routes.filter(route => route.name === name)[0].path
      router.push({ path })
    }

    return {
      routes,
      route,
      onTabClick
    }
  }
}
</script>
<style lang="scss">
#app {
 padding:10px;
}
</style>
