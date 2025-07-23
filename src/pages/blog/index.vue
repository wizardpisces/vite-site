<template>
  <div class="blog-container">
    <blog-search class="blog-search-component"></blog-search>
    <div class="blog-content">
      <router-view></router-view>
    </div>
    <right-toc :headers="activeSubHeaders"></right-toc>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import useBlog from "@/composition/use-blog";
import RightToc from "@/components/sidebar/right-toc.vue";
import BlogSearch from "@/components/blog-search.vue";

export default {
  name: "Blog",
  components: {
    RightToc,
    BlogSearch
  },
  setup() {
    const { activeBlog } = useBlog();
    const activeSubHeaders = computed(() => activeBlog.value.subHeaders || []);

    return {
      activeSubHeaders
    };
  }
};
</script>

<style lang="scss">
.blog-container {
  padding-right: 240px;
  
  .blog-search-component {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem 2.5rem;
  }
  
  .blog-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 2.5rem;
  }

  @media (max-width: 959px) {
    padding-right: 0;
  }
}
</style>
