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
    font-size: 1.1rem;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.75rem 0;
    color: #2c3e50;
    transition: all 0.3s;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.02);
    padding-left: 0.5rem;

    &:hover {
      color: $color-primary;
      background-color: rgba(66, 185, 131, 0.08);
    }

    .folder-icon {
      margin-right: 0.5rem;
      transition: transform 0.3s;
      color: #666;
    }
  }

  ul {
    list-style-type: none;
    padding-left: 1rem;
    margin: 0.5rem 0;
    border-left: 1px dashed #ddd;
    
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
        background-color: $color-primary;
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
    margin: 0.5rem 0;
    
    .sidebar-heading {
      font-size: 0.95rem;
      padding: 0.5rem;
      background-color: rgba(0, 0, 0, 0.015);
      border-radius: 4px;

      &:hover {
        background-color: rgba(66, 185, 131, 0.05);
      }
    }

    // 第三层及以下的文件夹
    .tree-folder {
      .sidebar-heading {
        font-size: 0.9rem;
        padding: 0.4rem 0.5rem;
        color: #3a3a3a;
        background: none;

        &:hover {
          background-color: rgba(66, 185, 131, 0.05);
        }
      }
    }
  }

  // 根级别的文件夹（通常是主题分类）
  &:first-child {
    > .sidebar-heading {
      font-size: 1.2rem;
      color: #1a1a1a;
      margin-bottom: 1rem;
      border-bottom: 2px solid #eaecef;
      border-radius: 0;
      background: none;
      padding: 0.5rem 0;

      &:hover {
        background: none;
        color: $color-primary;
      }

      .folder-icon {
        color: #1a1a1a;
      }
    }
  }
}
</style>
