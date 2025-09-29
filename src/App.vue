<template>
  <header class="navbar">
    <v3-icon
      ref="menuRef"
      type="menu"
      size="20"
      class="mobile-menu-button"
      @click="onSideBarToggle()"
    ></v3-icon>
    <!-- 主要用在宽屏，窄屏会隐藏，触发 sidebar 中包含的 nav -->
    <nav-links></nav-links>
    <!-- <img :src="logo" alt=""> -->
  </header>
  <sidebar
    :class="sidebarClass"
    v-clickoutside = "hideSidebar"
  ></sidebar>
  <main class="content">
    <router-view v-slot="{ Component, route }">
      <transition 
        :name="getTransitionName(route)"
        mode="out-in"
        @enter="onEnter"
        @leave="onLeave"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </main>
</template>

<script lang="ts">
import { computed, ref } from "@vue/runtime-core";
import NavLinks from "./components/navLinks.vue";
import Sidebar from "./components/sidebar/index.vue";

export default {
  name: "App",
  components: {
    NavLinks,
    Sidebar,
  },
  setup(props, ctx) {
    // 页面转换动画逻辑
    function getTransitionName(route: any) {
      if (route.name === 'Home') return 'slide-down';
      if (route.path.startsWith('/blog')) return 'slide-up';
      return 'fade';
    }
    
    function onEnter(el: any) {
      // 页面进入时的微交互
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    }
    
    function onLeave(el: any) {
      el.style.transition = 'all 0.3s ease-out';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
    }
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
      // console.log(menuRef.value,menuRef.value?.$el)
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
      getTransitionName,
      onEnter,
      onLeave,
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
    align-items: center;
    position: fixed;
    z-index: 101;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: rgba(250, 250, 250, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-sizing: border-box;
    border-bottom: 1px solid rgba(37, 99, 235, 0.1);
    padding: 0 2.5rem;
    box-shadow: 
      0 4px 20px rgba(37, 99, 235, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    
    // 重新设计的底部分界线
    &::before {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 5%;
      right: 5%;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(37, 99, 235, 0.2) 10%,
        rgba(37, 99, 235, 0.4) 30%, 
        rgba(14, 165, 233, 0.5) 50%, 
        rgba(37, 99, 235, 0.4) 70%,
        rgba(37, 99, 235, 0.2) 90%, 
        transparent 100%
      );
      border-radius: 1px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
    
    // 添加动态背景装饰
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -10%;
      width: 120%;
      height: 200%;
      background: radial-gradient(ellipse 800px 100px at 50% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 70%);
      animation: float-header 15s ease-in-out infinite;
      z-index: -1;
      pointer-events: none;
    }
  }

  & > .content {
    padding-top: 70px;
    
    @media (max-width: 719px) {
      padding-left: 0;
    }
  }

  .mobile-menu-button {
    display: none;
    margin-right: 1rem;
    cursor: pointer;
    color: $color-text-secondary;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    
    &:hover {
      color: $color-primary;
      background: $color-bg-subtle;
    }
  }

  @media (max-width: 719px) {
    .mobile-menu-button {
      display: block;
    }
    
    .navbar .nav-links {
      display: none;
    }
  }
}

// 独特的页面转换动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.98);
  filter: blur(4px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(1.02);
  filter: blur(2px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px) rotateX(8deg);
  transform-origin: center bottom;
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px) rotateX(-4deg);
  transform-origin: center top;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// Header动画
@keyframes float-header {
    0%, 100% { transform: translateX(0px) scaleX(1); }
    33% { transform: translateX(20px) scaleX(1.1); }
    66% { transform: translateX(-10px) scaleX(0.95); }
}
</style>