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
// 分组主题色
$folder-primary: #f97316;
$folder-hover: #ea580c;
$folder-active: #c2410c;

.tree-folder {
  margin-bottom: 1.5rem;

  .sidebar-heading {
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #1a202c;
    transition: all 0.3s;
    border-radius: 6px;
    background-color: #fff7ed;
    position: relative;
    border: 1px solid transparent;

    &:hover {
      color: $folder-hover;
      background-color: #ffedd5;
      border-color: rgba($folder-hover, 0.2);

      .folder-icon {
        color: $folder-hover;
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

  .tree-folder-contents {
    list-style-type: none;
    padding-left: 1.25rem;
    margin: 0;
    border-left: 2px solid rgba($folder-primary, 0.3);
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
        background-color: rgba($folder-primary, 0.3);
        transition: all 0.3s;
      }

      &:hover::before {
        background-color: rgba($folder-primary, 0.5);
        width: 16px;
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
      font-size: 1rem;
      padding: 0.6rem 0.75rem;
      background-color: #fff7ed;
      border-radius: 4px;
      color: #2d3748;

      &:hover {
        background-color: #ffedd5;
        color: $folder-hover;
        border-color: rgba($folder-hover, 0.1);
      }

      .folder-icon {
        color: rgba($folder-primary, 0.8);
      }

      .arrow-icon {
        color: rgba($folder-primary, 0.6);
      }
    }

    // 第三层及以下的文件夹
    .tree-folder {
      .sidebar-heading {
        font-size: 0.95rem;
        padding: 0.5rem 0.75rem;
        color: #4a5568;
        background-color: #fff7ed;
        border-radius: 4px;

        &:hover {
          background-color: #ffedd5;
          color: $folder-hover;
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
        border-color: rgba($folder-primary, 0.2);
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
