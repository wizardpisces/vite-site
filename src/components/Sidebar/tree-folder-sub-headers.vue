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
        :title="subHeader.title"
        @click="onSubHeaderClick(subHeader)"
      >{{subHeader.title}}</a>
      <tree-folder-sub-headers
        v-if="subHeader.children && subHeader.children.length"
        :headers="subHeader.children"
      ></tree-folder-sub-headers>
    </li>
  </ul>
</template>
<script lang="ts">
import { PropType } from "@vue/runtime-core";
import useBlog, { SubHeader } from '@/composition/use-blog';

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
$toc-text: #5f574f;
$toc-hover: #8a3f2d;
$toc-active: #141413;
$toc-hover-bg: #eee8dc;
$toc-active-bg: #eee8dc;
$toc-border: #d8d0c4;

.tree-folder-sub-headers {
  list-style-type: none;
  padding-left: 10px;
  margin: 2px 0;
  border-left: 1px solid $toc-border;

  .tree-folder-sub-header {
    position: relative;
    line-height: 1.3;
    margin: 1px 0;

    a {
      color: $toc-text;
      display: block;
      padding: 3px 8px;
      font-size: 12px;
      text-decoration: none;
      border-radius: 0;
      transition: all 0.15s;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        color: $toc-hover;
        background-color: $toc-hover-bg;
      }
    }

    &.active > a {
      color: $toc-active;
      font-weight: 500;
      background-color: $toc-active-bg;
      border-left: 2px solid $toc-active;
      padding-left: 6px;
    }

    .tree-folder-sub-headers {
      a {
        font-size: 11px;
        padding: 2px 8px;
        color: #8a8178;
      }
    }
  }
}
</style>
