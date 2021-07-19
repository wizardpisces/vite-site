<template>
  <div class="blog">
    <aside class='sidebar'>
      <tree-folder :folder='categoryGroup'></tree-folder>
    </aside>
    <main class='page'>
      <div class="content">
        <p v-html="blogContent"></p>
        <Circular :check="4"></Circular>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import useBlog from "./composition/use-blog";
import TreeFolder from "./tree-folder.vue";
import A from "./a.vue";
export default {
  name: "BlogVueSSr",
  components: {
    TreeFolder,
    Circular: A,
  },
  setup() {
    let { categoryGroup, blogContent } = useBlog();

    return {
      blogContent,
      categoryGroup,
    };
  },
};

</script>
<style lang="scss">
.blog {
  .sidebar {
    font-size: 16px;
    background-color: #fff;
    width: 300px;
    position: fixed;
    z-index: 10;
    margin: 0;
    top: 50px;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    border-right: 1px solid #eaecef;
    overflow-y: auto;
  }
  .page {
    padding-left: 200px;
    display: block;
    .content {
      max-width: 740px;
      margin: 0 auto;
    }
  }
}
</style>
