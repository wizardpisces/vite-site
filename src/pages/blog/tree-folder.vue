<template>
  <section :class="cls">
    <p class="sidebar-heading">{{folder.categoryName}}</p>
    <ul class="tree-folder-contents">
      <li
        v-for="(categoryOrBlogSub,index) in folder.items"
        :key="index"
      >
        <tree-folder
          v-if="categoryOrBlogSub.categoryName"
          :folder="categoryOrBlogSub"
        ></tree-folder>
        <tree-folder-contents
          v-else
          :blog="categoryOrBlogSub"
        ></tree-folder-contents>
      </li>
    </ul>

  </section>
</template>

<script lang="ts">
import { PropType } from "@vue/runtime-core";
import { CategoryGroup } from "../../../script/blog";
import TreeFolderContents from "./tree-folder-content.vue";
export default {
  name: "TreeFolder",
  props: {
    folder: {
      type: Object as PropType<CategoryGroup>,
    },
  },
  components: {
    TreeFolderContents,
  },
  setup(props) {
      let cls = {
          "tree-folder":true,
        //   "active":
      }
    return {
        cls
    };
  },
};
</script>
<style lang="scss">
.tree-folder {
    .sidebar-heading{
        font-weight: 700;
        font-size: 18px;
    }
    ul{
        list-style-type: none;
    }
}
</style>
