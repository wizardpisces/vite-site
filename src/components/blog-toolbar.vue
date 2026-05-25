<template>
  <div class="blog-toolbar">
    <div class="toolbar-content">
      <!-- 左侧栏切换 -->
      <button
        class="layout-toggle-btn"
        :class="{ active: showLeftSidebar }"
        @click="toggleLeftSidebar"
        title="切换左侧菜单"
      >
        <span class="toggle-icon">☰</span>
      </button>

      <div class="toolbar-actions">
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

        <button
          class="text-toggle-btn"
          :class="{ active: contentSearchOpen }"
          type="button"
          @click="contentSearchOpen = !contentSearchOpen"
        >
          搜索内容
        </button>

        <!-- 右侧目录切换 -->
        <button
          class="layout-toggle-btn"
          :class="{ active: showRightToc }"
          @click="toggleRightToc"
          title="切换右侧目录"
        >
          <span class="toggle-icon">≡</span>
        </button>
      </div>
    </div>

    <blog-content-search v-if="contentSearchOpen" />
  </div>
</template>

<script lang="ts">
import { ref, provide } from 'vue';
import BlogContentSearch from './blog-content-search.vue';
import useLayout from '@/composition/use-layout';

export default {
  name: 'BlogToolbar',
  components: {
    BlogContentSearch,
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
    const contentSearchOpen = ref(false);
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

    provide('currentFontSize', currentFontSize);

    const { showLeftSidebar, showRightToc, toggleLeftSidebar, toggleRightToc } = useLayout();

    return {
      currentFontSize,
      fontSizes,
      setFontSize,
      contentSearchOpen,
      showLeftSidebar,
      showRightToc,
      toggleLeftSidebar,
      toggleRightToc,
    };
  }
};
</script>

<style lang="scss" scoped>
.blog-toolbar {
  background: #f7f4ed;
  border-bottom: 1px solid #d8d0c4;
  position: relative;
  z-index: 1;
  box-shadow: none;
  width: 100%;
  overflow: hidden;
  min-height: 56px;
}

.toolbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.layout-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid #d8d0c4;
  background: transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  color: #8a8178;

  .toggle-icon {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    background: #eee8dc;
    border-color: #141413;
    color: #141413;
  }

  &.active {
    background: #141413;
    border-color: #141413;
    color: #fff;
  }
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.text-toggle-btn {
  height: 30px;
  border: 1px solid #d8d0c4;
  border-radius: 0;
  background: transparent;
  color: $color-text-secondary;
  cursor: pointer;
  font-size: 13px;
  padding: 0 10px;
  white-space: nowrap;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;

  &:hover,
  &.active {
    border-color: #141413;
    color: #141413;
    background: #eee8dc;
  }
}

.font-control {
  flex-shrink: 0;
  min-width: 140px;
  position: static;
  display: flex;
  align-self: self-start;
  
  .font-size-buttons {
    display: flex;
    background: transparent;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    border: 1px solid #d8d0c4;
    gap: 0;
    justify-content: center;
    position: static !important;
  }

  .font-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px; // 稍微减少尺寸
    height: 28px;
    border: none;
    border-right: 1px solid #d8d0c4;
    background: transparent;
    border-radius: 0;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
    color: #5f574f;
    font-weight: 600;
    position: static;

    &:last-child {
      border-right: 0;
    }

    &:hover {
      background: #eee8dc;
      color: #141413;
    }

    &.active {
      background: #141413;
      color: white;
      box-shadow: none;
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
  .toolbar-content {
    gap: 12px;
    padding: 8px 12px;
  }

  .toolbar-actions {
    gap: 10px;
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
