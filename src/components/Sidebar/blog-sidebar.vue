<template>
  <nav class="blog-sidebar">
    <div class="blog-search">
      <div class="search-wrapper">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="🔍 搜索文章..."
          class="search-input"
        />
        <span v-if="searchTerm" class="search-clear" @click="searchTerm = ''">×</span>
      </div>
    </div>
    <div class="blog-categories">
      <tree-folder :folder='categoryGroup'></tree-folder>
    </div>
  </nav>
</template>

<script lang='ts'>
import { ref, provide } from "vue";
import useBlog from "@/composition/use-blog";
import TreeFolder from "./tree-folder.vue";

export default {
  name: "BlogSidebar",
  components: {
    TreeFolder,
  },
  setup() {
    const { categoryGroup } = useBlog();
    const searchTerm = ref('');

    provide('blogSearchTerm', searchTerm);

    return {
      categoryGroup,
      searchTerm,
    };
  },
};
</script>

<style lang="scss">
.blog-sidebar {
  padding: 1.5rem 0;

  .blog-search {
    padding: 0 1.5rem 1rem;

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      padding: 8px 30px 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      color: #334155;
      background: #f8fafc;
      outline: none;
      transition: all 0.2s;

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border-color: #3b82f6;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .search-clear {
      position: absolute;
      right: 8px;
      cursor: pointer;
      color: #94a3b8;
      font-size: 18px;
      line-height: 1;
      padding: 2px;
      transition: color 0.2s;

      &:hover {
        color: #475569;
      }
    }
  }

  .blog-categories {
    padding: 0 1rem;
  }
}
</style>