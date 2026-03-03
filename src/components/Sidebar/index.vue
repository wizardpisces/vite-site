<template>
  <aside class='sidebar' :class="{ 'sidebar-collapsed': !showLeftSidebar }" v-if="shouldShowSidebar">
    <NavLinks class="mobile-only"></NavLinks>
    <BlogSidebar v-if="route.path.startsWith('/blog/')"></BlogSidebar>
  </aside>
</template>

<script lang='ts'>
import { useRoute } from "vue-router";
import { computed } from 'vue';
import NavLinks from "../navLinks.vue";
import BlogSidebar from "./blog-sidebar.vue";
import useLayout from "@/composition/use-layout";

export default {
  name: "Sidebar",
  components: {
    NavLinks,
    BlogSidebar,
  },
  setup() {
    const route = useRoute();
    const { showLeftSidebar } = useLayout();

    const shouldShowSidebar = computed(() => {
      return route.path.startsWith('/blog/');
    });

    return {
      route,
      shouldShowSidebar,
      showLeftSidebar,
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
  transition: transform 0.3s ease, opacity 0.3s ease;

  &.sidebar-collapsed {
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }
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