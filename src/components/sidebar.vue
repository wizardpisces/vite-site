<template>
  <aside class='sidebar'>
    <NavLinks></NavLinks>
    <BlogSidebar v-if="route.name === 'blog'"></BlogSidebar>
  </aside>
</template>
<script lang='ts'>
import { useRoute } from "vue-router";
import NavLinks from "./navLinks.vue";
import BlogSidebar from "../pages/blog/blogSidebar.vue";

export default {
  components: {
    NavLinks,
    BlogSidebar,
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
};
</script>
<style lang="scss">
$sidebar-width: 260px;
.sidebar {
  font-size: 16px;
  background-color: #fff;
  width: $sidebar-width;
  position: fixed;
  z-index: 10;
  margin: 0;
  top: 50px;
  left: 0;
  bottom: 0;
  box-sizing: border-box;
  border-right: 1px solid #eaecef;
  overflow-y: auto;
  .nav-links {
    display: none;
  }
}

@media (max-width: 719px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    .nav-links {
      display: block;
    }
  }
}
</style>