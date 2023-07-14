<template>
  <div :class="cls">
    <a
      href="javascript:void(0)"
      @click="onBlogClick(blog)"
      class="tree-folder-content-title"
    >{{blog.blogTitle}}</a>
    <tree-folder-sub-headers
      v-if="blog.subHeaders.length && cls.active"
      :headers="blog.subHeaders"
    ></tree-folder-sub-headers>
  </div>
</template>
<script lang="ts">
import { computed, PropType,nextTick } from "@vue/runtime-core";
import { useRoute, useRouter,onBeforeRouteUpdate } from "vue-router";
import { BlogDescriptor } from "../../../script/blog";
import useBlog from "@/composition/use-blog";
import TreeFolderSubHeaders from "./tree-folder-sub-headers.vue";
export default {
  name: "TreeFolderContent",
  components: {
    TreeFolderSubHeaders,
  },
  props: {
    blog: {
      type: Object as PropType<BlogDescriptor>,
    },
  },
  setup(props) {
    let router = useRouter();
    let { setActiveBlog, activeBlog, fetchMetaByBlogLink } = useBlog();
    let cls = computed(() => {
      return {
        "tree-folder-content": true,
        active: activeBlog.value.blogLink === props.blog?.blogLink,
      };
    });
    function onBlogClick(blog: BlogDescriptor) {
      setActiveBlog(blog);

      // dynamic fetch blog content
      fetchMetaByBlogLink(blog.blogLink).then(meta=>{
        router.push({
          path: `/blog/${blog.blogTitle}`,
        });
      });
    }

    return {
      onBlogClick,
      cls,
    };
  },
};
</script>
<style lang="scss">
.tree-folder-content {
  font-size:16px;
  a {
    color: #2c3e50;
  }
  &.active {
    & > a {
      font-weight: 500;
      color: $color-primary;
    }
  }
}
</style>
