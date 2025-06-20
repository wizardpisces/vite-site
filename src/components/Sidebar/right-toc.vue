<template>
  <aside class="right-toc" v-if="headers && headers.length">
    <div class="toc-header">目录</div>
    <div class="toc-content">
      <tree-folder-sub-headers :headers="headers"></tree-folder-sub-headers>
    </div>
  </aside>
</template>

<script lang="ts">
import { PropType } from "vue";
import { SubHeader } from "@/composition/use-blog";
import TreeFolderSubHeaders from "./tree-folder-sub-headers.vue";

export default {
  name: "RightToc",
  components: {
    TreeFolderSubHeaders
  },
  props: {
    headers: {
      type: Array as PropType<SubHeader[]>,
      default: () => []
    }
  }
};
</script>

<style lang="scss">
.right-toc {
  position: fixed;
  top: 50px;
  right: 0;
  bottom: 0;
  width: 240px;
  background: #fff;
  border-left: 1px solid #eaecef;
  overflow-y: auto;
  padding: 20px 0;
  font-size: 14px;
  box-shadow: -1px 0 2px rgba(0, 0, 0, 0.03);

  .toc-header {
    padding: 0 20px;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 15px;
    color: #1a1a1a;
    border-bottom: 2px solid #eaecef;
    padding-bottom: 10px;
  }

  .toc-content {
    padding: 0 16px;
  }

  @media (max-width: 959px) {
    display: none;
  }
}
</style> 