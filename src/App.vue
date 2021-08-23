<template>
  <header class="navbar">
    <v3-icon
      type="menu"
      size="20"
      class="mobile-menu-button"
      @click="onSideBarToggle"
    ></v3-icon>
    <nav-links></nav-links>
  </header>
  <sidebar :class="sidebarClass"></sidebar>
  <main class="content">
    <router-view />
  </main>
</template>

<script lang="ts">
import { computed, ref } from "@vue/runtime-core";
import NavLinks from "./components/navLinks.vue";
import Sidebar from "./components/sidebar.vue";

export default {
  name: "App",
  components: {
    NavLinks,
    Sidebar,
  },
  setup(props, ctx) {
    let sideBarOpened = ref(false);

    function onSideBarToggle() {
      sideBarOpened.value = !sideBarOpened.value;
    }

    let sidebarClass = computed(() => {
      return {
        "sidebar-open": sideBarOpened.value,
      };
    });

    return {
      sidebarClass,
      onSideBarToggle,
    };
  },
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  & > .navbar {
    display: flex;
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
  }

  &>.sidebar-open {
      transform: translateX(0);
  }

  & > .content {
    padding-top: 50px;
  }
  .mobile-menu-button {
    cursor: pointer;
    display: none;
    margin: 16px 10px 0 20px;
  }
  @import "./mobile.scss";
}
</style>