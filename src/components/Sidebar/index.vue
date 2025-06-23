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
$sidebar-width: 260px;
.sidebar {
  font-size: 16px;
  background-color: #fff;
  position: fixed;
  z-index: 100;
  margin: 0;
  top: 50px;
  left: 0;
  bottom: 0;
  width: $sidebar-width;
  box-sizing: border-box;
  border-right: 1px solid #eaecef;
  overflow-y: auto;
  
  .nav-links {
    display: none;
    border-bottom: 1px solid #eaecef;
  }

  .mobile-only {
    display: none;
  }
}

@media (max-width: 719px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    
    .mobile-only {
      display: block;
    }
    
    &.sidebar-open {
      transform: translateX(0);
    }
  }
}
</style>