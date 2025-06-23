<template>
  <section :class="cls">
    <h2 class="sidebar-heading" v-show="folder.categoryName!=='blog'" @click="toggleFolder">
      <v3-icon :type="isExpanded ? 'folder-open' : 'folder'" size="16" class="folder-icon"></v3-icon>
      {{folder.categoryName}}
      <v3-icon type="arrow-down" size="12" class="arrow-icon" :class="{'is-expanded': isExpanded}"></v3-icon>
    </h2>
    <ul class="tree-folder-contents" :class="{'is-expanded': isExpanded}">
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
// 分组主题色 - 使用更柔和的灰色系
$folder-text: #1f2937;
$folder-primary: #6b7280;
$folder-hover: #4b5563;
$folder-active: #374151;
$folder-bg: #f9fafb;
$folder-hover-bg: #f3f4f6;

.tree-folder {
  margin-bottom: 1.5rem;

  // 所有层级通用的分组样式
  .sidebar-heading {
    font-weight: 600;
    font-size: 1rem;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    color: $folder-text;
    transition: all 0.3s;
    border-radius: 6px;
    background-color: $folder-bg;
    position: relative;
    border: 1px solid transparent;

    &:hover {
      color: $folder-hover !important;
      background-color: $folder-hover-bg !important;
      border-color: #e5e7eb !important;

      .folder-icon {
        color: $folder-hover !important;
      }
    }

    .folder-icon {
      margin-right: 0.75rem;
      transition: all 0.3s;
      color: $folder-primary;
    }

    .arrow-icon {
      margin-left: auto;
      transition: transform 0.3s;
      color: rgba($folder-primary, 0.7);

      &.is-expanded {
        transform: rotate(180deg);
      }
    }
  }

  // 第一级分组特殊样式
  &.tree-folder--root > .sidebar-heading {
    font-size: 1.1rem;
    padding: 0.75rem 1rem;
    background-color: $folder-bg;
    font-weight: 600;
  }

  // 嵌套的文件夹样式
  .tree-folder {
    margin: 0.5rem 0;
    
    // 第三层及以下的文件夹
    .tree-folder {
      .sidebar-heading {
        font-size: 0.95rem;
        padding: 0.5rem 0.75rem;
        background-color: $folder-bg;
        border-radius: 4px;

        &:hover {
          background-color: $folder-hover-bg !important;
          color: $folder-hover !important;
        }

        .folder-icon {
          color: rgba($folder-primary, 0.7);
        }

        .arrow-icon {
          color: rgba($folder-primary, 0.5);
        }
      }

      .tree-folder-contents {
        border-left-style: dashed;
        border-color: #e5e7eb;
      }
    }
  }

  // 树形结构内容
  .tree-folder-contents {
    list-style-type: none;
    padding-left: 1.25rem;
    margin: 0;
    border-left: 2px solid #e5e7eb;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    opacity: 0;
    max-height: 0;
    transform-origin: top;
    transform: translateY(-10px);

    &.is-expanded {
      opacity: 1;
      margin: 0.75rem 0;
      max-height: 2000px;
      transform: translateY(0);
    }
    
    li {
      position: relative;
      line-height: 1.7;
      padding: 0.4rem 0;

      &::before {
        content: '';
        position: absolute;
        left: -1.25rem;
        top: 50%;
        width: 12px;
        height: 2px;
        background-color: #e5e7eb;
        transition: all 0.3s;
      }

      &:hover::before {
        background-color: #d1d5db;
        width: 16px;
      }
    }
  }
}
</style>
