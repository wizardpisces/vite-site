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
.tree-folder-sub-headers {
  list-style-type: none;
  padding-left: 1rem;
  margin: 0.5rem 0;
  border-left: 1px dashed #eaecef;

  a {
    color: #2c3e50;
    display: block;
    padding: 0.35rem 0.5rem;
    line-height: 1.4;
    font-size: 0.9em;
    position: relative;
    transition: all 0.3s;
    margin-left: -0.25rem;
    border-radius: 3px;

    &:hover {
      color: $color-primary;
      background-color: rgba(66, 185, 131, 0.05);
    }

    &::before {
      content: '';
      position: absolute;
      left: -0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background-color: #ddd;
      transition: all 0.3s;
    }
  }

  .tree-folder-sub-header {
    position: relative;
    margin: 0.2rem 0;

    &.active {
      > a {
        font-weight: 500;
        color: $color-primary;
        background-color: rgba(66, 185, 131, 0.05);

        &::before {
          background-color: $color-primary;
          width: 4px;
          height: 4px;
        }
      }
    }

    // 嵌套的子标题样式
    .tree-folder-sub-headers {
      margin-top: 0.2rem;
      margin-bottom: 0.3rem;
      
      a {
        font-size: 0.85em;
        padding: 0.25rem 0.5rem;
        color: #3a3a3a;

        &::before {
          width: 2px;
          height: 2px;
        }
      }

      // 第三层及以下的标题
      .tree-folder-sub-headers {
        margin: 0.1rem 0;
        
        a {
          font-size: 0.8em;
          padding: 0.2rem 0.5rem;
          color: #666;

          &::before {
            display: none;
          }
        }
      }
    }
  }
}
</style>
