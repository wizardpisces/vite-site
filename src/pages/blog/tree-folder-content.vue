<template>
  <div :class="cls">
    <a
      href="javascript:void(0)"
      @click="onBlogClick(blog)"
      class="tree-folder-content-title"
    >{{blog.blogTitle}}</a>
    <ul class="tree-folder-content-sub-titles">
      <li
        v-for="(subHeader,index) in blog.subHeaders"
        :key="index"
        class="sidebar-sub-header"
      >
        <a
          :href="subHeader.link"
          class="active sidebar-link"
          aria-current="page"
        >{{subHeader.subTitle}}</a>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { computed, PropType } from "@vue/runtime-core";
import { BlogItem } from "../../../script/blog";
import useBlog from "./composition/use-blog";

export default {
  name: "TreeFolderContent",
  props: {
    blog: {
      type: Object as PropType<BlogItem>,
    },
  },
  setup(props) {
    let { setBlogContent, setActiveBlog, activeBlog } = useBlog();
    let cls = computed(()=>{
      return {
        "tree-folder-content": true,
        active:activeBlog.value.blogLink === props.blog?.blogLink,
      }
    })
    function onBlogClick(blog: BlogItem) {
      setActiveBlog(blog);

      // fetch blog content
      import(blog.blogLink).then((mod) => {
        setBlogContent(mod.html);
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
  a{
    color: #2c3e50;
  }
  &.active{
    a{
      font-weight: 500;
      color: $color-primary;
    }
  }
}
</style>
