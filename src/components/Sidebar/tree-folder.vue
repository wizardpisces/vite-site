<template>
  <section :class="cls">
    <h2 class="sidebar-heading" v-show="folder.categoryName!=='blog'" @click="toggleFolder">
      <v3-icon :type="isExpanded ? 'arrow-down' : 'arrow-right'" size="16" class="folder-icon"></v3-icon>
      {{folder.categoryName}}
    </h2>
    <ul class="tree-folder-contents" v-show="isExpanded">
      <li
        v-for="(item,index) in folder.items"
        :key="index"
      >
        <tree-folder
          v-if="isCategory(item)"
          :folder="item"
        ></tree-folder>
        <tree-folder-content
          v-else
          :blog="item"
        ></tree-folder-content>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { PropType, ref } from "vue";
import { CategoryGroup, BlogDescriptor } from "@/composition/use-blog";
import TreeFolderContent from "./tree-folder-content.vue";

export default {
  name: "TreeFolder",
  props: {
    folder: {
      type: Object as PropType<CategoryGroup>,
      required: true
    },
  },
  components: {
    TreeFolderContent,
  },
  setup(props) {
    const isExpanded = ref(true);

    const toggleFolder = () => {
      isExpanded.value = !isExpanded.value;
    };

    const isCategory = (item: CategoryGroup | BlogDescriptor): item is CategoryGroup => {
      return 'categoryName' in item;
    };

    let cls = {
      "tree-folder": true,
    };

    return {
      cls,
      isExpanded,
      toggleFolder,
      isCategory
    };
  },
};
</script>

<style lang="scss">
.tree-folder {
  margin-bottom: 1.5rem;

  .sidebar-heading {
    font-weight: 600;
    font-size: 1rem;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    color: #2c3e50;
    transition: color 0.3s;
    border-left: 2px solid transparent;

    &:hover {
      color: $color-primary;
    }

    .folder-icon {
      margin-right: 0.5rem;
      transition: transform 0.3s;
    }
  }

  ul {
    list-style-type: none;
    padding-left: 1rem;
    margin: 0;
    
    li {
      position: relative;
      line-height: 1.7;
      padding: 0.3rem 0;

      &::before {
        content: '';
        position: absolute;
        left: -1rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: #eaecef;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover::before {
        opacity: 1;
      }
    }
  }

  a:hover {
    color: $color-primary;
  }

  // 嵌套的文件夹样式
  .tree-folder {
    margin-bottom: 0.5rem;
    
    .sidebar-heading {
      font-size: 0.95rem;
      padding: 0.3rem 0;
    }
  }
}
</style>
