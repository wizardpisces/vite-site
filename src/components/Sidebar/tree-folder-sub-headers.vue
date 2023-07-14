<template>
  <ul class="tree-folder-sub-headers">
    <li
      v-for="(subHeader,index) in headers"
      :key="index"
      :class="{
        'tree-folder-sub-header':true,
        'active': activeSubHeader.title === subHeader.title
      }"
    >
      <a
        :href="subHeader.link"
        class="sidebar-link"
        @click="onSubHeaderClick(subHeader)"
      >{{subHeader.title}}</a>
      <tree-folder-sub-headers
        v-if="subHeader.children"
        :headers="subHeader.children"
      ></tree-folder-sub-headers>
    </li>
  </ul>
</template>
<script lang="ts">
import { PropType } from "@vue/runtime-core";
import { SubHeader } from "../../../script/blog";
import useBlog from '@/composition/use-blog';

export default {
  name: "TreeFolderSubHeaders",
  props: {
    headers: {
      type: Array as PropType<SubHeader[]>,
    },
  },
  setup(props) {
    let { activeSubHeader,setActiveSubHeader } = useBlog();

    function onSubHeaderClick(subHeader: SubHeader) {
      setActiveSubHeader(subHeader)
    }

    return {
      onSubHeaderClick,
      activeSubHeader
    };
  },
};
</script>

<style lang="scss">
.tree-folder-sub-headers {
  a {
    color: #2c3e50;
  }
  .tree-folder-sub-header {
    &.active {
      &>a {
        font-weight: 500;
        color: $color-primary;
      }
    }
  }
}
</style>
