<template>
  <section :class="cls">
    <h2 class="sidebar-heading" v-show="folder.categoryName!=='blog'" @click="toggleFolder">
      <v3-icon :type="isExpanded ? 'arrow-down' : 'arrow-right'" size="16" class="folder-icon"></v3-icon>
      {{folder.categoryName}}
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
.tree-folder {
  margin-bottom: 1.5rem;

  .sidebar-heading {
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.75rem 0.5rem;
    color: #2c3e50;
    transition: all 0.3s;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.02);
    position: relative;

    &:hover {
      color: $color-primary;
      background-color: rgba(66, 185, 131, 0.08);

      .folder-icon {
        color: $color-primary;
      }

      &::after {
        border-color: $color-primary;
      }
    }

    .folder-icon {
      margin-right: 0.5rem;
      transition: all 0.3s;
      color: #666;
      transform-origin: center;

      &[type="arrow-down"] {
        transform: rotate(0deg);
      }

      &[type="arrow-right"] {
        transform: rotate(-90deg);
      }
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: transparent;
      transition: all 0.3s;
      border-radius: 0 3px 3px 0;
    }
  }

  .tree-folder-contents {
    list-style-type: none;
    padding-left: 1rem;
    margin: 0;
    border-left: 1px dashed #ddd;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    opacity: 0;
    max-height: 0;
    transform-origin: top;
    transform: translateY(-10px);

    &.is-expanded {
      opacity: 1;
      margin: 0.5rem 0;
      max-height: 2000px;
      transform: translateY(0);
    }
    
    li {
      position: relative;
      line-height: 1.7;
      padding: 0.3rem 0;

      &::before {
        content: '';
        position: absolute;
        left: -1rem;
        top: 50%;
        width: 8px;
        height: 1px;
        background-color: #ddd;
        transition: all 0.3s;
      }

      &:hover::before {
        background-color: $color-primary;
        width: 12px;
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

      &:hover {
        background-color: rgba(66, 185, 131, 0.05);
      }

      .folder-icon {
        font-size: 0.9em;
      }

      // 当前展开的文件夹
      &::after {
        height: 60%;
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

        .folder-icon {
          font-size: 0.85em;
        }

        &::after {
          height: 50%;
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
      padding: 0.5rem 0.5rem;

      &:hover {
        background: none;
        color: $color-primary;
      }

      .folder-icon {
        color: #1a1a1a;
        font-size: 1.1em;
      }

      &::after {
        width: 4px;
        height: 80%;
        background-color: $color-primary;
        opacity: 0;
      }

      &:hover::after {
        opacity: 1;
      }
    }
  }

  // 展开状态的样式
  &:has(.tree-folder-contents.is-expanded) {
    > .sidebar-heading {
      color: $color-primary;
      
      &::after {
        background-color: $color-primary;
      }

      .folder-icon {
        color: $color-primary;
      }
    }
  }
}
</style>
