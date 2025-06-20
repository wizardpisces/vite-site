# Blog Content Organization

这个目录包含所有博客文章，采用简洁明确的两级分类结构。

## 目录结构

```
blog/
├── tech/              # 技术相关
│   ├── backend/      # 后端技术
│   ├── frontend/     # 前端技术
│   ├── ai/          # 人工智能
│   ├── graphics/    # 图形图像
│   └── compiler/    # 编译原理
└── thoughts/         # 思考与随笔
    ├── tech/        # 技术思考
    ├── life/        # 生活感悟
    └── reading/     # 读书笔记
```

## 分类说明

### 技术文章 (tech/)

1. 后端技术 (backend/)
   - 服务端语言（Node/Go/Rust/Python）
   - 数据存储
   - 系统架构

2. 前端技术 (frontend/)
   - JavaScript/TypeScript
   - 前端框架（Vue/React）
   - CSS/样式方案
   - 工程化实践

3. 人工智能 (ai/)
   - 机器学习基础
   - AI 应用实践
   - 模型与算法

4. 图形图像 (graphics/)
   - 图形学基础
   - 图像处理
   - WebGL/WebGPU

5. 编译原理 (compiler/)
   - 编译器设计
   - DSL 实现
   - 源码分析

### 思考随笔 (thoughts/)

1. 技术思考 (tech/)
   - 技术选型分析
   - 架构设计思考
   - 工程实践总结
   - 技术发展趋势

2. 生活感悟 (life/)
   - 日常思考
   - 管理心得
   - 生活记录

3. 读书笔记 (reading/)
   - 技术书籍
   - 管理书籍
   - 通识读物

## 写作规范

### 文件命名
- 使用kebab-case：`vue-composition-api.md`
- 中文文章使用有意义的名称：`深入理解-vue3.md`
- 系列文章使用编号：`rust学习-01-基础.md`

### 文章元数据
每篇文章开头需包含：

```yaml
---
title: 文章标题
date: 2024-03-21
category: tech/frontend
tags: [vue, typescript]
description: 文章简短描述
---
```

### 内容组织
1. 技术文章
   - 问题背景
   - 解决方案
   - 实现细节
   - 最佳实践
   - 参考资料

2. 思考随笔
   - 核心观点
   - 论据支撑
   - 实践启发
   - 个人思考 