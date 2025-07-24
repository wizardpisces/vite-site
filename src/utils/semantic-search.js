/**
 * 本地语义搜索 - 基于预生成嵌入向量的语义检索
 * 使用 BGE 中文模型进行真正的语义搜索
 */

// 缓存
let blogEmbeddings = null;
let blogContent = null;
let embedder = null;

/**
 * 加载博客嵌入向量
 */
async function loadBlogEmbeddings() {
  if (blogEmbeddings) {
    return blogEmbeddings;
  }
  
  try {
    const response = await fetch('/blog-embeddings-bge.json');
    if (!response.ok) {
      throw new Error(`Failed to load embeddings: ${response.status}`);
    }
    blogEmbeddings = await response.json();
    console.log(`✅ 已加载 ${blogEmbeddings.length} 个博客嵌入向量`);
    return blogEmbeddings;
  } catch (error) {
    console.error('❌ 加载嵌入向量失败:', error);
    throw error;
  }
}

/**
 * 加载博客内容
 */
async function loadBlogContent() {
  if (blogContent) {
    return blogContent;
  }
  
  try {
    const response = await fetch('/blog-content.json');
    if (!response.ok) {
      throw new Error(`Failed to load blog content: ${response.status}`);
    }
    blogContent = await response.json();
    console.log(`✅ 已加载 ${blogContent.length} 篇博客内容`);
    return blogContent;
  } catch (error) {
    console.error('❌ 加载博客内容失败:', error);
    throw error;
  }
}

/**
 * 初始化 BGE 嵌入模型
 */
async function initializeEmbedder() {
  if (embedder) {
    return embedder;
  }
  
  try {
    console.log('🤖 正在加载 BGE 中文嵌入模型...');
    // 动态导入 transformers
    const { pipeline } = await import('@huggingface/transformers');
    
    // 使用与生成博客嵌入向量相同的模型
    embedder = await pipeline('feature-extraction', 'Xenova/bge-small-zh-v1.5', {
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          console.log(`📥 下载模型: ${progress.name} - ${Math.round(progress.progress || 0)}%`);
        }
      }
    });
    
    console.log('✅ BGE 嵌入模型加载完成');
    return embedder;
  } catch (error) {
    console.error('❌ 加载嵌入模型失败:', error);
    throw error;
  }
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 为查询文本生成语义嵌入向量
 * 使用与博客内容相同的 BGE 模型
 */
async function generateQueryEmbedding(query) {
  try {
    const model = await initializeEmbedder();
    
    // 生成嵌入向量（与生成博客向量时使用相同的参数）
    const output = await model(query, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    
    console.log(`🎯 为查询生成了 ${embedding.length} 维语义向量`);
    return embedding;
  } catch (error) {
    console.error('❌ 生成查询嵌入向量失败:', error);
    throw error;
  }
}

/**
 * 语义搜索主函数
 */
export async function semanticSearch(query, limit = 5) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  try {
    console.log(`🚀 开始语义搜索: "${query}"`);
    
    // 1. 生成查询的语义嵌入向量
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // 2. 加载数据
    const embeddings = await loadBlogEmbeddings();
    const content = await loadBlogContent();
    
    // 3. 计算语义相似度
    const results = [];
    
    for (const embedding of embeddings) {
      const similarity = cosineSimilarity(queryEmbedding, embedding.embedding);
      
      if (similarity > 0.1) { // 设置最低阈值
        const blogItem = content.find(c => c.url === embedding.url);
        if (blogItem) {
          // 生成摘要
          const text = blogItem.content || '';
          let snippet = text.length > 200 ? text.substring(0, 200) + '...' : text;
          
          // 检查是否包含查询关键词（用于显示和排序参考）
          const lowerText = text.toLowerCase();
          const lowerQuery = query.toLowerCase();
          const containsQuery = lowerText.includes(lowerQuery);
          
          if (containsQuery) {
            // 如果包含查询词，提取相关部分作为摘要
            const queryIndex = lowerText.indexOf(lowerQuery);
            const start = Math.max(0, queryIndex - 100);
            const end = Math.min(text.length, queryIndex + query.length + 100);
            snippet = text.substring(start, end).trim();
            if (start > 0) snippet = '...' + snippet;
            if (end < text.length) snippet += '...';
          }
          
          results.push({
            title: blogItem.title,
            url: blogItem.url,
            snippet,
            score: similarity,
            containsQuery,
            // 添加一些调试信息
            semanticScore: similarity
          });
        }
      }
    }
    
    // 4. 排序：主要按语义相似度排序，关键词匹配作为次要因素
    const sortedResults = results
      .sort((a, b) => {
        // 如果语义相似度相近（差异小于0.05），优先显示包含关键词的结果
        const scoreDiff = Math.abs(a.score - b.score);
        if (scoreDiff < 0.05) {
          if (a.containsQuery && !b.containsQuery) return -1;
          if (!a.containsQuery && b.containsQuery) return 1;
        }
        // 主要按语义相似度排序
        return b.score - a.score;
      })
      .slice(0, limit);
    
    console.log(`✅ 语义搜索完成，返回 ${sortedResults.length} 个结果`);
    
    // 输出调试信息
    if (sortedResults.length > 0) {
      console.log('🎯 语义搜索结果排序:');
      sortedResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title} - 相似度: ${(result.score * 100).toFixed(1)}%${result.containsQuery ? ' (包含关键词)' : ''}`);
      });
    }
    
    return sortedResults;
    
  } catch (error) {
    console.error('❌ 语义搜索失败:', error);
    return [];
  }
}

/**
 * 检查语义搜索是否可用
 */
export async function isSemanticSearchAvailable() {
  try {
    await loadBlogEmbeddings();
    await loadBlogContent();
    // 尝试初始化模型（但不等待完全加载）
    const initPromise = initializeEmbedder();
    // 给模型加载一点时间，但不阻塞太久
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(true), 2000));
    await Promise.race([initPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.error('❌ 语义搜索不可用:', error);
    return false;
  }
}

/**
 * 预热语义搜索（可选）
 * 在后台预加载模型，提升首次搜索速度
 */
export async function warmupSemanticSearch() {
  try {
    console.log('🔥 开始预热语义搜索...');
    await loadBlogEmbeddings();
    await loadBlogContent();
    await initializeEmbedder();
    console.log('✅ 语义搜索预热完成');
    return true;
  } catch (error) {
    console.error('❌ 语义搜索预热失败:', error);
    return false;
  }
} 