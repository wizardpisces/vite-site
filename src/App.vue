<template>
  <header class="navbar">
    <v3-icon
      ref="menuRef"
      type="menu"
      size="20"
      class="mobile-menu-button"
      @click="onSideBarToggle()"
    ></v3-icon>
    <nav-links></nav-links>
    <!-- <img :src="logo" alt=""> -->
  </header>
  <sidebar
    :class="sidebarClass"
    v-clickoutside = "hideSidebar"
  ></sidebar>
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
    /**
     * TypeError: Failed to construct 'URL': Invalid URL
     * https://github.com/vitejs/vite/issues/5558
     */
    // let logo = new URL('./assets/logo.png',import.meta?.url).href
    let sideBarOpened = ref(false),
        menuRef = ref<HTMLDivElement>();

    function onSideBarToggle() {
      sideBarOpened.value = !sideBarOpened.value;
    }
    function hideSidebar(e:Event) {
      // 符合以下两种情况，说明切换按钮被主动点击了
      if(e.target === (menuRef.value as any).$el || (menuRef.value as any).$el.contains(e.target)){
        return;
      }
      sideBarOpened.value = false
    }

    let sidebarClass = computed(() => {
      return {
        "sidebar-open": sideBarOpened.value,
      };
    });

    return {
      sidebarClass,
      onSideBarToggle,
      hideSidebar,
      sideBarOpened,
      menuRef,
      // logo
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
    height: 58px;
    line-height: 28px;
    background-color: #fff;
    box-sizing: border-box;
    border-bottom: 1px solid #eaecef;
    padding: 16px 24px;
  }

  & > .sidebar-open {
    transform: translateX(0);
  }

  & > .content {
    padding-top: 58px;
  }
  .mobile-menu-button {
    display: none;
  }
  @import "./mobile.scss";
}
</style>