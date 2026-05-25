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
  background: #f7f4ed;
  position: fixed;
  z-index: 100;
  margin: 0;
  top: 70px;
  left: 0;
  bottom: 0;
  width: $sidebar-width;
  box-sizing: border-box;
  border-right: 1px solid #d8d0c4;
  overflow-y: auto;
  transition: transform 0.3s ease, opacity 0.3s ease;

  &.sidebar-collapsed {
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }
  box-shadow: none;
  
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
    background: #f7f4ed;
  }

  .mobile-only {
    display: none;
  }
}

@media (max-width: 719px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    background: #f7f4ed;
    
    .mobile-only {
      display: block;
    }
    
    &.sidebar-open {
      transform: translateX(0);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
    }
  }
}
</style>
