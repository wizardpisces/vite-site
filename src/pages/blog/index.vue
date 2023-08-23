<template>
  <div class="blog">
    <main class="page">
      <div class="content">
        <p v-if="blogContent && !loadingBlog" v-html="blogContent"></p>
        <h2 v-show="false">
          Loading blog .... below is a md2html test:
          <p v-html="Introduction"></p>
        </h2>
        <p></p>
        <Comment :key="blogName"></Comment>
        <!-- <Circular :check="4"></Circular> -->
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import useBlog from "@/composition/use-blog";
import { html as Introduction } from "@/blog/introduction.md";
import A from "./a.vue";
import Comment from '@/components/comment.vue'

export default {
  name: "BlogVueSSr",
  components: {
    Circular: A,
    Comment
  },
  setup() {
    let route = useRoute();
    let { blogContent, initBlogByTitle, loadingBlog } = useBlog();
    function initBlog() {
      initBlogByTitle(route.params.blogName as string, route.hash).then((_) => {
        location.hash = "";
        location.hash = route.hash;
      });
    }
    const num = ref(0)
    watch(
      () => route.params.blogName,
      (newBlogName) => {
        if (route.name === "Blog") {
          document.title = newBlogName + " | Blog";
          initBlog();
          num.value++
        }
      },
      {
        immediate: true,
      }
    );

    onMounted(() => {
      initBlog();
    });

    return {
      blogContent,
      loadingBlog,
      Introduction,
      blogName: num,
    };
  },
};
</script>
<style lang="scss">
// @import url('https://cdn.jsdelivr.net/highlight.js/9.1.0/styles/github.min.css');
$sidebar-width: 260px;
.blog {
  .page {
    padding-left: $sidebar-width;
    display: block;
    .content {
      max-width: 740px;
      padding: 0 20px;
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
    img {
      width: 100%;
    }
  }
}
@media (max-width: 719px) {
  .blog {
    .page {
      padding-left: 0;
    }
  }
}
</style>
