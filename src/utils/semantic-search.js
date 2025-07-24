/**
 * 本地语义搜索 - 基于预生成嵌入向量的语义检索
 * 使用 TF-IDF + 向量相似度的混合方法
 */

// 缓存
let blogEmbeddings = null;
let blogContent = null;

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
 * 简单的中文分词 + TF-IDF 权重计算
 */
function extractKeywords(text, topK = 10) {
  // 中文分词（简化版）
  const words = text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ') // 保留中文、英文、数字
    .split(/\s+/)
    .filter(word => word.length > 1); // 过滤单字符
  
  // 计算词频
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // 按频率排序，返回前 topK 个关键词
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([word]) => word);
}

/**
 * 基于关键词匹配生成查询向量
 * 使用多个相关文档的加权平均向量
 */
async function generateQueryVector(query) {
  const embeddings = await loadBlogEmbeddings();
  const content = await loadBlogContent();
  
  // 提取查询关键词
  const queryKeywords = extractKeywords(query, 5);
  console.log(`🔍 查询关键词:`, queryKeywords);
  
  // 找到包含这些关键词的文档
  const candidateDocs = [];
  
  for (const doc of content) {
    let score = 0;
    const docText = (doc.title + ' ' + doc.content).toLowerCase();
    const docKeywords = extractKeywords(docText, 20);
    
    // 计算关键词重叠度
    for (const queryWord of queryKeywords) {
      if (docKeywords.includes(queryWord)) {
        score += 2; // 关键词完全匹配
      } else {
        // 模糊匹配
        for (const docWord of docKeywords) {
          if (docWord.includes(queryWord) || queryWord.includes(docWord)) {
            score += 1;
          }
        }
      }
    }
    
    if (score > 0) {
      candidateDocs.push({
        doc,
        score,
        keywords: docKeywords
      });
    }
  }
  
  // 按分数排序
  candidateDocs.sort((a, b) => b.score - a.score);
  console.log(`📝 找到 ${candidateDocs.length} 个候选文档`);
  
  if (candidateDocs.length === 0) {
    return null;
  }
  
  // 使用前几个最相关文档的向量进行加权平均
  const topDocs = candidateDocs.slice(0, Math.min(3, candidateDocs.length));
  const vectors = [];
  
  for (const { doc, score } of topDocs) {
    const embedding = embeddings.find(e => e.url === doc.url);
    if (embedding) {
      vectors.push({
        vector: embedding.embedding,
        weight: score
      });
    }
  }
  
  if (vectors.length === 0) {
    return null;
  }
  
  // 计算加权平均向量
  const dimensions = vectors[0].vector.length;
  const queryVector = new Array(dimensions).fill(0);
  let totalWeight = 0;
  
  for (const { vector, weight } of vectors) {
    for (let i = 0; i < dimensions; i++) {
      queryVector[i] += vector[i] * weight;
    }
    totalWeight += weight;
  }
  
  // 归一化
  for (let i = 0; i < dimensions; i++) {
    queryVector[i] /= totalWeight;
  }
  
  console.log(`✨ 使用 ${vectors.length} 个文档生成查询向量`);
  return queryVector;
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
    
    // 1. 生成查询向量
    const queryVector = await generateQueryVector(query);
    if (!queryVector) {
      console.log('⚠️ 无法生成查询向量，查询词可能过于特殊');
      return [];
    }
    
    // 2. 加载数据
    const embeddings = await loadBlogEmbeddings();
    const content = await loadBlogContent();
    
    // 3. 计算相似度
    const results = [];
    
    for (const embedding of embeddings) {
      const similarity = cosineSimilarity(queryVector, embedding.embedding);
      
      if (similarity > 0.1) { // 设置最低阈值
        const blogItem = content.find(c => c.url === embedding.url);
        if (blogItem) {
          // 生成摘要
          const text = blogItem.content || '';
          let snippet = text.length > 200 ? text.substring(0, 200) + '...' : text;
          
          // 检查是否包含查询词
          const lowerText = text.toLowerCase();
          const lowerQuery = query.toLowerCase();
          const containsQuery = lowerText.includes(lowerQuery);
          
          if (containsQuery) {
            // 如果包含查询词，提取相关部分
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
            containsQuery
          });
        }
      }
    }
    
    // 4. 排序和返回结果
    const sortedResults = results
      .sort((a, b) => {
        // 优先显示包含查询词的结果
        if (a.containsQuery && !b.containsQuery) return -1;
        if (!a.containsQuery && b.containsQuery) return 1;
        // 然后按相似度排序
        return b.score - a.score;
      })
      .slice(0, limit);
    
    console.log(`✅ 语义搜索完成，返回 ${sortedResults.length} 个结果`);
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
    return true;
  } catch (error) {
    return false;
  }
} 