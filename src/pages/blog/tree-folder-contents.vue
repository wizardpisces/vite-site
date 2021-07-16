<template>
  <a
    href="javascript:void(0)"
    @click="fetchBlog(content)"
    class="sidebar-link"
  >{{content.blogTitle}}</a>
  <ul class="sidebar-sub-headers">
    <li
      v-for="(subHeader,index) in content.subHeaders"
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
</template>
<script lang="ts">
import { PropType } from "@vue/runtime-core";
import { CategoryGroup } from "../../../script/blog";

export default {
  name: "TreeFolderContents",
  props: {
    content: {
      type: Object as PropType<CategoryGroup["items"]>,
    },
  },
  setup(props) {
    return {};
  },
};
</script>
<style lang="scss">
.tree-folder-contents {
}
</style>
