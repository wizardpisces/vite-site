<template>
  <section :class="cls" v-show="isVisible">
    <h2 class="sidebar-heading" v-show="folder.categoryName!=='blog'" @click="toggleFolder">
      <v3-icon :type="isExpanded ? 'folder-open' : 'folder'" size="16" class="folder-icon"></v3-icon>
      {{folder.categoryName}}
      <span class="blog-count">{{ blogCount }}</span>
      <v3-icon type="arrow-down" size="12" class="arrow-icon" :class="{'is-expanded': isExpanded}"></v3-icon>
    </h2>
    <ul class="tree-folder-contents" :class="{'is-expanded': isExpanded, 'is-root': folder.categoryName === 'blog'}">
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
import { PropType, ref, computed, watch, inject, Ref } from "vue";
import useBlog, { CategoryGroup, BlogDescriptor } from "@/composition/use-blog";
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
    const { activeBlog } = useBlog();
    const searchTerm = inject<Ref<string>>('blogSearchTerm', ref(''));

    const isCategory = (item: CategoryGroup | BlogDescriptor): item is CategoryGroup => {
      return 'categoryName' in item;
    };

    function containsBlog(folder: CategoryGroup, blogLink: string): boolean {
      return folder.items.some(item =>
        isCategory(item) ? containsBlog(item, blogLink) : item.blogLink === blogLink
      );
    }

    function matchesSearch(folder: CategoryGroup, term: string): boolean {
      return folder.items.some(item =>
        isCategory(item)
          ? matchesSearch(item, term)
          : item.blogTitle.toLowerCase().includes(term)
      );
    }

    function countBlogs(folder: CategoryGroup): number {
      return folder.items.reduce((n, item) =>
        n + (isCategory(item) ? countBlogs(item) : 1), 0
      );
    }

    const isRoot = props.folder.categoryName === 'blog';
    const isExpanded = ref(isRoot || containsBlog(props.folder, activeBlog.value.blogLink));
    const blogCount = computed(() => countBlogs(props.folder));

    const isVisible = computed(() => {
      if (!searchTerm.value) return true;
      return matchesSearch(props.folder, searchTerm.value.toLowerCase());
    });

    watch(() => activeBlog.value.blogLink, (link) => {
      if (containsBlog(props.folder, link)) {
        isExpanded.value = true;
      }
    });

    watch(searchTerm, (term) => {
      if (term) {
        if (matchesSearch(props.folder, term.toLowerCase())) {
          isExpanded.value = true;
        }
      } else {
        isExpanded.value = isRoot || containsBlog(props.folder, activeBlog.value.blogLink);
      }
    });

    const toggleFolder = () => {
      isExpanded.value = !isExpanded.value;
    };

    return {
      cls: { "tree-folder": true },
      isExpanded,
      toggleFolder,
      isCategory,
      blogCount,
      isVisible,
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
  margin-bottom: 2px;

  // 通用分类标题
  .sidebar-heading {
    font-weight: 600;
    font-size: 13px;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px 8px;
    color: $folder-text;
    transition: all 0.2s;
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
      margin-right: 6px;
      transition: all 0.2s;
      color: #64748b;
      flex-shrink: 0;
    }

    .blog-count {
      margin-left: 6px;
      font-size: 10px;
      font-weight: 500;
      color: #94a3b8;
      background: #f1f5f9;
      padding: 0 5px;
      border-radius: 10px;
      line-height: 16px;
      min-width: 16px;
      text-align: center;
      flex-shrink: 0;
    }

    .arrow-icon {
      margin-left: auto;
      transition: transform 0.3s;
      color: rgba($folder-secondary, 0.5);
      flex-shrink: 0;

      &.is-expanded {
        transform: rotate(180deg);
      }
    }
  }

  // 一级分类（顶层 tech / other 等）
  > .sidebar-heading {
    font-size: 14px;
    padding: 6px 8px;
    margin-bottom: 2px;
    color: $folder-text;
    background: linear-gradient(90deg, rgba(241, 245, 249, 0.8), transparent);
    border-left: 3px solid #cbd5e1;

    &:hover {
      border-left-color: $folder-hover;
    }
  }

  // 嵌套分类（二级、三级…）
  .tree-folder {
    margin: 1px 0;

    > .sidebar-heading {
      font-size: 13px;
      padding: 4px 8px;
      color: $folder-secondary;
      border-left: 2px solid #e2e8f0;

      &:hover {
        border-left-color: $folder-hover;
        background-color: rgba(249, 115, 22, 0.06);
      }
    }

    // 三级及更深
    .tree-folder > .sidebar-heading {
      font-size: 12px;
      padding: 3px 8px;
      color: #64748b;
      border-left: 2px solid #f1f5f9;
    }
  }

  // 子内容列表
  .tree-folder-contents {
    list-style-type: none;
    padding-left: 12px;
    margin: 0;
    margin-left: 6px;
    border-left: 1px solid $folder-border;
    transition: all 0.25s;
    overflow: hidden;
    opacity: 0;
    max-height: 0;

    &.is-expanded {
      opacity: 1;
      margin-top: 2px;
      margin-bottom: 2px;
      max-height: 15000px;
    }

    &.is-root {
      border-left: none;
      padding-left: 0;
      margin-left: 0;

      > li::before {
        display: none;
      }
    }

    li {
      position: relative;
      line-height: 1.3;
      padding: 1px 0;
      font-size: 13px;

      // 树形横线连接符
      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 50%;
        width: 8px;
        height: 1px;
        background-color: $folder-border;
      }
    }
  }

  // 展开的分类高亮
  &:has(> .tree-folder-contents.is-expanded) {
    > .sidebar-heading {
      color: $folder-hover;
      border-left-color: $folder-hover;

      .folder-icon {
        color: $folder-hover;
      }
    }
  }
}
</style>
