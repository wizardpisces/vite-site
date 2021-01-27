<template>
  <div id="app-2">
    <klk-tabs
      v-model="route.name"
      @tab-click="onTabClick"
    >
      <klk-tab-panel
        v-for="route in routes"
        :key='route.name'
        :name='route.name'
      >
        <!-- <router-link :to="menu.route">{{menu.name}}</router-link> -->
      </klk-tab-panel>
    </klk-tabs>
    <router-view />
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routes } from './router'
export default {
  name: 'App',
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
