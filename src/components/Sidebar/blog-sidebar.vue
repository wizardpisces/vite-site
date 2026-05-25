<template>
  <nav class="blog-sidebar">
    <div class="blog-search">
      <div class="search-wrapper">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="搜索文章..."
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
      border: 1px solid #d8d0c4;
      border-radius: 0;
      font-size: 13px;
      color: #141413;
      background: transparent;
      outline: none;
      transition: border-color 0.18s ease, background 0.18s ease;

      &::placeholder {
        color: #8a8178;
      }

      &:focus {
        border-color: #141413;
        background: #fffdf8;
      }
    }

    .search-clear {
      position: absolute;
      right: 8px;
      cursor: pointer;
      color: #8a8178;
      font-size: 18px;
      line-height: 1;
      padding: 2px;
      transition: color 0.2s;

      &:hover {
        color: #141413;
      }
    }
  }

  .blog-categories {
    padding: 0 1rem;
  }
}
</style>
