/**
 * 统一的搜索索引生成器
 * 采用文档分段 + 分段embedding策略，提升语义搜索精度
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
const chunksOutputPath = path.join(publicDir, 'blog-chunks.json');

// 分段配置 - 基于BGE模型最佳实践优化
const CHUNK_CONFIG = {
  maxChunkSize: 350,      // 每段最大字符数（≈ 350-500 tokens，更接近BGE推荐的512 tokens）
  overlapSize: 30,        // 段落重叠字符数（减少重叠，避免冗余）
  minChunkSize: 80,       // 最小段落大小（确保语义完整性）
  separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?'] // 分割符优先级
};

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
        
        // 构建 URL - 只使用文件名，符合路由 /blog/:blogName 的扁平结构
        const url = `/blog/${fileName}`;
        
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
 * 智能文档分段
 * 按照语义边界进行分段，保持内容的连贯性
 */
function splitDocumentIntoChunks(title, content, url) {
  const chunks = [];
  
  if (!content || content.length < CHUNK_CONFIG.minChunkSize) {
    // 内容太短，直接作为一个段落
    chunks.push({
      chunkId: 0,
      title,
      content: content || '',
      url,
      chunkIndex: 0,
      totalChunks: 1,
      startPos: 0,
      endPos: content ? content.length : 0
    });
    return chunks;
  }
  
  let chunkIndex = 0;
  let currentPos = 0;
  
  while (currentPos < content.length) {
    let chunkEnd = Math.min(currentPos + CHUNK_CONFIG.maxChunkSize, content.length);
    
    // 如果不是最后一段，尝试在合适的位置分割
    if (chunkEnd < content.length) {
      let bestSplitPos = chunkEnd;
      
      // 按分割符优先级查找最佳分割点
      for (const separator of CHUNK_CONFIG.separators) {
        const sepIndex = content.lastIndexOf(separator, chunkEnd);
        if (sepIndex > currentPos + CHUNK_CONFIG.minChunkSize) {
          bestSplitPos = sepIndex + separator.length;
          break;
        }
      }
      
      chunkEnd = bestSplitPos;
    }
    
    // 提取当前段落内容
    let chunkContent = content.slice(currentPos, chunkEnd).trim();
    
    // 如果有重叠，从前一段添加一些内容作为上下文
    if (chunkIndex > 0 && currentPos > 0) {
      const overlapStart = Math.max(0, currentPos - CHUNK_CONFIG.overlapSize);
      const overlapText = content.slice(overlapStart, currentPos).trim();
      if (overlapText) {
        chunkContent = `...${overlapText} ${chunkContent}`;
      }
    }
    
    // 生成段落标题（包含段落索引）
    const chunkTitle = chunks.length === 0 ? title : `${title} (第${chunkIndex + 1}段)`;
    
    chunks.push({
      chunkId: `${url}#chunk-${chunkIndex}`,
      title: chunkTitle,
      content: chunkContent,
      url,
      chunkIndex,
      totalChunks: 0, // 稍后更新
      startPos: currentPos,
      endPos: chunkEnd,
      originalTitle: title
    });
    
    // 移动到下一段的起始位置
    currentPos = chunkEnd;
    chunkIndex++;
  }
  
  // 更新总段落数
  chunks.forEach(chunk => {
    chunk.totalChunks = chunks.length;
  });
  
  return chunks;
}

/**
 * 为所有文档生成分段数据
 */
function generateDocumentChunks(blogData) {
  console.log('📄 开始文档分段处理...');
  
  const allChunks = [];
  
  for (const doc of blogData) {
    const chunks = splitDocumentIntoChunks(doc.title, doc.content, doc.url);
    allChunks.push(...chunks);
    
    console.log(`  ✂️  "${doc.title}": ${chunks.length} 个段落`);
  }
  
  console.log(`📊 分段统计:`);
  console.log(`  - 原始文档: ${blogData.length} 篇`);
  console.log(`  - 总段落数: ${allChunks.length} 个`);
  console.log(`  - 平均每篇: ${(allChunks.length / blogData.length).toFixed(1)} 段`);
  
  return allChunks;
}

/**
 * 为嵌入向量优化文本内容
 */
function prepareTextForEmbedding(title, content) {
  // 标题重复2次以增加权重，然后加上内容
  const enhancedTitle = `${title} ${title}`;
  
  // 限制内容长度，避免过长影响向量质量
  const maxContentLength = 800;
  const truncatedContent = content.length > maxContentLength 
    ? content.substring(0, maxContentLength) + '...'
    : content;
  
  return `${enhancedTitle}\n\n${truncatedContent}`;
}

/**
 * 生成段落级别的嵌入向量
 */
async function generateChunkEmbeddings(chunks) {
  console.log('🚀 开始生成段落级嵌入向量...');
  
  // 动态导入 transformers
  const { pipeline } = await import('@huggingface/transformers');
  
  // 初始化中文 BGE 模型
  console.log('📥 加载 BGE 中文模型...');
  const embedder = await pipeline('feature-extraction', 'Xenova/bge-small-zh-v1.5');
  
  const embeddings = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`⚙️  处理段落 ${i + 1}/${chunks.length}: ${chunk.title}`);
    
    try {
      // 准备用于嵌入的文本（标题加权 + 内容）
      const textForEmbedding = prepareTextForEmbedding(chunk.title, chunk.content);
      
      // 生成嵌入向量
      const output = await embedder(textForEmbedding, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);
      
      embeddings.push({
        chunkId: chunk.chunkId,
        url: chunk.url,
        title: chunk.title,
        originalTitle: chunk.originalTitle,
        chunkIndex: chunk.chunkIndex,
        totalChunks: chunk.totalChunks,
        embedding: embedding,
        textLength: textForEmbedding.length,
        contentLength: chunk.content.length,
        lastModified: new Date().toISOString()
      });
      
      // 手动释放内存
      if (global.gc) {
        global.gc();
      }
      
    } catch (error) {
      console.error(`❌ 生成嵌入向量失败: ${chunk.title}`, error);
    }
  }
  
  console.log(`✅ 完成段落级嵌入向量生成，共 ${embeddings.length} 个向量`);
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
    
    // 2. 生成文档分段
    const chunks = generateDocumentChunks(blogData);
    
    // 3. 生成内容索引（保持兼容性）
    console.log('📝 生成内容索引...');
    fs.writeFileSync(contentOutputPath, JSON.stringify(blogData, null, 2));
    console.log(`✅ 内容索引已保存到: ${contentOutputPath}`);
    
    // 4. 保存分段数据
    console.log('📄 保存分段数据...');
    fs.writeFileSync(chunksOutputPath, JSON.stringify(chunks, null, 2));
    console.log(`✅ 分段数据已保存到: ${chunksOutputPath}`);
    
    // 5. 生成段落级嵌入向量
    const embeddings = await generateChunkEmbeddings(chunks);
    
    // 6. 保存嵌入向量
    fs.writeFileSync(embeddingsOutputPath, JSON.stringify(embeddings, null, 2));
    console.log(`✅ 嵌入向量已保存到: ${embeddingsOutputPath}`);
    
    // 7. 输出统计信息
    console.log('\n📊 统计信息:');
    console.log(`- 原始文档数: ${blogData.length}`);
    console.log(`- 分段数量: ${chunks.length}`);
    console.log(`- 嵌入向量数: ${embeddings.length}`);
    console.log(`- 向量维度: ${embeddings[0]?.embedding?.length || 'N/A'}`);
    console.log(`- 平均段落长度: ${Math.round(chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length)} 字符`);
    console.log(`- 内容索引大小: ${(fs.statSync(contentOutputPath).size / 1024).toFixed(2)} KB`);
    console.log(`- 分段数据大小: ${(fs.statSync(chunksOutputPath).size / 1024).toFixed(2)} KB`);
    console.log(`- 嵌入向量大小: ${(fs.statSync(embeddingsOutputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🎉 分段语义搜索索引生成完成！');
    
  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 