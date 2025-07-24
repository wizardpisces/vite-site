<template>
  <div class="blog-search">
    <div class="search-container">
      <div class="search-mode-selector">
        <label>
          <input type="radio" v-model="searchMode" value="semantic" />
          语义搜索
        </label>
        <label>
          <input type="radio" v-model="searchMode" value="keyword" />
          关键词搜索
        </label>
      </div>
      
      <div class="search-input-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索博客内容..." 
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button @click="handleSearch" class="search-button" :disabled="isLoading">
          {{ isLoading ? '搜索中...' : '搜索' }}
        </button>
      </div>
    </div>

    <!-- 预热状态 -->
    <div v-if="isWarmingUp" class="warmup-notice">
      <p>🚀 {{ warmupProgress }}</p>
      <div class="warmup-spinner"></div>
    </div>

    <!-- 搜索模式说明 -->
    <div v-else-if="searchMode === 'semantic'" class="search-notice search-notice-semantic">
      <p>🧠 使用语义搜索模式</p>
      <p class="search-tip">基于 BGE 中文模型的语义向量相似度，能找到语义相关的内容</p>
    </div>
    <div v-else-if="searchMode === 'keyword'" class="search-notice">
      <p>🔍 使用关键词搜索模式</p>
      <p class="search-tip">基于关键词匹配，查找包含搜索词的内容</p>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h3>搜索结果 ({{ searchResults.length }})</h3>
      </div>
      
      <div v-for="result in searchResults" :key="result.url" class="search-result-item">
        <h4>
          <a :href="result.url">{{ result.title }}</a>
          <span v-if="result.containsQuery" class="match-tag">包含匹配词</span>
          <span v-if="searchMode === 'semantic' && result.score" class="score-tag">
            相似度: {{ (result.score * 100).toFixed(1) }}%
          </span>
        </h4>
        <p class="result-content" v-if="result.snippet" v-html="highlightQuery(result.snippet)"></p>
      </div>
    </div>

    <!-- 无结果 -->
    <div v-else-if="hasSearched && !isLoading" class="no-results">
      <p>未找到与 "{{ searchQuery }}" 相关的内容</p>
      <p v-if="searchMode === 'semantic'" class="search-tip">
        尝试使用不同的关键词或切换到关键词搜索
        <button @click="switchToKeywordSearch" class="switch-mode-btn">切换到关键词搜索</button>
      </p>
    </div>

    <!-- 初始化状态 -->
    <div v-if="isInitializing" class="initializing">
      <p>🚀 正在初始化搜索引擎...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-message">
      <p>❌ {{ error }}</p>
      <button @click="switchToKeywordSearch" class="switch-mode-btn">切换到关键词搜索</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { semanticSearch, isSemanticSearchAvailable, warmupSemanticSearch } from '@/utils/semantic-search';

export default {
  name: 'BlogSearch',
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const searchMode = ref('semantic'); // 默认使用语义搜索
    const isLoading = ref(false);
    const hasSearched = ref(false);
    const isInitializing = ref(true);
    const semanticAvailable = ref(false);
    const error = ref('');
    const isWarmingUp = ref(false);
    const warmupProgress = ref('');

    // 简单的关键词搜索函数
    const keywordSearch = async (query, limit = 10) => {
      try {
        const response = await fetch('/blog-content.json');
        const content = await response.json();
        
        const lowerQuery = query.toLowerCase();
        const results = [];
        
        for (const item of content) {
          const title = item.title || '';
          const text = item.content || '';
          const lowerTitle = title.toLowerCase();
          const lowerText = text.toLowerCase();
          
          // 简单的匹配逻辑
          if (lowerTitle.includes(lowerQuery) || lowerText.includes(lowerQuery)) {
            let snippet = text.length > 200 ? text.substring(0, 200) + '...' : text;
            
            // 如果包含查询词，提取相关部分
            if (lowerText.includes(lowerQuery)) {
              const queryIndex = lowerText.indexOf(lowerQuery);
              const start = Math.max(0, queryIndex - 100);
              const end = Math.min(text.length, queryIndex + query.length + 100);
              snippet = text.substring(start, end).trim();
              if (start > 0) snippet = '...' + snippet;
              if (end < text.length) snippet += '...';
            }
            
            results.push({
              title,
              url: item.url,
              snippet,
              containsQuery: true,
              score: lowerTitle.includes(lowerQuery) ? 0.9 : 0.7 // 标题匹配优先
            });
          }
        }
        
        // 按分数排序
        return results
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
          
      } catch (error) {
        console.error('❌ 关键词搜索失败:', error);
        return [];
      }
    };

    // 初始化和预热
    onMounted(async () => {
      try {
        // 检查语义搜索是否可用
        const available = await isSemanticSearchAvailable();
        semanticAvailable.value = available;
        
        if (available) {
          console.log('✅ 语义搜索可用');
          
          // 在后台预热模型
          isWarmingUp.value = true;
          warmupProgress.value = '正在加载语义搜索模型...';
          
          try {
            await warmupSemanticSearch();
            warmupProgress.value = '语义搜索已准备就绪！';
            console.log('🔥 语义搜索预热完成');
            
            // 显示完成状态一小段时间
            setTimeout(() => {
              isWarmingUp.value = false;
              warmupProgress.value = '';
            }, 1500);
          } catch (warmupError) {
            console.warn('⚠️ 语义搜索预热失败，但仍可使用:', warmupError);
            isWarmingUp.value = false;
            warmupProgress.value = '';
          }
        } else {
          console.log('⚠️ 语义搜索不可用，使用关键词搜索');
          searchMode.value = 'keyword';
        }
        
        isInitializing.value = false;
      } catch (err) {
        console.error('❌ 搜索引擎初始化失败:', err);
        error.value = '搜索引擎初始化失败';
        searchMode.value = 'keyword';
        isInitializing.value = false;
      }
    });

    // 监听搜索模式变化
    watch(searchMode, (newMode) => {
      if (newMode === 'semantic' && !semanticAvailable.value) {
        searchMode.value = 'keyword';
        error.value = '语义搜索不可用，已切换到关键词搜索';
      } else {
        error.value = '';
      }
    });

    // 执行搜索
    const handleSearch = async () => {
      if (!searchQuery.value.trim()) {
        return;
      }

      isLoading.value = true;
      hasSearched.value = true;
      error.value = '';

      try {
        let results = [];
        
        if (searchMode.value === 'semantic') {
          console.log(`🧠 使用语义搜索: "${searchQuery.value}"`);
          
          try {
            results = await semanticSearch(searchQuery.value, 10);
          } catch (semanticError) {
            console.error('❌ 语义搜索失败，回退到关键词搜索:', semanticError);
            error.value = '语义搜索失败，自动切换到关键词搜索';
            results = await keywordSearch(searchQuery.value, 10);
          }
        } else {
          console.log(`🔍 使用关键词搜索: "${searchQuery.value}"`);
          results = await keywordSearch(searchQuery.value, 10);
        }

        searchResults.value = results;
        console.log(`✅ 搜索完成，返回 ${results.length} 个结果`);
        
      } catch (err) {
        console.error('❌ 搜索失败:', err);
        error.value = '搜索失败，请重试';
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // 切换到关键词搜索
    const switchToKeywordSearch = () => {
      searchMode.value = 'keyword';
      error.value = '';
      if (searchQuery.value.trim()) {
        handleSearch();
      }
    };

    // 高亮查询词
    const highlightQuery = (text) => {
      if (!searchQuery.value.trim()) {
        return text;
      }
      
      const query = searchQuery.value.trim();
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    return {
      searchQuery,
      searchResults,
      searchMode,
      isLoading,
      hasSearched,
      isInitializing,
      semanticAvailable,
      error,
      isWarmingUp,
      warmupProgress,
      handleSearch,
      switchToKeywordSearch,
      highlightQuery
    };
  }
};
</script>

<style scoped>
.blog-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.search-mode-selector {
  margin-bottom: 15px;
  display: flex;
  gap: 20px;
}

.search-mode-selector label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-weight: 500;
}

.search-input-container {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007acc;
}

.search-button {
  padding: 12px 24px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-button:hover:not(:disabled) {
  background: #005999;
}

.search-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.search-notice {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.search-notice-semantic {
  background: #f0f8ff;
  border-color: #b3d9ff;
}

.search-notice p {
  margin: 0;
}

.search-tip {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.warmup-notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.warmup-notice p {
  margin: 0;
  font-weight: 500;
}

.warmup-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-results {
  margin-top: 20px;
}

.results-header h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.search-result-item {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.search-result-item h4 {
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-result-item h4 a {
  color: #007acc;
  text-decoration: none;
  flex: 1;
}

.search-result-item h4 a:hover {
  text-decoration: underline;
}

.match-tag {
  background: #e7f3ff;
  color: #0066cc;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: normal;
}

.score-tag {
  background: #f0f8ff;
  color: #333;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: normal;
}

.result-content {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.result-content :deep(mark) {
  background: #ffeb3b;
  padding: 1px 2px;
  border-radius: 2px;
}

.no-results, .initializing, .error-message {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.switch-mode-btn {
  margin-left: 10px;
  padding: 4px 12px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.switch-mode-btn:hover {
  background: #005999;
}

.error-message {
  color: #d32f2f;
}
</style> 