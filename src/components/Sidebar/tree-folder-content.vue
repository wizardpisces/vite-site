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
// 博客主题色
$blog-primary: #3b82f6;
$blog-hover: #2563eb;
$blog-active: #1d4ed8;

.tree-folder-content {
  font-size: 0.95rem;
  padding: 0.35rem 0;
  
  a {
    display: flex;
    align-items: center;
    color: #666;
    transition: all 0.3s;
    padding: 0.5rem 1rem;
    margin-left: -0.5rem;
    border-radius: 4px;
    line-height: 1.4;
    position: relative;
    text-decoration: none;
    border: 1px solid transparent;
    
    .blog-icon {
      margin-right: 0.5rem;
      color: #999;
      transition: all 0.3s;
    }
    
    &:hover {
      color: $blog-hover;
      background-color: rgba($blog-hover, 0.05);
      border-color: rgba($blog-hover, 0.1);
      
      .blog-icon {
        color: $blog-hover;
      }
    }
  }
  
  &.active {
    & > a {
      font-weight: 600;
      color: $blog-active;
      background-color: rgba($blog-active, 0.08);
      border-color: rgba($blog-active, 0.2);
      
      .blog-icon {
        color: $blog-active;
      }

      &::after {
        content: '';
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 70%;
        background-color: $blog-active;
        border-radius: 3px;
        opacity: 0.6;
      }
    }
  }
}
</style>
