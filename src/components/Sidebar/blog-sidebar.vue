<template>
  <nav class="blog-sidebar">
    <div class="blog-categories">
      <tree-folder :folder='categoryGroup'></tree-folder>
    </div>
  </nav>
</template>

<script lang='ts'>
import useBlog from "@/composition/use-blog";
import TreeFolder from "./tree-folder.vue";

export default {
  name: "BlogSidebar",
  components: {
    TreeFolder,
  },
  setup() {
    const { categoryGroup } = useBlog();
    return {
      categoryGroup,
    };
  },
};
</script>

<style lang="scss">
.blog-sidebar {
  padding: 1.5rem 0;
  
  .blog-categories {
    padding: 0 1rem;
  }
}
</style>