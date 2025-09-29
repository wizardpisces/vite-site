<template>
  <aside class='sidebar' v-if="shouldShowSidebar">
    <NavLinks class="mobile-only"></NavLinks>
    <BlogSidebar v-if="route.path.startsWith('/blog/')"></BlogSidebar>
  </aside>
</template>

<script lang='ts'>
import { useRoute } from "vue-router";
import { computed } from 'vue';
import NavLinks from "../navLinks.vue";
import BlogSidebar from "./blog-sidebar.vue";

export default {
  name: "Sidebar",
  components: {
    NavLinks,
    BlogSidebar,
  },
  setup() {
    const route = useRoute();
    
    // 只在博客页面或移动端显示侧边栏
    const shouldShowSidebar = computed(() => {
      return route.path.startsWith('/blog/');
    });

    return {
      route,
      shouldShowSidebar
    };
  },
};
</script>

<style lang="scss">
$sidebar-width: 280px;

.sidebar {
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: fixed;
  z-index: 100;
  margin: 0;
  top: 70px;
  left: 0;
  bottom: 0;
  width: $sidebar-width;
  box-sizing: border-box;
  border-right: 1px solid rgba(37, 99, 235, 0.15);
  overflow-y: auto;
  box-shadow: 
    0 0 20px rgba(37, 99, 235, 0.08),
    inset 1px 0 0 rgba(255, 255, 255, 0.5);
  
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  }
  
  .nav-links {
    display: none;
    border-bottom: 1px solid $color-border-light;
    background: $color-bg-subtle;
  }

  .mobile-only {
    display: none;
  }
}

@media (max-width: 719px) {
  .sidebar {
    transform: translateX(-100%);
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    
    .mobile-only {
      display: block;
    }
    
    &.sidebar-open {
      transform: translateX(0);
      box-shadow: 0 0 50px 0 rgba(0, 0, 0, 0.15);
    }
  }
}
</style>