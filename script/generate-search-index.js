/**
 * 统一的搜索索引生成器
 * 直接从 src/blog 目录读取内容，生成内容索引和嵌入向量
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');
const blogDir = path.join(rootDir, 'src', 'blog');
const publicDir = path.join(rootDir, 'public');

// 输出文件路径
const contentOutputPath = path.join(publicDir, 'blog-content.json');
const embeddingsOutputPath = path.join(publicDir, 'blog-embeddings-bge.json');

/**
 * 递归读取目录中的所有 markdown 文件
 */
function readMarkdownFiles(dir, baseUrl = '/blog') {
  const files = [];
  
  function traverse(currentDir, currentUrl) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // 递归处理子目录
        traverse(itemPath, `${currentUrl}/${item}`);
      } else if (item.endsWith('.md')) {
        // 处理 markdown 文件
        const content = fs.readFileSync(itemPath, 'utf-8');
        const fileName = path.basename(item, path.extname(item));
        
        // 提取标题（优先从文件内容中提取，否则使用文件名）
        let title = fileName;
        const titleMatch = content.match(/^#\s+(.+)/m);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
        
        // 清理内容：移除 markdown 语法
        const cleanContent = cleanMarkdownContent(content);
        
        // 构建 URL
        const url = currentUrl === '/blog' && fileName === 'Introduction' 
          ? '/blog/Introduction'
          : `${currentUrl}/${fileName}`;
        
        files.push({
          title,
          content: cleanContent,
          url,
          path: path.relative(blogDir, itemPath),
          lastModified: stat.mtime.toISOString()
        });
      }
    }
  }
  
  traverse(dir, baseUrl);
  return files;
}

/**
 * 清理 markdown 内容
 */
function cleanMarkdownContent(content) {
  return content
    // 移除 frontmatter
    .replace(/^---[\s\S]*?---\n?/m, '')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]+`/g, '')
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除列表标记
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // 移除引用标记
    .replace(/^>\s+/gm, '')
    // 移除多余的空白
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}

/**
 * 为嵌入向量优化文本内容
 * 将标题权重提升，并与内容合理组合
 */
function prepareTextForEmbedding(title, content) {
  // 标题重复3次以增加权重，然后加上内容
  const enhancedTitle = `${title} ${title} ${title}`;
  
  // 限制内容长度，避免过长影响向量质量
  const maxContentLength = 800;
  const truncatedContent = content.length > maxContentLength 
    ? content.substring(0, maxContentLength) + '...'
    : content;
  
  return `${enhancedTitle}\n\n${truncatedContent}`;
}

/**
 * 生成嵌入向量
 */
async function generateEmbeddings(blogData) {
  console.log('🚀 开始生成嵌入向量...');
  
  // 动态导入 transformers
  const { pipeline } = await import('@huggingface/transformers');
  
  // 初始化中文 BGE 模型
  console.log('📥 加载 BGE 中文模型...');
  const embedder = await pipeline('feature-extraction', 'Xenova/bge-small-zh-v1.5');
  
  const embeddings = [];
  
  for (let i = 0; i < blogData.length; i++) {
    const item = blogData[i];
    console.log(`⚙️  处理 ${i + 1}/${blogData.length}: ${item.title}`);
    
    try {
      // 准备用于嵌入的文本（标题加权 + 内容）
      const textForEmbedding = prepareTextForEmbedding(item.title, item.content);
      
      // 生成嵌入向量
      const output = await embedder(textForEmbedding, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);
      
      embeddings.push({
        url: item.url,
        title: item.title,
        embedding: embedding,
        textLength: textForEmbedding.length,
        lastModified: item.lastModified
      });
      
      // 手动释放内存
      if (global.gc) {
        global.gc();
      }
      
    } catch (error) {
      console.error(`❌ 生成嵌入向量失败: ${item.title}`, error);
    }
  }
  
  console.log(`✅ 完成嵌入向量生成，共 ${embeddings.length} 个向量`);
  return embeddings;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔍 开始扫描博客目录...');
    
    // 1. 从博客目录读取所有内容
    const blogData = readMarkdownFiles(blogDir);
    console.log(`📚 发现 ${blogData.length} 篇博客文章`);
    
    // 2. 生成内容索引
    console.log('📝 生成内容索引...');
    fs.writeFileSync(contentOutputPath, JSON.stringify(blogData, null, 2));
    console.log(`✅ 内容索引已保存到: ${contentOutputPath}`);
    
    // 3. 生成嵌入向量
    const embeddings = await generateEmbeddings(blogData);
    
    // 4. 保存嵌入向量
    fs.writeFileSync(embeddingsOutputPath, JSON.stringify(embeddings, null, 2));
    console.log(`✅ 嵌入向量已保存到: ${embeddingsOutputPath}`);
    
    // 5. 输出统计信息
    console.log('\n📊 统计信息:');
    console.log(`- 总文章数: ${blogData.length}`);
    console.log(`- 总嵌入向量数: ${embeddings.length}`);
    console.log(`- 向量维度: ${embeddings[0]?.embedding?.length || 'N/A'}`);
    console.log(`- 内容索引大小: ${(fs.statSync(contentOutputPath).size / 1024).toFixed(2)} KB`);
    console.log(`- 嵌入向量大小: ${(fs.statSync(embeddingsOutputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🎉 搜索索引生成完成！');
    
  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 