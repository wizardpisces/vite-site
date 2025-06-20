<template>
  <div class="blog-article">
    <div v-if="blogContent && !loadingBlog" v-html="blogContent" class="article-content"></div>
    <div v-if="loadingBlog" class="loading">
      Loading...
    </div>
    <Comment :key="blogName"></Comment>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import useBlog from "@/composition/use-blog";
import Comment from '@/components/comment.vue';

export default {
  name: "BlogArticle",
  components: {
    Comment
  },
  setup() {
    const route = useRoute();
    const { blogContent, initBlogByTitle, loadingBlog } = useBlog();
    const blogName = ref(0);

    function initBlog() {
      initBlogByTitle(route.params.blogName as string, route.hash).then(() => {
        location.hash = "";
        location.hash = route.hash;
      });
    }

    watch(
      () => route.params.blogName,
      (newBlogName) => {
        if (route.name === "Blog") {
          document.title = newBlogName + " | Blog";
          initBlog();
          blogName.value++;
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
      blogName
    };
  }
};
</script>

<style lang="scss">
.blog-article {
  .article-content {
    h1, h2, h3, h4, h5, h6 {
      padding-top: 60px;
      margin-top: -44px;
      
      &:first-child {
        margin-top: 0;
        padding-top: 0;
      }
    }

    img {
      max-width: 100%;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    pre {
      padding: 1rem;
      border-radius: 4px;
      background-color: #f6f8fa;
      overflow-x: auto;
    }

    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
      font-size: 0.9em;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      background-color: rgba(27, 31, 35, 0.05);
    }

    blockquote {
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      border-left: 4px solid $color-primary;
      background-color: rgba(66, 185, 131, 0.1);
    }
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
}
</style> 