/**
 * 生成博客内容索引
 */
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

// 博客目录
const BLOG_DIR = path.join(__dirname, '../src/blog');
// 输出文件
const OUTPUT_FILE = path.join(__dirname, '../public/blog-content.json');

/**
 * 从 Markdown 文件中提取内容
 * @param {string} filePath - Markdown 文件路径
 * @returns {Object} 提取的内容
 */
function extractContentFromFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 获取相对路径
    const relativePath = path.relative(BLOG_DIR, filePath);
    
    // 获取博客名称（不带扩展名）
    const blogName = path.basename(relativePath, path.extname(relativePath));
    
    // 获取博客所在目录
    const blogDir = path.dirname(relativePath);
    
    // 构建 URL 路径
    // let url;
    // if (blogDir === '.') {
    //   // 根目录的博客
    //   url = `/blog/${blogName}`;
    // } else {
    //   // 子目录的博客
    //   url = `/blog/${path.join(blogDir, blogName)}`;
    // }

    const url = `/blog/${blogName}`;
    
    // 获取标题（使用文件第一行或文件名）
    let title = '';
    const firstLine = content.split('\n')[0];
    if (firstLine.startsWith('# ')) {
      title = firstLine.replace(/^#\s+/, '').trim();
    } else {
      title = blogName.replace(/-/g, ' ');
    }
    
    // 简单处理内容（移除 Markdown 标记）
    const text = content
      .replace(/^#.*$/gm, '') // 移除标题
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`.*?`/g, '') // 移除内联代码
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体
      .replace(/\n+/g, ' ') // 将多个换行替换为空格
      .replace(/\s+/g, ' ') // 将多个空白字符替换为单个空格
      .trim();
    
    return {
      title,
      content: text,
      url,
      path: relativePath
    };
  } catch (error) {
    console.error(`处理文件失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 生成博客内容索引
 */
async function generateBlogIndex() {
  try {
    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 查找所有 Markdown 文件
    const files = await glob('**/*.{md,mdx}', {
      cwd: BLOG_DIR,
      absolute: true
    });
    
    console.log(`找到 ${files.length} 个 Markdown 文件`);
    
    // 提取内容
    const blogContents = [];
    
    // 分批处理，避免内存溢出
    const batchSize = 20;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      console.log(`处理第 ${i + 1} 到 ${Math.min(i + batchSize, files.length)} 个文件...`);
      
      for (const file of batch) {
        const content = extractContentFromFile(file);
        if (content) {
          blogContents.push(content);
        }
      }
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }
    }
    
    // 保存到文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogContents, null, 2));
    
    console.log(`已生成博客内容索引，共 ${blogContents.length} 篇文章`);
  } catch (error) {
    console.error('生成博客内容索引失败:', error);
    process.exit(1);
  }
}

// 执行脚本
generateBlogIndex(); 