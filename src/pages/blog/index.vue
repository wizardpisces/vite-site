<template>
  <div :class="containerClass">
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
import useLayout from "@/composition/use-layout";
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
    const { showLeftSidebar, showRightToc } = useLayout();

    const currentFontSize = ref('medium');
    const savedFontSize = localStorage.getItem('blog-font-size');
    if (savedFontSize) {
      currentFontSize.value = savedFontSize;
    }

    const handleFontSizeChange = (size: string) => {
      currentFontSize.value = size;
    };

    provide('currentFontSize', currentFontSize);

    const containerClass = computed(() => ({
      'blog-container': true,
      'hide-left': !showLeftSidebar.value,
      'hide-right': !showRightToc.value,
    }));

    return {
      activeSubHeaders,
      handleFontSizeChange,
      containerClass,
    };
  }
};
</script>

<style lang="scss">
.blog-container {
  padding-left: 280px;
  padding-right: 240px;
  min-height: calc(100vh - 70px);
  background: #fafafa;
  position: relative;
  overflow-x: hidden;
  transition: padding 0.3s ease;

  &.hide-left {
    padding-left: 0;
  }

  &.hide-right {
    padding-right: 0;
  }

  .blog-content {
    max-width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
    margin-top: -16px;
    overflow-x: hidden;
  }

  @media (max-width: 1200px) {
    padding-right: 0;
  }

  @media (max-width: 959px) {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
