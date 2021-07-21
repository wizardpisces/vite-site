<template>
  <section :class="cls">
    <h2 class="sidebar-heading">{{folder.categoryName}}</h2>
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
        margin:0;
    }
    ul{
        list-style-type: none;
        padding-left:20px;
        li{
          line-height: 30px;
        }
    }
}
</style>
