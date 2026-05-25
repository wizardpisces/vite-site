<template>
  <section class="blog-content-search">
    <div class="search-row">
      <input
        v-model.trim="query"
        class="search-input"
        type="search"
        placeholder="搜索文章内容"
        autofocus
      />
      <button
        v-if="query"
        class="clear-button"
        type="button"
        @click="query = ''"
      >
        清除
      </button>
    </div>

    <div v-if="loading" class="search-state">正在读取文章索引...</div>
    <div v-else-if="error" class="search-state">{{ error }}</div>
    <div v-else-if="query && results.length === 0" class="search-state">没有找到相关内容</div>

    <div v-else-if="results.length > 0" class="search-results">
      <RouterLink
        v-for="result in results"
        :key="result.url"
        class="search-result"
        :to="result.url"
      >
        <span class="result-title">{{ result.title }}</span>
        <span class="result-snippet">{{ result.snippet }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, onMounted, ref } from "vue";

type BlogSearchItem = {
  title: string;
  content: string;
  url: string;
};

type BlogSearchResult = {
  title: string;
  snippet: string;
  url: string;
  score: number;
};

export default {
  name: "BlogContentSearch",
  setup() {
    const query = ref("");
    const items = ref<BlogSearchItem[]>([]);
    const loading = ref(false);
    const error = ref("");

    function makeSnippet(content: string, keyword: string) {
      const normalizedContent = content.toLowerCase();
      const normalizedKeyword = keyword.toLowerCase();
      const index = normalizedContent.indexOf(normalizedKeyword);

      if (index < 0) {
        return content.slice(0, 120).trim();
      }

      const start = Math.max(0, index - 42);
      const end = Math.min(content.length, index + keyword.length + 78);
      const prefix = start > 0 ? "..." : "";
      const suffix = end < content.length ? "..." : "";

      return `${prefix}${content.slice(start, end).trim()}${suffix}`;
    }

    const results = computed<BlogSearchResult[]>(() => {
      const keyword = query.value.trim();

      if (!keyword) {
        return [];
      }

      const normalizedKeyword = keyword.toLowerCase();

      return items.value
        .map((item) => {
          const title = item.title || "";
          const content = item.content || "";
          const lowerTitle = title.toLowerCase();
          const lowerContent = content.toLowerCase();
          const titleMatched = lowerTitle.includes(normalizedKeyword);
          const contentMatched = lowerContent.includes(normalizedKeyword);

          if (!titleMatched && !contentMatched) {
            return null;
          }

          return {
            title,
            url: item.url,
            snippet: makeSnippet(content, keyword),
            score: titleMatched ? 2 : 1,
          };
        })
        .filter((item): item is BlogSearchResult => Boolean(item))
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
        .slice(0, 8);
    });

    onMounted(async () => {
      loading.value = true;
      error.value = "";

      try {
        const response = await fetch("/blog-content.json");

        if (!response.ok) {
          throw new Error("文章索引读取失败");
        }

        items.value = await response.json();
      } catch (err) {
        error.value = err instanceof Error ? err.message : "文章索引读取失败";
      } finally {
        loading.value = false;
      }
    });

    return {
      query,
      loading,
      error,
      results,
    };
  },
};
</script>

<style lang="scss" scoped>
.blog-content-search {
  border-top: 1px solid #d8d0c4;
  background: #f7f4ed;
  padding: 16px 24px 20px;
}

.search-row {
  display: flex;
  max-width: 720px;
  margin: 0 auto;
  gap: 10px;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid #d8d0c4;
  border-radius: 0;
  background: #fffdf8;
  color: $color-text-primary;
  font-size: 14px;
  padding: 0 12px;
  outline: none;

  &::placeholder {
    color: #8a8178;
  }

  &:focus {
    border-color: $color-text-primary;
  }
}

.clear-button {
  height: 36px;
  border: 1px solid #d8d0c4;
  border-radius: 0;
  background: transparent;
  color: $color-text-secondary;
  cursor: pointer;
  padding: 0 12px;

  &:hover {
    border-color: $color-text-primary;
    color: $color-text-primary;
    background: #eee8dc;
  }
}

.search-state {
  max-width: 720px;
  margin: 12px auto 0;
  color: $color-text-muted;
  font-size: 13px;
}

.search-results {
  display: grid;
  max-width: 720px;
  margin: 14px auto 0;
  border-top: 1px solid #d8d0c4;
}

.search-result {
  display: grid;
  gap: 5px;
  padding: 12px 0;
  border-bottom: 1px solid #d8d0c4;
  color: inherit;
  text-decoration: none;

  &:hover {
    .result-title {
      color: $color-accent;
    }
  }
}

.result-title {
  color: $color-text-primary;
  font-size: 14px;
  font-weight: 500;
}

.result-snippet {
  color: $color-text-secondary;
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .blog-content-search {
    padding: 14px 12px 18px;
  }

  .search-row {
    flex-direction: column;
  }

  .clear-button {
    width: fit-content;
  }
}
</style>
