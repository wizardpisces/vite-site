<template>
  <div class="blog-search" :class="{ 'expanded': isExpanded || hasResults }">
    <!-- 紧凑搜索入口 -->
    <div class="compact-search-bar" v-if="!isExpanded && !hasResults">
      <div class="search-icon" @click="toggleSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="21 21l-4.35-4.35"></path>
        </svg>
      </div>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索博客..." 
        @keyup.enter="handleSearch"
        @focus="expandSearch"
        class="compact-search-input"
        ref="searchInput"
      />
      <div class="search-mode-toggle" @click="toggleSearchMode" :title="searchMode === 'semantic' ? '语义搜索' : '关键词搜索'">
        {{ searchMode === 'semantic' ? '🧠' : '🔍' }}
      </div>
    </div>

    <!-- 展开的搜索界面 -->
    <div v-if="isExpanded || hasResults" class="expanded-search">
      <div class="search-header">
        <div class="search-input-container">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索博客内容..." 
            @keyup.enter="handleSearch"
            class="search-input"
            ref="expandedSearchInput"
          />
          <button @click="handleSearch" class="search-button" :disabled="isLoading">
            <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="21 21l-4.35-4.35"></path>
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>
        
        <div class="search-controls">
          <div class="search-mode-selector">
            <button 
              @click="searchMode = 'semantic'" 
              :class="['mode-btn', { active: searchMode === 'semantic' }]"
              :title="'语义搜索 - 基于BGE中文模型的向量相似度'"
            >
              🧠 语义
            </button>
            <button 
              @click="searchMode = 'keyword'" 
              :class="['mode-btn', { active: searchMode === 'keyword' }]"
              :title="'关键词搜索 - 基于关键词匹配'"
            >
              🔍 关键词
            </button>
          </div>
          
           <button @click="collapseSearch" class="collapse-btn" title="关闭搜索">
             <div class="close-icon">
               <span class="close-line close-line-1"></span>
               <span class="close-line close-line-2"></span>
             </div>
           </button>
        </div>
      </div>

      <!-- 预热状态 -->
      <div v-if="isWarmingUp" class="warmup-notice">
        <span class="warmup-icon">🚀</span>
        <span>{{ warmupProgress }}</span>
        <div class="warmup-spinner"></div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results-container">
      <div class="results-header">
        <h3>搜索结果 ({{ searchResults.length }})</h3>
        <button @click="collapseSearch" class="close-results-btn" title="关闭搜索结果">
          <div class="close-icon">
            <span class="close-line close-line-1"></span>
            <span class="close-line close-line-2"></span>
          </div>
        </button>
      </div>
      
      <div class="search-results">
        <div v-for="result in searchResults" :key="result.url" class="search-result-item">
          <h4>
            <a :href="result.url">{{ result.title }}</a>
            <span v-if="result.containsQuery" class="match-tag">包含匹配词</span>
            <span v-if="searchMode === 'semantic' && result.score" class="score-tag">
              相似度: {{ (result.score * 100).toFixed(1) }}%
            </span>
            <span v-if="searchMode === 'semantic' && result.matchedChunks" class="chunk-tag">
              {{ result.matchedChunks }}/{{ result.totalChunks }} 段落匹配
            </span>
          </h4>
          <p class="result-content" v-if="result.snippet" v-html="highlightQuery(result.snippet)"></p>
        </div>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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
    const isExpanded = ref(false);
    const searchInput = ref(null);
    const expandedSearchInput = ref(null);

    // 计算是否有搜索结果
    const hasResults = computed(() => {
      return searchResults.value.length > 0 || hasSearched.value;
    });

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
          warmupProgress.value = '正在加载分段语义搜索模型...';
          
          try {
            await warmupSemanticSearch();
            warmupProgress.value = '分段语义搜索已准备就绪！';
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

    // 搜索界面展开/收缩控制
    const expandSearch = () => {
      isExpanded.value = true;
      nextTick(() => {
        if (expandedSearchInput.value) {
          expandedSearchInput.value.focus();
        }
      });
    };

    const collapseSearch = () => {
      isExpanded.value = false;
      searchQuery.value = '';
      searchResults.value = [];
      hasSearched.value = false;
      error.value = '';
    };

    const toggleSearch = () => {
      if (isExpanded.value) {
        collapseSearch();
      } else {
        expandSearch();
      }
    };

    const toggleSearchMode = () => {
      searchMode.value = searchMode.value === 'semantic' ? 'keyword' : 'semantic';
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
      isExpanded,
      hasResults,
      searchInput,
      expandedSearchInput,
      handleSearch,
      switchToKeywordSearch,
      expandSearch,
      collapseSearch,
      toggleSearch,
      toggleSearchMode,
      highlightQuery
    };
  }
};
</script>

<style lang="scss" scoped>
.blog-search {
  max-width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
}

/* 紧凑搜索条 */
.compact-search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 20px;
  padding: 6px 12px; // 减少padding，使更紧凑
  box-shadow: 
    0 2px 12px rgba(37, 99, 235, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  max-width: 400px;
  margin: 0 auto 8px; // 减少下边距
  min-height: 32px; // 减少最小高度
}

.compact-search-bar:hover {
  border-color: rgba(37, 99, 235, 0.25);
  box-shadow: 
    0 4px 16px rgba(37, 99, 235, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.search-icon {
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  
  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    fill: none;
  }
}

.search-icon:hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.compact-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  padding: 4px 0;
  color: #1a202c;
}

.compact-search-input::placeholder {
  color: #94a3b8;
}

.search-mode-toggle {
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  user-select: none;
}

.search-mode-toggle:hover {
  background: rgba(37, 99, 235, 0.15);
  transform: scale(1.05);
}

/* 展开的搜索界面 */
.expanded-search {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 
    0 4px 20px rgba(37, 99, 235, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.search-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-container {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-button {
  padding: 12px;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  
  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
  }
}

.search-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #0284c7);
  transform: translateY(-1px);
}

.search-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-mode-selector {
  display: flex;
  gap: 4px;
}

.mode-btn {
  padding: 6px 12px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.05);
}

.mode-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.collapse-btn {
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  box-shadow: 
    0 2px 8px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  
  .close-icon {
    position: relative;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-line {
    position: absolute;
    width: 14px;
    height: 2px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 1px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(99, 102, 241, 0.2);
    
    &.close-line-1 {
      transform: rotate(45deg);
    }
    
    &.close-line-2 {
      transform: rotate(-45deg);
    }
  }
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 
    0 4px 16px rgba(99, 102, 241, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  
  .close-line {
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
    
    &.close-line-1 {
      transform: rotate(45deg) scale(1.15);
    }
    
    &.close-line-2 {
      transform: rotate(-45deg) scale(1.15);
    }
  }
}

.collapse-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(99, 102, 241, 0.2),
    inset 0 2px 4px rgba(99, 102, 241, 0.1);
  
  .close-line {
    background: linear-gradient(90deg, #3730a3, #6b21a8);
    transform: scale(0.95);
    
    &.close-line-1 {
      transform: rotate(45deg) scale(0.95);
    }
    
    &.close-line-2 {
      transform: rotate(-45deg) scale(0.95);
    }
  }
}

.warmup-notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.warmup-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 搜索结果容器 */
.search-results-container {
  position: relative;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 16px;
  box-shadow: 
    0 4px 20px rgba(37, 99, 235, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  background: rgba(37, 99, 235, 0.02);
}

.results-header h3 {
  margin: 0;
  color: #1a202c;
  font-size: 16px;
  font-weight: 600;
}

.close-results-btn {
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  box-shadow: 
    0 2px 8px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  
  .close-icon {
    position: relative;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-line {
    position: absolute;
    width: 14px;
    height: 2px;
    background: linear-gradient(90deg, #ef4444, #f87171);
    border-radius: 1px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(239, 68, 68, 0.2);
    
    &.close-line-1 {
      transform: rotate(45deg);
    }
    
    &.close-line-2 {
      transform: rotate(-45deg);
    }
  }
}

.close-results-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(239, 68, 68, 0.25);
  box-shadow: 
    0 4px 16px rgba(239, 68, 68, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  
  .close-line {
    background: linear-gradient(90deg, #dc2626, #ef4444);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
    
    &.close-line-1 {
      transform: rotate(45deg) scale(1.15);
    }
    
    &.close-line-2 {
      transform: rotate(-45deg) scale(1.15);
    }
  }
}

.close-results-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(239, 68, 68, 0.2),
    inset 0 2px 4px rgba(239, 68, 68, 0.1);
  
  .close-line {
    background: linear-gradient(90deg, #b91c1c, #dc2626);
    transform: scale(0.95);
    
    &.close-line-1 {
      transform: rotate(45deg) scale(0.95);
    }
    
    &.close-line-2 {
      transform: rotate(-45deg) scale(0.95);
    }
  }
}

.search-results {
  max-height: 60vh; // 限制最大高度，避免超出视窗
  overflow-y: auto; // 添加垂直滚动
  padding: 16px 20px;
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(37, 99, 235, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(37, 99, 235, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(37, 99, 235, 0.3);
    }
  }
}

// 已在上面定义了.results-header h3样式

.search-result-item {
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(37, 99, 235, 0.08);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(37, 99, 235, 0.15);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    transform: translateY(-1px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.search-result-item h4 {
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-result-item h4 a {
  color: #2563eb;
  text-decoration: none;
  flex: 1;
  font-weight: 600;
  transition: color 0.2s ease;
}

.search-result-item h4 a:hover {
  color: #1d4ed8;
  text-decoration: none;
}

.match-tag {
  background: rgba(37, 99, 235, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.1);
}

.score-tag {
  background: #f0f8ff;
  color: #333;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: normal;
}

.chunk-tag {
  background: #fff3cd;
  color: #856404;
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