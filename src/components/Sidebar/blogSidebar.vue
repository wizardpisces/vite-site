<template>
  <tree-folder :folder='categoryGroup'></tree-folder>
</template>
<script lang='ts'>
import useBlog from "@/composition/use-blog";
import TreeFolder from "./tree-folder.vue";

export default {
  components: {
    TreeFolder,
  },
  setup() {
    let { categoryGroup } = useBlog();
    return {
      categoryGroup,
    };
  },
};
</script>