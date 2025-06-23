<template>
  <div :class="cls">
    <a
      href="javascript:void(0)"
      @click="onBlogClick(blog)"
      class="tree-folder-content-title"
    >
      <v3-icon type="document" size="14" class="blog-icon"></v3-icon>
      {{blog.blogTitle}}
    </a>
  </div>
</template>

<script lang="ts">
import { computed, PropType } from "vue";
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
    
    const cls = computed(() => {
      return {
        "tree-folder-content": true,
        active: activeBlog.value.blogLink === props.blog?.blogLink,
      };
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
  font-size: 14px;
  
  a {
    display: flex;
    align-items: center;
    color: $blog-text;
    transition: all 0.3s;
    padding: 0.35rem 1.5rem;
    line-height: 1.4;
    text-decoration: none !important;
    border-radius: 4px;
    position: relative;
    
    .blog-icon {
      margin-right: 0.5rem;
      color: #94a3b8;
      transition: all 0.3s;
      font-size: 0.9em;
    }
    
    &:hover {
      color: $blog-hover !important;
      background-color: $blog-hover-bg;
      
      .blog-icon {
        color: $blog-hover !important;
      }
    }
  }
  
  &.active {
    & > a {
      color: $blog-active !important;
      font-weight: 500;
      background-color: $blog-active-bg;
      
      .blog-icon {
        color: $blog-active !important;
      }

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: $blog-active;
        border-radius: 2px;
      }
    }
  }
}
</style>
