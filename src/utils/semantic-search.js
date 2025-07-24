/**
 * 本地语义搜索 - 基于分段嵌入向量的语义检索
 * 采用 LlamaIndex 式的分段召回策略，提升搜索精度
 */

// 缓存
let blogEmbeddings = null;
let blogContent = null;
let blogChunks = null;
let embedder = null;

/**
 * 加载博客嵌入向量（分段级别）
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
    console.log(`✅ 已加载 ${blogEmbeddings.length} 个段落嵌入向量`);
    return blogEmbeddings;
  } catch (error) {
    console.error('❌ 加载嵌入向量失败:', error);
    throw error;
  }
}

/**
 * 加载博客分段数据
 */
async function loadBlogChunks() {
  if (blogChunks) {
    return blogChunks;
  }
  
  try {
    const response = await fetch('/blog-chunks.json');
    if (!response.ok) {
      throw new Error(`Failed to load chunks: ${response.status}`);
    }
    blogChunks = await response.json();
    console.log(`✅ 已加载 ${blogChunks.length} 个文档段落`);
    return blogChunks;
  } catch (error) {
    console.error('❌ 加载分段数据失败:', error);
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
 * 分段级别的语义搜索
 */
async function searchChunks(query, topK = 15) {
  console.log(`🔍 分段搜索: "${query}"`);
  
  // 1. 生成查询的语义嵌入向量
  const queryEmbedding = await generateQueryEmbedding(query);
  
  // 2. 加载数据
  const embeddings = await loadBlogEmbeddings();
  const chunks = await loadBlogChunks();
  
  // 3. 计算所有段落的语义相似度
  const chunkResults = [];
  
  for (const embedding of embeddings) {
    const similarity = cosineSimilarity(queryEmbedding, embedding.embedding);
    
    if (similarity > 0.1) { // 设置最低阈值
      const chunk = chunks.find(c => c.chunkId === embedding.chunkId);
      if (chunk) {
        // 检查是否包含查询关键词
        const lowerText = chunk.content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const containsQuery = lowerText.includes(lowerQuery);
        
        chunkResults.push({
          chunkId: chunk.chunkId,
          url: chunk.url,
          title: chunk.title,
          originalTitle: chunk.originalTitle,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          totalChunks: chunk.totalChunks,
          similarity,
          containsQuery,
          startPos: chunk.startPos,
          endPos: chunk.endPos
        });
      }
    }
  }
  
  // 4. 按相似度排序
  chunkResults.sort((a, b) => b.similarity - a.similarity);
  
  console.log(`📄 找到 ${chunkResults.length} 个相关段落`);
  return chunkResults.slice(0, topK);
}

/**
 * 聚合段落结果为文档级别结果
 */
function aggregateChunkResults(chunkResults, limit = 5) {
  const documentMap = new Map();
  
  // 按文档分组段落
  for (const chunk of chunkResults) {
    if (!documentMap.has(chunk.url)) {
      documentMap.set(chunk.url, {
        url: chunk.url,
        title: chunk.originalTitle,
        chunks: [],
        maxSimilarity: 0,
        avgSimilarity: 0,
        containsQuery: false,
        totalChunks: chunk.totalChunks
      });
    }
    
    const doc = documentMap.get(chunk.url);
    doc.chunks.push(chunk);
    doc.maxSimilarity = Math.max(doc.maxSimilarity, chunk.similarity);
    doc.containsQuery = doc.containsQuery || chunk.containsQuery;
  }
  
  // 计算每个文档的综合分数
  const documentResults = Array.from(documentMap.values()).map(doc => {
    // 计算平均相似度
    doc.avgSimilarity = doc.chunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / doc.chunks.length;
    
    // 生成摘要：选择最相关的段落作为摘要
    const bestChunk = doc.chunks[0]; // 已按相似度排序
    let snippet = bestChunk.content;
    
    // 如果段落过长，截取前部分
    if (snippet.length > 350) {
      snippet = snippet.substring(0, 350) + '...';
    }
    
    // 计算综合分数：最高相似度 * 0.7 + 平均相似度 * 0.3
    const score = doc.maxSimilarity * 0.7 + doc.avgSimilarity * 0.3;
    
    return {
      title: doc.title,
      url: doc.url,
      snippet,
      score,
      containsQuery: doc.containsQuery,
      semanticScore: doc.maxSimilarity,
      avgSimilarity: doc.avgSimilarity,
      matchedChunks: doc.chunks.length,
      totalChunks: doc.totalChunks,
      bestChunk: {
        index: bestChunk.chunkIndex,
        similarity: bestChunk.similarity,
        content: bestChunk.content
      }
    };
  });
  
  // 按综合分数排序
  documentResults.sort((a, b) => {
    // 如果分数相近，优先显示包含关键词的结果
    const scoreDiff = Math.abs(a.score - b.score);
    if (scoreDiff < 0.03) {
      if (a.containsQuery && !b.containsQuery) return -1;
      if (!a.containsQuery && b.containsQuery) return 1;
    }
    return b.score - a.score;
  });
  
  return documentResults.slice(0, limit);
}

/**
 * 语义搜索主函数
 */
export async function semanticSearch(query, limit = 5) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  try {
    console.log(`🚀 开始分段语义搜索: "${query}"`);
    
    // 1. 分段级别搜索
    const chunkResults = await searchChunks(query, limit * 3);
    
    if (chunkResults.length === 0) {
      console.log('⚠️ 未找到相关段落');
      return [];
    }
    
    // 2. 聚合为文档级别结果
    const documentResults = aggregateChunkResults(chunkResults, limit);
    
    console.log(`✅ 分段语义搜索完成，返回 ${documentResults.length} 个结果`);
    
    // 输出调试信息
    if (documentResults.length > 0) {
      console.log('🎯 分段搜索结果排序:');
      documentResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     - 综合分数: ${(result.score * 100).toFixed(1)}%`);
        console.log(`     - 最高相似度: ${(result.semanticScore * 100).toFixed(1)}%`);
        console.log(`     - 匹配段落: ${result.matchedChunks}/${result.totalChunks}`);
        console.log(`     - 包含关键词: ${result.containsQuery ? '是' : '否'}`);
      });
    }
    
    return documentResults;
    
  } catch (error) {
    console.error('❌ 分段语义搜索失败:', error);
    return [];
  }
}

/**
 * 检查语义搜索是否可用
 */
export async function isSemanticSearchAvailable() {
  try {
    await loadBlogEmbeddings();
    await loadBlogChunks();
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
 */
export async function warmupSemanticSearch() {
  try {
    console.log('🔥 开始预热分段语义搜索...');
    await loadBlogEmbeddings();
    await loadBlogChunks();
    await initializeEmbedder();
    console.log('✅ 分段语义搜索预热完成');
    return true;
  } catch (error) {
    console.error('❌ 分段语义搜索预热失败:', error);
    return false;
  }
} 