# Description

[Homepage](https://wizardpisces.github.io/)

## Introduction
* [tiny-sass-compiler](https://github.com/wizardpisces/tiny-sass-compiler) 's  [demo page](https://wizardpisces.github.io/sass)
* [Machine Learning Demo](https://wizardpisces.github.io/machine-learning)  : Deploy and use irises prediction model on web
* [Blog](https://wizardpisces.github.io/blog/%E9%9A%8F%E7%AC%94)
* [react+vite demo](https://github.com/wizardpisces/vite-site/tree/master/sub-project)
* 微前端 Demo ： 主应用 vue3 中嵌入 react
* vite 模块联邦 demo： 主应用 vue3 中使用 react 组件

## 开发和部署

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建项目
pnpm run build
```

### 自动部署

项目已配置 GitHub Actions 自动部署功能。推送到 `main` 或 `master` 分支时会自动触发构建和部署。

#### 快速设置（两种方式任选其一）

**方式 1：跨仓库部署**（当前配置）
- 部署到 `wizardpisces/wizardpisces.github.io` 仓库
- 需要配置 Personal Access Token
- 详见：[.github/workflows/README.md](.github/workflows/README.md)

**方式 2：同仓库部署**（更简单）
- 部署到当前仓库的 `gh-pages` 分支
- 无需额外配置 token
- 将 `.github/workflows/deploy-simple.yml.example` 重命名为 `deploy-simple.yml`
- 删除或禁用 `deploy.yml`

### 手动部署

```bash
# 完整部署流程（生成索引 + 构建 + 推送）
pnpm run deploy

# 仅推送已构建的内容
pnpm run deploy:only
```

## 项目结构

```
vite-site/
├── src/
│   ├── blog/              # 博客文章
│   │   ├── AiNotes.md    # AI 相关笔记
│   │   └── ...
│   ├── components/        # Vue 组件
│   ├── pages/            # 页面
│   └── utils/            # 工具函数
├── script/
│   ├── deploy.sh         # 部署脚本
│   └── generate-search-index.js  # 搜索索引生成
└── .github/
    └── workflows/        # GitHub Actions 配置
        ├── deploy.yml    # 跨仓库部署配置
        └── README.md     # 详细配置说明
```