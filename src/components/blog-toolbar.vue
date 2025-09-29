<template>
  <div class="blog-toolbar">
    <div class="toolbar-content">
      <!-- 搜索组件 -->
      <div class="search-section">
        <blog-search />
      </div>
      
      <!-- 字体控制器 -->
      <div class="font-control" v-if="showFontControl">
        <div class="font-size-buttons">
          <button 
            v-for="size in fontSizes" 
            :key="size.value"
            @click="setFontSize(size.value)"
            :class="['font-btn', { active: currentFontSize === size.value }]"
            :title="`字体大小: ${size.label}`"
          >
            <span :class="size.iconClass">{{ size.icon }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, provide, inject } from 'vue';
import BlogSearch from './blog-search.vue';

export default {
  name: 'BlogToolbar',
  components: {
    BlogSearch
  },
  props: {
    showFontControl: {
      type: Boolean,
      default: true
    }
  },
  emits: ['font-size-change'],
  setup(props, { emit }) {
    // 字体大小控制
    const currentFontSize = ref('medium');
    const fontSizes = [
      { value: 'small', label: '小', icon: 'A', iconClass: 'small-icon' },
      { value: 'medium', label: '中', icon: 'A', iconClass: 'medium-icon' },
      { value: 'large', label: '大', icon: 'A', iconClass: 'large-icon' },
      { value: 'xlarge', label: '超大', icon: 'A', iconClass: 'xlarge-icon' }
    ];

    const setFontSize = (size: string) => {
      currentFontSize.value = size;
      // 保存用户偏好到localStorage
      localStorage.setItem('blog-font-size', size);
      // 向父组件发出事件
      emit('font-size-change', size);
    };

    // 从localStorage恢复用户偏好
    const savedFontSize = localStorage.getItem('blog-font-size');
    if (savedFontSize && fontSizes.find(s => s.value === savedFontSize)) {
      currentFontSize.value = savedFontSize;
    }

    // 提供字体大小给子组件使用
    provide('currentFontSize', currentFontSize);

    return {
      currentFontSize,
      fontSizes,
      setFontSize,
    };
  }
};
</script>

<style lang="scss" scoped>
.blog-toolbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  position: sticky;
  top: 10px; // 考虑主导航栏高度  
  z-index: 150; // 提高z-index，确保在TOC上方
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
  width: 100%; // 确保宽度
  overflow: hidden; // 防止子元素溢出
}

.toolbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 20px; // 进一步减少padding
  gap: 20px;
  width: 100%; // 确保宽度
  box-sizing: border-box; // 确保padding不会导致溢出
}

.search-section {
  flex: 1;
  max-width: 600px;
}

.font-control {
  flex-shrink: 0;
  min-width: 140px; // 固定最小宽度，防止移动
  position: static; // 使用静态定位，防止脱离文档流
  display: flex;
  align-self: self-start;
  
  .font-size-buttons {
    display: flex;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 8px; // 稍微减少圆角
    padding: 2px; // 减少padding
    box-shadow: 
      0 2px 8px rgba(37, 99, 235, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(37, 99, 235, 0.12);
    gap: 1px; // 减少间距
    justify-content: center; // 居中对齐
    position: static !important; // 强制确保不会脱离正常文档流
  }

  .font-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px; // 稍微减少尺寸
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 4px; // 减少圆角
    cursor: pointer;
    transition: all 0.2s ease;
    color: #64748b;
    font-weight: 600;
    position: static; // 确保按钮不会脱离正常布局

    &:hover {
      background: rgba(37, 99, 235, 0.08);
      color: #2563eb;
      transform: scale(1.05);
    }

    &.active {
      background: #2563eb;
      color: white;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
    }

    // 不同大小的A字母图标
    .small-icon { font-size: 10px; }
    .medium-icon { font-size: 12px; }
    .large-icon { font-size: 14px; }
    .xlarge-icon { font-size: 16px; }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .toolbar-content {
    padding: 6px 16px;
    gap: 12px;
  }
  
  .font-control {
    .font-size-buttons {
      padding: 2px;
    }
    
    .font-btn {
      width: 28px;
      height: 28px;
      
      .small-icon { font-size: 10px; }
      .medium-icon { font-size: 12px; }
      .large-icon { font-size: 14px; }
      .xlarge-icon { font-size: 16px; }
    }
  }
}

@media (max-width: 480px) {
  .blog-toolbar {
    position: sticky; // 保持粘顶，确保字体控制始终可见
    top: 70px;
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
  }
  
  .search-section {
    max-width: 100%;
  }
}

// 确保工具栏与侧边栏的协调
@media (min-width: 960px) {
  .blog-toolbar {
    .toolbar-content {
      padding-left: 40px; // 与左侧边栏协调
      padding-right: 40px; // 与右侧边栏协调
    }
  }
}
</style>
