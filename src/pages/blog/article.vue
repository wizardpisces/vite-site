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
    font-size: 16px;
    line-height: 1.7;
    color: #2c3e50;

    h1, h2, h3, h4, h5, h6 {
      padding-top: 60px;
      margin-top: -44px;
      font-weight: 600;
      line-height: 1.25;
      
      &:first-child {
        margin-top: 0;
        padding-top: 0;
      }
    }

    h1 {
      font-size: 2em;
      margin-bottom: 1em;
    }

    h2 {
      font-size: 1.65em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
      margin-bottom: 1em;
    }

    h3 {
      font-size: 1.35em;
      margin: 1em 0;
    }

    h4 {
      font-size: 1.15em;
    }

    p {
      margin: 1em 0;
      line-height: 1.7;
    }

    img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin: 1.5em 0;
      display: block;
    }

    pre {
      margin: 1em 0;
      padding: 1.25rem 1.5rem;
      border-radius: 6px;
      background-color: #f6f8fa;
      overflow-x: auto;
      position: relative;
      font-size: 0.85em;
      line-height: 1.6;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        pointer-events: none;
        border-radius: 6px;
      }
    }

    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
      font-size: 0.9em;
      padding: 0.2em 0.4em;
      margin: 0 0.2em;
      border-radius: 4px;
      background-color: rgba(27, 31, 35, 0.05);
      color: #476582;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      margin: 0;
      font-size: 1em;
      color: inherit;
    }

    blockquote {
      margin: 1.5em 0;
      padding: 0.8em 1.2em;
      border-left: 4px solid $color-primary;
      background-color: rgba(66, 185, 131, 0.1);
      border-radius: 0 4px 4px 0;
      color: #476582;

      > p:first-child {
        margin-top: 0;
      }

      > p:last-child {
        margin-bottom: 0;
      }
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 1em 0;

      li {
        margin: 0.5em 0;
        line-height: 1.7;
      }
    }

    hr {
      margin: 2em 0;
      border: none;
      border-top: 1px solid #eaecef;
    }

    table {
      width: 100%;
      margin: 1em 0;
      border-collapse: collapse;

      th, td {
        padding: 0.75em 1em;
        border: 1px solid #eaecef;
      }

      th {
        font-weight: 600;
        background-color: #f6f8fa;
      }

      tr:nth-child(2n) {
        background-color: #fafafa;
      }
    }

    a {
      color: $color-primary;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .loading {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
    font-size: 1.1em;
    
    &::after {
      content: '...';
      animation: loading 1.4s infinite;
    }
  }
}

@keyframes loading {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}
</style> 