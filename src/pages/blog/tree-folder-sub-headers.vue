<template>
 <ul class="tree-folder-sub-headers">
      <li
        v-for="(subHeader,index) in headers"
        :key="index"
        class="tree-folder-sub-header"
      >
        <a
          :href="subHeader.link"
          class="active sidebar-link"
          aria-current="page"
        >{{subHeader.subTitle}}</a>
        <tree-folder-sub-headers v-if="subHeader.children" :headers="subHeader.children"></tree-folder-sub-headers>
      </li>
    </ul>
</template>
<script lang="ts">
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
      let cls = {
          "tree-folder-sub-headers":true,
        //   "active":
      }
    return {
        cls
    };
  },
};
</script>

<style lang="scss">
.tree-folder-sub-headers {
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
