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
$toc-text: #4b5563;
$toc-hover: #3b82f6;
$toc-active: #1d4ed8;
$toc-hover-bg: rgba(59, 130, 246, 0.05);
$toc-active-bg: rgba(37, 99, 235, 0.08);
$toc-border: #e5e7eb;

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
      border-radius: 3px;
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
        color: #6b7280;
      }
    }
  }
}
</style>
