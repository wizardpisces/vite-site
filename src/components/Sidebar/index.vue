<template>
  <aside class='sidebar'>
    <!-- 支持小屏幕的 NavLinks -->
    <NavLinks></NavLinks>
    <BlogSidebar v-if="route.path.startsWith('/blog/')"></BlogSidebar>
  </aside>
</template>

<script lang='ts'>
import { useRoute } from "vue-router";
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
    return {
      route,
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
}

@media (max-width: 719px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    
    .nav-links {
      display: block;
    }
    
    &.sidebar-open {
      transform: translateX(0);
    }
  }
}
</style>