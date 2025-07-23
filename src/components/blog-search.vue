<template>
  <div class="blog-search">
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        placeholder="搜索博客内容..."
        :disabled="isLoading"
      />
      <button 
        @click="handleSearch" 
        :disabled="isLoading || !searchQuery.trim()"
      >
        <span v-if="isLoading">搜索中...</span>
        <span v-else>搜索</span>
      </button>
    </div>

    <div v-if="searchResults.length > 0" class="search-results">
      <h3>搜索结果 ({{ searchResults.length }})</h3>
      <div v-for="(result, index) in searchResults" :key="index" class="result-item">
        <h4>
          <a :href="result.url">{{ result.title }}</a>
        </h4>
        <p class="result-content" v-if="result.snippet" v-html="highlightQuery(result.snippet)"></p>
        <p class="result-content" v-else v-html="highlightQuery(result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''))"></p>
        <div class="result-meta">
          <span class="result-path">{{ result.url }}</span>
          <span v-if="result.score" class="result-score">相关度: {{ (result.score * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div v-else-if="hasSearched && !isLoading" class="no-results">
      <p>未找到与 "{{ searchQuery }}" 相关的内容</p>
    </div>

    <div v-if="error" class="search-error">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as blogSearch from '@/utils/blog-search';

export default {
  name: 'BlogSearch',
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isLoading = ref(false);
    const hasSearched = ref(false);
    const error = ref('');
    
    // 高亮搜索查询词
    const highlightQuery = (text) => {
      if (!searchQuery.value.trim() || !text) return text;
      
      const query = searchQuery.value.trim();
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      return text.replace(regex, match => `<span class="highlight">${match}</span>`);
    };
    
    // 执行搜索
    const handleSearch = async () => {
      if (!searchQuery.value.trim() || isLoading.value) return;
      
      try {
        isLoading.value = true;
        error.value = '';
        hasSearched.value = true;
        
        const results = await blogSearch.search(searchQuery.value, 5);
        searchResults.value = results;
      } catch (e) {
        console.error('搜索失败', e);
        error.value = '搜索失败，请重试';
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    };
    
    // 组件挂载时初始化
    onMounted(() => {
      // 延迟初始化，避免阻塞页面渲染
      setTimeout(() => {
        blogSearch.initSearchEngine().catch(e => {
          console.warn('搜索引擎初始化失败，将在搜索时重试', e);
        });
      }, 1000);
    });
    
    return {
      searchQuery,
      searchResults,
      isLoading,
      hasSearched,
      error,
      handleSearch,
      highlightQuery
    };
  }
};
</script>

<style lang="scss">
.blog-search {
  margin-bottom: 2rem;

  .search-container {
    display: flex;
    margin-bottom: 1rem;

    input {
      flex: 1;
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
      font-size: 1rem;
      outline: none;

      &:focus {
        border-color: $color-primary;
      }

      &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
    }

    button {
      padding: 0.5rem 1.5rem;
      background-color: $color-primary;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background-color: darken($color-primary, 10%);
      }

      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    }
  }

  .search-results {
    h3 {
      margin-bottom: 1rem;
      font-size: 1.2rem;
      color: #333;
    }

    .result-item {
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
      background-color: #f9f9f9;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      }

      h4 {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;

        a {
          color: $color-primary;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .result-content {
        margin: 0.5rem 0;
        font-size: 0.95rem;
        color: #555;
        line-height: 1.5;
        
        .highlight {
          background-color: rgba($color-primary, 0.2);
          padding: 0 2px;
          border-radius: 2px;
          font-weight: bold;
        }
      }

      .result-meta {
        font-size: 0.85rem;
        color: #888;
        display: flex;
        justify-content: space-between;
        
        .result-score {
          font-weight: 500;
          color: $color-primary;
        }
      }
    }
  }

  .no-results, .search-error {
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    text-align: center;
    color: #666;
  }

  .search-error {
    background-color: #fff0f0;
    color: #d32f2f;
  }
}

@media (max-width: 768px) {
  .blog-search {
    .search-container {
      flex-direction: column;

      input {
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      button {
        border-radius: 4px;
        width: 100%;
      }
    }
  }
}
</style> 