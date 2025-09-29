<template>
  <div class="blog-article">
    <!-- 优雅的加载状态，避免内容突然出现 -->
    <transition name="blog-content" mode="out-in">
      <div 
        v-if="blogContent && !loadingBlog && contentReady" 
        v-html="blogContent" 
        class="article-content"
        :class="`font-${currentFontSize}`"
        key="content"
      ></div>
      
      <div v-else-if="shouldShowLoading" class="loading-container" key="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载文章内容...</div>
      </div>
    </transition>
    
    <Comment :key="blogName" v-if="contentReady"></Comment>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch, inject, nextTick, onUnmounted } from "vue";
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
    const contentReady = ref(false);
    const shouldShowLoading = ref(false);
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;

    // 从父组件注入当前字体大小
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
        
        // 确保内容加载完成后再显示，避免闪现
        nextTick(() => {
          contentReady.value = true;
          // 延迟一帧再处理hash，确保DOM更新完成
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
      blogName,
      currentFontSize,
      contentReady,
      shouldShowLoading,
    };
  }
};
</script>

<style lang="scss">
.blog-article {
  // 简化外层容器，给内容更多空间
  background: rgba(255, 255, 255, 0.98);
  min-height: calc(100vh - 70px);
  position: relative;
  
  // 微妙的顶部装饰，不占用空间
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(37, 99, 235, 0.1) 50%, 
      transparent 100%);
    z-index: 0;
  }

  // 字体控制器已移至toolbar，确保这里没有任何浮动元素

  .article-content {
    // 在有TOC的情况下优化宽度
    max-width: 100%;
    width: 100%;
    padding: 50px;
    font-size: 15px;
    line-height: 1.6;
    color: #2d3748;
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
      padding-bottom: 0.75em;
      border-bottom: 2px solid rgba(37, 99, 235, 0.15);
      margin: 2.5em 0 1.5em;
      color: #1a202c;
      font-weight: 700;
      position: relative;
      
      // 为h2添加微妙的渐变下划线
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, #2563eb, #0ea5e9);
        border-radius: 2px;
      }
    }

    h3 {
      font-size: 1.35em;
      margin: 1em 0;
    }

    h4 {
      font-size: 1.15em;
    }

    p {
      margin: 1.5em 0;
      line-height: 1.8;
      color: #2d3748;
      text-align: justify;
      text-justify: inter-ideograph;
      
      // 为段落添加更好的视觉层次
      &:first-of-type {
        font-size: 1.05em;
        color: #1a202c;
      }
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 2em auto;
      display: block;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
    }

    pre {
      margin: 2em 0;
      padding: 2rem 2.5rem;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      overflow-x: auto;
      font-size: 0.9em;
      line-height: 1.6;
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.02),
        0 1px 2px rgba(0, 0, 0, 0.01);
      position: relative;
      
      // 添加代码语言提示区域
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #2563eb, #0ea5e9);
        border-radius: 12px 12px 0 0;
      }
    }
    
    code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Menlo, Consolas, 'Courier New', monospace;
      font-size: 0.88em;
      padding: 0.2em 0.5em;
      margin: 0 0.1em;
      border-radius: 4px;
      background: #f1f5f9;
      color: #d73a49;
      border: 1px solid #e2e8f0;
      font-weight: 500;
      font-variant-ligatures: none;
      
      // 确保行内代码易于识别但不喧宾夺主
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
      padding: 1.5em 2em;
      border-left: 4px solid #2563eb;
      background: #f8fafc;
      border-radius: 0 8px 8px 0;
      color: #4a5568;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      font-style: italic;
      position: relative;
      
      // 添加引号装饰
      &::before {
        content: '"';
        position: absolute;
        top: 0.5rem;
        left: 0.75rem;
        font-size: 2em;
        color: #2563eb;
        opacity: 0.3;
        font-family: Georgia, serif;
      }

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
        color: #2d3748;
        
        &::marker {
          color: #2563eb;
          font-weight: bold;
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
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      th, td {
        padding: 1em 1.5em;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }

      th {
        font-weight: 600;
        background: #f7fafc;
        color: #1a202c;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      tr:nth-child(even) {
        background: #f9fafb;
      }

      tr:hover {
        background: #f1f5f9;
      }

      td {
        color: #2d3748;
      }
    }

    a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid rgba(37, 99, 235, 0.3);
      transition: all 0.2s ease;
      padding-bottom: 1px;

      &:hover {
        color: #1d4ed8;
        border-bottom-color: #1d4ed8;
        background: rgba(37, 99, 235, 0.05);
        border-radius: 2px;
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
}

// 添加微妙的浮动动画
@keyframes float-subtle {
  0%, 100% { 
    transform: translateX(0px) translateY(0px) rotate(0deg); 
  }
  33% { 
    transform: translateX(10px) translateY(-15px) rotate(1deg); 
  }
  66% { 
    transform: translateX(-5px) translateY(8px) rotate(-0.5deg); 
  }
}

// 博客内容过渡动画
.blog-content-enter-active {
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.blog-content-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.6, 1);
}

.blog-content-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  filter: blur(4px);
}

.blog-content-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(1.02);
  filter: blur(2px);
}

// 现代化的加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  margin: 20px;
  box-shadow: 
    0 4px 20px rgba(37, 99, 235, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  
  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(37, 99, 235, 0.1);
    border-top: 4px solid #2563eb;
    border-radius: 50%;
    animation: loading-spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    margin-bottom: 24px;
    
    // 添加渐变效果
    background: conic-gradient(from 0deg, transparent, rgba(37, 99, 235, 0.1));
  }
  
  .loading-text {
    color: #64748b;
    font-size: 1.1em;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-align: center;
    animation: loading-pulse 2s ease-in-out infinite;
    
    // 微妙的文字动效
    background: linear-gradient(
      90deg,
      #64748b,
      #2563eb,
      #64748b
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: loading-shimmer 2.5s ease-in-out infinite;
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

@keyframes loading-pulse {
  0%, 100% { 
    opacity: 0.7;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes loading-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// 旧的loading样式（保留作为备用）
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
