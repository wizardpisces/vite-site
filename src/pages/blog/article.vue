<template>
  <div class="blog-article">
    <div 
      v-if="blogContent && !loadingBlog" 
      v-html="blogContent" 
      class="article-content"
      :class="`font-${currentFontSize}`"
    ></div>
    
    <div v-if="loadingBlog" class="loading">
      Loading...
    </div>
    
    <Comment :key="blogName"></Comment>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch, inject } from "vue";
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

    // 从父组件注入当前字体大小
    const currentFontSize = inject('currentFontSize', ref('medium'));

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
      blogName,
      currentFontSize,
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

@keyframes loading {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}
</style> 
