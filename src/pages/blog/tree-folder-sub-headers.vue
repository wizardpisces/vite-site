<template>
  <ul class="tree-folder-sub-headers">
    <li
      v-for="(subHeader,index) in headers"
      :key="index"
      :class="{
        'tree-folder-sub-header':true,
        'active': activeSubHeader.subTitle === subHeader.subTitle
      }"
    >
      <a
        :href="subHeader.link"
        class="sidebar-link"
        @click="onSubHeaderClick(subHeader)"
      >{{subHeader.subTitle}}</a>
      <tree-folder-sub-headers
        v-if="subHeader.children"
        :headers="subHeader.children"
      ></tree-folder-sub-headers>
    </li>
  </ul>
</template>
<script lang="ts">
import { ref } from "vue";
import { PropType } from "@vue/runtime-core";
import { SubHeader } from "../../../script/blog";

export default {
  name: "TreeFolderSubHeaders",
  props: {
    headers: {
      type: Array as PropType<SubHeader[]>,
    },
  },
  setup(props) {
    let activeSubHeader = ref({
      subTitle:''
    });

    function onSubHeaderClick(subHeader: SubHeader) {
      activeSubHeader.value = subHeader;
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
      a {
        font-weight: 500;
        color: $color-primary;
      }
    }
  }
}
</style>
