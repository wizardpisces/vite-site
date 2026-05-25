<template>
  <div class="blog-article">
    <div 
      v-if="blogContent && !loadingBlog && contentReady" 
      v-html="blogContent" 
      class="article-content"
      :class="`font-${currentFontSize}`"
    ></div>
    
    <div v-else-if="shouldShowLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载文章内容...</div>
    </div>

    <section v-if="contentReady" class="article-comments">
      <button
        v-if="!commentPanelOpen"
        class="comment-toggle"
        type="button"
        @click="commentPanelOpen = true"
      >
        查看讨论
      </button>
      <Comment
        v-else
        :key="commentId"
        :comment-id="commentId"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch, inject, nextTick, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import useBlog from "@/composition/use-blog";
import 'katex/dist/katex.min.css';

export default {
  name: "BlogArticle",
  components: {
    Comment: defineAsyncComponent(() => import('@/components/comment.vue'))
  },
  setup() {
    const route = useRoute();
    const { blogContent, initBlogByTitle, loadingBlog } = useBlog();
    const contentReady = ref(false);
    const shouldShowLoading = ref(false);
    const commentPanelOpen = ref(false);
    const commentId = computed(() => route.path);
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;

    const currentFontSize = inject('currentFontSize', ref('medium'));

    function initBlog() {
      contentReady.value = false;
      shouldShowLoading.value = false;
      
      // 清除之前的定时器
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      
      // 3秒后如果还没加载完成才显示loading
      loadingTimer = setTimeout(() => {
        if (!contentReady.value) {
          shouldShowLoading.value = true;
        }
      }, 3000);
      
      initBlogByTitle(route.params.blogName as string, route.hash).then(() => {
        // 内容加载完成，清除定时器
        if (loadingTimer) {
          clearTimeout(loadingTimer);
          loadingTimer = null;
        }
        shouldShowLoading.value = false;
        
        nextTick(() => {
          contentReady.value = true;
          setTimeout(() => {
            location.hash = "";
            location.hash = route.hash;
          }, 100);
        });
      }).catch(() => {
        // 如果加载出错，也要清除定时器
        if (loadingTimer) {
          clearTimeout(loadingTimer);
          loadingTimer = null;
        }
        shouldShowLoading.value = false;
      });
    }

    watch(
      () => route.params.blogName,
      (newBlogName) => {
        if (route.name === "Blog") {
          document.title = newBlogName + " | Blog";
          commentPanelOpen.value = false;
          initBlog();
        }
      },
      {
        immediate: true,
      }
    );

    onMounted(() => {
      initBlog();
    });
    
    onUnmounted(() => {
      // 组件卸载时清除定时器
      if (loadingTimer) {
        clearTimeout(loadingTimer);
        loadingTimer = null;
      }
    });

    return {
      blogContent,
      loadingBlog,
      currentFontSize,
      contentReady,
      shouldShowLoading,
      commentPanelOpen,
      commentId,
    };
  }
};
</script>

<style lang="scss">
.blog-article {
  background: #f7f4ed;
  min-height: calc(100vh - 70px);
  position: relative;

  .article-content {
    max-width: 100%;
    width: 100%;
    padding: 40px 56px 56px;
    font-size: 15px;
    line-height: 1.6;
    color: $color-text-primary;
    position: relative;
    z-index: 1;
    
    // 字体大小变化类
    &.font-small {
      font-size: 14px;
      line-height: 1.5;
    }
    
    &.font-medium {
      font-size: 15px;
      line-height: 1.6;
    }
    
    &.font-large {
      font-size: 17px;
      line-height: 1.7;
    }
    
    &.font-xlarge {
      font-size: 19px;
      line-height: 1.8;
    }

    h1, h2, h3, h4, h5, h6 {
      padding-top: 60px;
      margin-top: -44px;
      font-weight: 500;
      line-height: 1.25;
      color: $color-text-primary;
      
      &:first-child {
        margin-top: 0;
        padding-top: 0;
      }
    }

    h1 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 2.4em;
      font-weight: 400;
      margin-bottom: 1em;
    }

    h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.8em;
      padding-bottom: 0.65em;
      border-bottom: 1px solid #d8d0c4;
      margin: 2.5em 0 1.5em;
      font-weight: 400;
      position: relative;
    }

    h3 {
      font-size: 1.35em;
      margin: 1.4em 0 0.8em;
    }

    h4 {
      font-size: 1.15em;
    }

    p {
      margin: 1.5em 0;
      line-height: 1.8;
      color: $color-text-primary;
      text-align: justify;
      text-justify: inter-ideograph;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 0;
      box-shadow: none;
      margin: 2em auto;
      display: block;
      border: 1px solid #d8d0c4;
    }

    pre {
      margin: 2em 0;
      padding: 1.5rem 1.75rem;
      border-radius: 0;
      background: #efe9dd;
      border: 1px solid #d8d0c4;
      overflow-x: auto;
      font-size: 0.9em;
      line-height: 1.6;
      position: relative;
    }
    
    code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Menlo, Consolas, 'Courier New', monospace;
      font-size: 0.88em;
      padding: 0.2em 0.5em;
      margin: 0 0.1em;
      border-radius: 4px;
      background: #efe9dd;
      color: #8a3f2d;
      border: 1px solid #d8d0c4;
      font-weight: 500;
      font-variant-ligatures: none;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      margin: 0;
      font-size: 1em;
      color: inherit;
    }

    blockquote {
      margin: 2em 0;
      padding: 1.25em 1.5em;
      border-left: 2px solid $color-text-primary;
      background: #efe9dd;
      border-radius: 0;
      color: $color-text-secondary;
      font-style: italic;
      position: relative;

      > p:first-child {
        margin-top: 0;
      }

      > p:last-child {
        margin-bottom: 0;
      }
    }

    ul, ol {
      padding-left: 2em;
      margin: 1.5em 0;

      li {
        margin: 0.75em 0;
        line-height: 1.7;
        color: $color-text-primary;
        
        &::marker {
          color: $color-accent;
        }
      }
      
      // 嵌套列表样式
      ul, ol {
        margin: 0.5em 0;
        
        li {
          margin: 0.25em 0;
        }
      }
    }

    hr {
      margin: 2em 0;
      border: none;
      border-top: 1px solid #eaecef;
    }

    table {
      width: 100%;
      margin: 2em 0;
      border-collapse: collapse;
      border-radius: 0;
      overflow: hidden;
      border-top: 1px solid #d8d0c4;
      border-left: 1px solid #d8d0c4;

      th, td {
        padding: 1em 1.5em;
        text-align: left;
        border-right: 1px solid #d8d0c4;
        border-bottom: 1px solid #d8d0c4;
      }

      th {
        font-weight: 600;
        background: #efe9dd;
        color: $color-text-primary;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      tr:nth-child(even) {
        background: #fbf8f1;
      }

      tr:hover {
        background: #eee8dc;
      }

      td {
        color: $color-text-primary;
      }
    }

    // KaTeX 数学公式样式
    .katex-display {
      margin: 1.5em 0;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.5em 0;
    }
    
    .katex {
      font-size: 1.1em;
    }

    a {
      color: $color-text-primary;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid $color-text-muted;
      transition: border-color 0.18s ease, color 0.18s ease;
      padding-bottom: 1px;

      &:hover {
        color: $color-accent;
        border-bottom-color: $color-accent;
      }
      
      // 外部链接标识
      &[href^="http"]:not([href*="localhost"]):not([href*="127.0.0.1"])::after {
        content: "↗";
        font-size: 0.8em;
        margin-left: 0.2em;
        opacity: 0.6;
      }
    }
  }

  // 响应式调整 - 平衡内容宽度和可读性
  @media (max-width: 1200px) {
    .article-content {
      max-width: 100%;
    }
  }

  @media (max-width: 1024px) {
    .article-content {
      padding: 1rem 1.5rem 3rem 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .article-content {
      padding: 1rem 1.2rem 3rem 1.2rem;
    }
  }

  @media (max-width: 480px) {
    .article-content {
      padding: 0.8rem 1rem 3rem 1rem;
      
      h2 {
        font-size: 1.4em;
      }
      
      pre {
        padding: 1rem 1.2rem;
        margin: 1.5em 0;
      }
    }
  }

  .article-comments {
    border-top: 1px solid #d8d0c4;
    margin: 0 56px;
    padding: 24px 0 56px;
  }

  .comment-toggle {
    border: 1px solid #d8d0c4;
    background: transparent;
    color: $color-text-secondary;
    cursor: pointer;
    font-size: 14px;
    padding: 8px 14px;
    border-radius: 0;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;

    &:hover {
      border-color: $color-text-primary;
      color: $color-text-primary;
      background: #eee8dc;
    }
  }

  @media (max-width: 1024px) {
    .article-comments {
      margin: 0 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .article-comments {
      margin: 0 1.2rem;
      padding-bottom: 40px;
    }
  }

  @media (max-width: 480px) {
    .article-comments {
      margin: 0 1rem;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 4rem 2rem;
  background: #f7f4ed;
  border-radius: 0;
  margin: 20px;
  
  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #d8d0c4;
    border-top: 3px solid $color-text-primary;
    border-radius: 50%;
    animation: loading-spin 1.2s linear infinite;
    margin-bottom: 24px;
  }
  
  .loading-text {
    color: $color-text-secondary;
    font-size: 1em;
    font-weight: 400;
    letter-spacing: 0;
    text-align: center;
  }
}

@keyframes loading-spin {
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1em;
  
  &::after {
    content: '...';
    animation: loading-dots 1.4s infinite;
  }
}

@keyframes loading-dots {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}

// 移除了空白容器，现在在静默加载期间完全不渲染任何内容
</style> 
