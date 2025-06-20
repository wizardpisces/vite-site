<template>
  <div :class="cls">
    <a
      href="javascript:void(0)"
      @click="onBlogClick(blog)"
      class="tree-folder-content-title"
    >{{blog.blogTitle}}</a>
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
.tree-folder-content {
  font-size: 0.9rem;
  padding: 0.25rem 0;
  
  a {
    display: block;
    color: #2c3e50;
    transition: all 0.3s;
    padding: 0.25rem 0;
    padding-left: 1rem;
    margin-left: -1rem;
    border-left: 2px solid transparent;
    line-height: 1.4;
    
    &:hover {
      color: $color-primary;
      border-left-color: $color-primary;
      background-color: rgba(66, 185, 131, 0.05);
    }
  }
  
  &.active {
    & > a {
      font-weight: 500;
      color: $color-primary;
      border-left-color: $color-primary;
      background-color: rgba(66, 185, 131, 0.05);
    }
  }
}
</style>
