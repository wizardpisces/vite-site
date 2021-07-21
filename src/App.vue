<template>
  <div id="app">
    <header class="navbar">
      <a
        class="github"
        target="__blank"
        href="https://github.com/wizardpisces"
      >Github home
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          x="0px"
          y="0px"
          viewBox="0 0 100 100"
          width="15"
          height="15"
          class="icon outbound"
        >
          <path
            fill="currentColor"
            d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
          ></path>
          <polygon
            fill="currentColor"
            points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
          ></polygon>
        </svg>
      </a>

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
      color: inherit;
      font-weight: 500;
      .icon {
        color: #aaa;
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