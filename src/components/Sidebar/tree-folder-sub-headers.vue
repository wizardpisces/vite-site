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
// 使用与左侧一致的颜色变量
$toc-text: #4b5563;
$toc-primary: #2563eb;
$toc-hover: #3b82f6;
$toc-hover-bg: rgba(59, 130, 246, 0.05);
$toc-active: #1d4ed8;
$toc-active-bg: rgba(37, 99, 235, 0.1);

.tree-folder-sub-headers {
  list-style-type: none;
  padding-left: 1rem;
  margin: 0.35rem 0;
  border-left: 1px solid rgba(0, 0, 0, 0.05);

  .tree-folder-sub-header {
    position: relative;
    line-height: 1.5;
    margin: 0.25rem 0;

    a {
      color: $toc-text;
      display: block;
      padding: 0.4rem 0.75rem;
      font-size: 0.9rem;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        color: $toc-hover;
        background-color: $toc-hover-bg;
        border-color: rgba(59, 130, 246, 0.1);
      }
    }

    &.active {
      & > a {
        color: $toc-active;
        font-weight: 500;
        background-color: $toc-active-bg;
        border-color: rgba(37, 99, 235, 0.2);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 70%;
          background-color: $toc-active;
          border-radius: 3px;
          opacity: 0.6;
        }
      }
    }

    // 嵌套的子标题
    .tree-folder-sub-headers {
      margin-left: 0.5rem;
      
      a {
        font-size: 0.85rem;
        padding: 0.35rem 0.75rem;
      }
    }
  }
}
</style>
