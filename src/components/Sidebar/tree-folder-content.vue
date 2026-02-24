<template>
  <div :class="cls" v-show="isVisible">
    <a
      href="javascript:void(0)"
      @click="onBlogClick(blog)"
      class="tree-folder-content-title"
      :title="blog.blogTitle"
    >
      <span class="blog-title" v-if="searchTerm" v-html="highlightTitle"></span>
      <span class="blog-title" v-else>{{blog.blogTitle}}</span>
    </a>
  </div>
</template>

<script lang="ts">
import { computed, PropType, inject, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import useBlog, { BlogDescriptor } from "@/composition/use-blog";

export default {
  name: "TreeFolderContent",
  props: {
    blog: {
      type: Object as PropType<BlogDescriptor>,
      required: true
    },
  },
  setup(props) {
    const router = useRouter();
    const { setActiveBlog, activeBlog, fetchMetaByBlogLink } = useBlog();
    const searchTerm = inject<Ref<string>>('blogSearchTerm', ref(''));

    const cls = computed(() => ({
      "tree-folder-content": true,
      active: activeBlog.value.blogLink === props.blog?.blogLink,
    }));

    const isVisible = computed(() => {
      if (!searchTerm.value) return true;
      return props.blog.blogTitle.toLowerCase().includes(searchTerm.value.toLowerCase());
    });

    const highlightTitle = computed(() => {
      if (!searchTerm.value) return props.blog.blogTitle;
      const regex = new RegExp(`(${searchTerm.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return props.blog.blogTitle.replace(regex, '<mark>$1</mark>');
    });

    const onBlogClick = async (blog: BlogDescriptor) => {
      setActiveBlog(blog);
      await fetchMetaByBlogLink(blog.blogLink);
      router.push({
        path: `/blog/${blog.blogTitle}`,
      });
    };

    return {
      blog: props.blog,
      onBlogClick,
      cls,
      isVisible,
      searchTerm,
      highlightTitle,
    };
  },
};
</script>

<style lang="scss">
// 博客主题色 - 使用蓝色系
$blog-text: #2c3e50;
$blog-hover: #3b82f6;
$blog-active: #2563eb;
$blog-hover-bg: rgba(59, 130, 246, 0.05);
$blog-active-bg: rgba(37, 99, 235, 0.1);

.tree-folder-content {
  font-size: 13px;
  
  a {
    display: block;
    color: $blog-text;
    transition: all 0.2s;
    padding: 4px 10px;
    line-height: 1.4;
    text-decoration: none !important;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &:hover {
      color: $blog-hover !important;
      background-color: $blog-hover-bg;
    }
  }
  
  mark {
    background: rgba(250, 204, 21, 0.4);
    color: inherit;
    padding: 0 1px;
    border-radius: 2px;
  }

  &.active {
    & > a {
      color: $blog-active !important;
      font-weight: 500;
      background-color: $blog-active-bg;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background-color: $blog-active;
        border-radius: 2px;
      }
    }
  }
}
</style>
