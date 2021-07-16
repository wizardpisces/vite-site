<template>
  <section class="tree-folder sidebar-group depth-0">
    <p class="sidebar-heading">{{folder.categoryName}}</p>
    <ul class="tree-folder-contents sidebar-links sidebar-group-items">
      <li
        v-for="(categoryOrBlogSub,index) in folder.items"
        :key="index"
      >
        <tree-folder v-if="categoryOrBlogSub.categoryName" :folder="categoryOrBlogSub"></tree-folder>
        <tree-folder-contents
          v-else
          :content="categoryOrBlogSub"
        ></tree-folder-contents>
      </li>
    </ul>

  </section>
</template>

<script lang="ts">
import { PropType } from "@vue/runtime-core";
import { CategoryGroup } from "../../../script/blog";
import TreeFolderContents from "./tree-folder-contents.vue";
export default {
  name: "TreeFolder",
  props: {
    folder: {
      type: Object as PropType<CategoryGroup>,
    },
  },
  components: {
    TreeFolderContents
  },
  setup(props) {
    return {};
  },
};
</script>
<style lang="scss">
.tree-folder {
}
</style>
