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
// 分组主题色 - 使用暖色调
$folder-text: #1a1a1a;
$folder-secondary: #2c3e50;
$folder-border: #eaecef;
$folder-hover: #f97316; // 橙色
$folder-active: #ea580c;
$folder-hover-bg: rgba(249, 115, 22, 0.05);

.tree-folder {
  margin-bottom: 1rem;

  // 所有层级通用的分组样式
  .sidebar-heading {
    font-weight: 600;
    font-size: 16px;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.5rem 1.25rem;
    color: $folder-text;
    transition: all 0.3s;
    position: relative;
    border-radius: 4px;

    &:hover {
      color: $folder-hover !important;
      background-color: $folder-hover-bg;

      .folder-icon {
        color: $folder-hover !important;
      }
    }

    .folder-icon {
      margin-right: 0.75rem;
      transition: all 0.3s;
      color: #64748b;
      font-size: 0.9em;
    }

    .arrow-icon {
      margin-left: auto;
      transition: transform 0.3s;
      color: rgba($folder-secondary, 0.7);
      font-size: 0.85em;

      &.is-expanded {
        transform: rotate(180deg);
      }
    }
  }

  // 第一级分组特殊样式
  &.tree-folder--root > .sidebar-heading {
    font-size: 16px;
    padding: 0.5rem 1.25rem;
    margin-bottom: 0.5rem;
    color: $folder-text;
    border-bottom: 2px solid $folder-border;
    border-radius: 0;

    &:hover {
      background: none;
      
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 15%;
        height: 70%;
        width: 3px;
        background-color: $folder-hover;
        border-radius: 2px;
      }
    }

    .folder-icon {
      color: #475569;
    }
  }

  // 嵌套的文件夹样式
  .tree-folder {
    margin: 0.25rem 0;
    
    .sidebar-heading {
      font-size: 15px;
      padding: 0.4rem 1.5rem;
      color: $folder-secondary;
      background-color: rgba(241, 245, 249, 0.6);

      &:hover {
        background-color: rgba(249, 115, 22, 0.08);
      }

      .folder-icon {
        color: #64748b;
      }
    }

    // 第三层及以下的文件夹
    .tree-folder {
      .sidebar-heading {
        font-size: 14px;
        padding: 0.35rem 1.75rem;
        color: $folder-secondary;
        background-color: rgba(241, 245, 249, 0.3);

        &:hover {
          background-color: rgba(249, 115, 22, 0.05);
        }

        .folder-icon {
          color: #94a3b8;
        }

        .arrow-icon {
          color: rgba($folder-secondary, 0.5);
        }
      }

      .tree-folder-contents {
        border-left: 1px dashed $folder-border;
      }
    }
  }

  // 树形结构内容
  .tree-folder-contents {
    list-style-type: none;
    padding-left: 1rem;
    margin: 0;
    border-left: 1px solid $folder-border;
    transition: all 0.3s;
    overflow: hidden;
    opacity: 0;
    max-height: 0;
    transform-origin: top;
    transform: translateY(-5px);

    &.is-expanded {
      opacity: 1;
      margin: 0.5rem 0;
      max-height: 15000px; // 增加max-height以支持更多内容
      transform: translateY(0);
    }
    
    li {
      position: relative;
      line-height: 1.6;
      padding: 0.35rem 0;
      font-size: 14px;

      &::before {
        content: '';
        position: absolute;
        left: -1rem;
        top: 50%;
        width: 8px;
        height: 1px;
        background-color: $folder-border;
        transition: all 0.3s;
      }

      &:hover::before {
        background-color: $folder-hover;
        width: 12px;
      }
    }
  }

  // 展开状态的样式
  &:has(.tree-folder-contents.is-expanded) {
    > .sidebar-heading {
      color: $folder-hover;
      
      .folder-icon {
        color: $folder-hover;
      }
    }
  }
}
</style>
