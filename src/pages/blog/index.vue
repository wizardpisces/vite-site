<template>
  <div class="blog-container">
    <blog-toolbar @font-size-change="handleFontSizeChange" />
    <div class="blog-content">
      <router-view></router-view>
    </div>
    <right-toc :headers="activeSubHeaders"></right-toc>
  </div>
</template>

<script lang="ts">
import { computed, provide, ref } from "vue";
import useBlog from "@/composition/use-blog";
import RightToc from "@/components/sidebar/right-toc.vue";
import BlogToolbar from "@/components/blog-toolbar.vue";

export default {
  name: "Blog",
  components: {
    RightToc,
    BlogToolbar
  },
  setup() {
    const { activeBlog } = useBlog();
    const activeSubHeaders = computed(() => activeBlog.value.subHeaders || []);
    
    // 字体大小状态
    const currentFontSize = ref('medium');
    
    // 从localStorage恢复字体大小偏好
    const savedFontSize = localStorage.getItem('blog-font-size');
    if (savedFontSize) {
      currentFontSize.value = savedFontSize;
    }
    
    const handleFontSizeChange = (size: string) => {
      currentFontSize.value = size;
    };
    
    // 提供字体大小给所有子组件
    provide('currentFontSize', currentFontSize);

    return {
      activeSubHeaders,
      handleFontSizeChange
    };
  }
};
</script>

<style lang="scss">
.blog-container {
  padding-left: 280px;
  padding-right: 260px;
  min-height: calc(100vh - 70px);
  background: #fafafa;
  position: relative;
  
  .blog-content {
    max-width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
    
    // 进一步减少上方空白
    margin-top: -16px;
    
    // 确保内容区域有合适的滚动行为
    overflow-x: hidden;
  }

  @media (max-width: 1200px) {
    padding-right: 0;
  }

  @media (max-width: 959px) {
    padding-left: 0;
    padding-right: 0;
  }
  
  // 确保整体布局不会导致水平滚动
  overflow-x: hidden;
}
</style>
