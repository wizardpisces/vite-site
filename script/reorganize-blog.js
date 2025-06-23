const fs = require('fs');
const path = require('path');

const BLOG_ROOT = path.join(__dirname, '../src/blog');

// 新的目录结构
const NEW_STRUCTURE = {
  'tech': {
    'languages': ['编程语言'],
    'frameworks': ['编程框架'],
    'compiler': ['compiler'],
    'ai': ['AI'],
    'graphics': ['图形'],
    'architecture': ['存储'],
    '_files': [] // 技术相关的单独文件
  },
  'thoughts': {
    'tech-thoughts': ['日常思考'],
    'reading-notes': ['书'],
    'life': ['daily-life'],
    'career': [],
    '_files': ['self-introduction.mdx', 'hiring.mdx'] // 思考相关的单独文件
  },
  '_files': ['README.md', 'Introduction.md'] // 根目录文件
};

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 移动文件或目录
function moveContent(src, dest) {
  if (!fs.existsSync(src)) return;
  
  ensureDir(path.dirname(dest));
  
  if (fs.existsSync(dest)) {
    // 如果目标已存在，合并内容
    const srcStats = fs.statSync(src);
    if (srcStats.isDirectory()) {
      const files = fs.readdirSync(src);
      files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        moveContent(srcFile, destFile);
      });
    }
  } else {
    // 直接移动
    fs.renameSync(src, dest);
  }
}

// 处理单独的文件
function handleFiles(files, targetDir) {
  files.forEach(file => {
    const srcPath = path.join(BLOG_ROOT, file);
    const destPath = path.join(targetDir, file);
    if (fs.existsSync(srcPath)) {
      moveContent(srcPath, destPath);
    }
  });
}

// 创建新的目录结构
Object.entries(NEW_STRUCTURE).forEach(([mainCategory, subCategories]) => {
  if (mainCategory === '_files') {
    // 处理根目录文件
    handleFiles(subCategories, BLOG_ROOT);
    return;
  }

  const mainCategoryPath = path.join(BLOG_ROOT, mainCategory);
  ensureDir(mainCategoryPath);
  
  Object.entries(subCategories).forEach(([subCategory, oldDirs]) => {
    if (subCategory === '_files') {
      // 处理主分类下的单独文件
      handleFiles(oldDirs, mainCategoryPath);
      return;
    }

    const subCategoryPath = path.join(mainCategoryPath, subCategory);
    ensureDir(subCategoryPath);
    
    // 移动旧目录的内容
    oldDirs.forEach(oldDir => {
      const oldPath = path.join(BLOG_ROOT, oldDir);
      if (fs.existsSync(oldPath)) {
        moveContent(oldPath, subCategoryPath);
      }
    });
  });
});

// 更新分类名称映射
const categoryNamesPath = path.join(__dirname, '../src/composition/use-blog.ts');
const categoryNamesContent = `
// 更新分类名称映射
const CATEGORY_NAMES: { [key: string]: string } = {
  // 一级分类
  'tech': '技术博客',
  'thoughts': '随笔与思考',
  
  // 二级分类 - tech
  'languages': '编程语言',
  'frameworks': '框架工具',
  'compiler': '编译原理',
  'ai': '人工智能',
  'graphics': '图形图像',
  'architecture': '系统架构',
  
  // 二级分类 - thoughts
  'tech-thoughts': '技术思考',
  'reading-notes': '读书笔记',
  'life': '生活随笔',
  'career': '职业发展'
};
`;

// 更新 use-blog.ts 中的分类名称映射
const useBlogContent = fs.readFileSync(categoryNamesPath, 'utf8');
const updatedContent = useBlogContent.replace(
  /const CATEGORY_NAMES[\s\S]*?};/,
  categoryNamesContent.trim()
);
fs.writeFileSync(categoryNamesPath, updatedContent);

console.log('Blog structure reorganized successfully!'); 