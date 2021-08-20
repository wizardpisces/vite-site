<template>
  <div id="app">
    <header class="navbar">
      <a
        class="github"
        target="__blank"
        href="https://github.com/wizardpisces"
      >Github home
      <v3-icon type="outbound" size="16" color="#aaa"></v3-icon>
      <v3-icon type="menu"></v3-icon>
      </a>

      <v3-tabs
        v-model="route.name"
        @tab-click="onTabClick"
      >
        <v3-tab-panel
          v-for="route in routes"
          :key='route.name'
          :name='route.name'
        >
          <!-- <router-link :to="menu.route">{{menu.name}}</router-link> -->
        </v3-tab-panel>
      </v3-tabs>
    </header>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import { routes } from './router'

export default {
  name: 'App',
  setup(props, ctx) {
    let route = useRoute(),
      router = useRouter();

    function onTabClick(name) {
      let path = routes.filter(route => route.name === name)[0].path

      if(name=== 'blog'){
        router.push({path:'/blog/introduction'})
      }else{
        router.push({ path })
      }
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  & > .navbar {
    position: fixed;
    z-index: 20;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    line-height: 30px;
    background-color: #fff;
    box-sizing: border-box;
    border-bottom: 1px solid #eaecef;
    .github {
      position: fixed;
      right: 20px;
      top: 10px;
    }
    a {
      display: inline-block;
      color:inherit;
      font-weight: 500;
      .v3-icon {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        top: -1px;
      }
    }
  }

  & > .content {
    padding-top: 50px;
  }
}
</style>