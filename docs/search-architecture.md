# 博客搜索架构文档

## 📋 概述

经过重构，博客搜索系统现在采用简化的架构，主要包含语义搜索和关键词搜索两种模式。

## 🏗 架构组件

### 1. 核心文件

```
src/
├── components/
│   └── blog-search.vue           # 搜索 UI 组件
└── utils/
    └── semantic-search.js        # 语义搜索核心逻辑

public/
├── blog-content.json             # 博客内容索引
└── blog-embeddings-bge.json      # BGE 中文嵌入向量

script/
├── generate-blog-index.js        # 生成博客内容索引
└── generate-embeddings-bge.js    # 生成嵌入向量
```

### 2. 已移除的冗余文件

- ❌ `src/utils/blog-search.js` - 被 `semantic-search.js` 替代
- ❌ `src/utils/transformers-adapter.js` - 不再需要浏览器端模型加载
- ❌ `public/preload-transformers.js` - 移除了向量工具库
- ❌ `public/blog-embeddings.json` - 使用 BGE 版本替代
- ❌ `onnxruntime-web` 依赖 - 不再使用浏览器端推理

## 🔍 搜索模式

### 语义搜索 (默认)
- **模型**: BAAI/bge-small-zh-v1.5 (中文优化)
- **原理**: 基于预生成嵌入向量的余弦相似度
- **查询向量生成**: TF-IDF + 关键词匹配 + 向量加权平均
- **优势**: 能理解语义相关性，不依赖精确词匹配

### 关键词搜索 (备用)
- **原理**: 简单的文本包含匹配
- **特性**: 标题匹配优先，智能摘要提取
- **用途**: 语义搜索失败时的降级方案

## 🚀 工作流程

### 预处理阶段
```bash
# 1. 生成博客内容索引
pnpm run generate-blog-index

# 2. 生成嵌入向量
pnpm run generate-blog-embeddings
```

### 搜索阶段
1. **初始化**: 加载嵌入向量和内容索引
2. **查询处理**: 提取关键词，生成查询向量
3. **相似度计算**: 计算与所有文档的余弦相似度
4. **结果排序**: 按相似度和关键词匹配排序
5. **摘要生成**: 提取相关文本片段

## 📊 性能特点

- ✅ **零网络请求**: 所有计算在客户端完成
- ✅ **快速响应**: 预计算向量，无需实时推理
- ✅ **中文优化**: BGE 模型对中文语义理解更好
- ✅ **内存友好**: 只加载必要的数据
- ✅ **降级机制**: 自动回退到关键词搜索

## 🔧 配置选项

### 相似度阈值
```javascript
// 最低相似度阈值，低于此值的结果会被过滤
const SIMILARITY_THRESHOLD = 0.1;
```

### 结果数量
```javascript
// 默认返回结果数量
const DEFAULT_LIMIT = 10;
```

### 关键词提取
```javascript
// 查询关键词数量
const QUERY_KEYWORDS = 5;
// 文档关键词数量  
const DOC_KEYWORDS = 20;
```

## 🎯 使用示例

```javascript
import { semanticSearch, isSemanticSearchAvailable } from '@/utils/semantic-search';

// 检查可用性
const available = await isSemanticSearchAvailable();

// 执行搜索
const results = await semanticSearch('AI的关键是什么', 5);
```

## 📈 未来优化方向

1. **缓存优化**: 添加查询结果缓存
2. **分词改进**: 集成更好的中文分词库
3. **多模态**: 支持图片和代码搜索
4. **实时索引**: 支持动态内容更新
5. **个性化**: 基于用户行为的搜索排序 