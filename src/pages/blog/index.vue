<template>
  <div class="blog">
    <aside class='sidebar'>
      <tree-folder :folder='categoryGroup'></tree-folder>
    </aside>
    <main class='page'>
      <div class="content">
        <p
          v-if="blogContent && !loadingBlog"
          v-html="blogContent"
        ></p>
        <h2 v-else>Loading blog ....</h2>
        <!-- <Circular :check="4"></Circular> -->
        below is a md2html test:<p v-html="introduction"></p>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import useBlog from "./composition/use-blog";
import TreeFolder from "./tree-folder.vue";
import { html as introduction } from "../../blog/introduction.md";
import A from "./a.vue";
export default {
  name: "BlogVueSSr",
  components: {
    TreeFolder,
    Circular: A,
  },
  setup() {
    let route = useRoute();
    let { categoryGroup, blogContent, initBlogByTitle, loadingBlog } =
      useBlog();
    onMounted(() => {
      initBlogByTitle(route.params.blogName as string);
    });
    return {
      blogContent,
      categoryGroup,
      loadingBlog,
      introduction,
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
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        padding-top: 60px;
        margin-top: -44px;
      }
    }
  }
}
</style>
