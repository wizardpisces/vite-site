/**
 * 博客搜索模块 - 提供简单关键词搜索和嵌入向量语义搜索功能
 */

// 博客内容缓存
let blogContent = null;

/**
 * 加载博客内容
 * @returns {Promise<Array>} 博客内容数组
 */
export async function loadBlogContent() {
  if (blogContent) {
    return blogContent;
  }
  
  try {
    // 从文件加载
    const response = await fetch('/blog-content.json');
    blogContent = await response.json();
    console.log(`已加载${blogContent.length}篇博客内容`);
    return blogContent;
  } catch (error) {
    console.error('加载博客内容失败:', error);
    
    // 尝试从当前页面提取内容
    const extractedContent = extractContentFromPage();
    if (extractedContent.length > 0) {
      blogContent = extractedContent;
      return blogContent;
    }
    
    // 如果加载失败，返回空数组
    return [];
  }
}

/**
 * 从当前页面提取博客内容
 * @returns {Array} 提取的内容数组
 */
function extractContentFromPage() {
  const content = [];
  
  try {
    // 尝试从页面提取博客内容
    const articleElements = document.querySelectorAll('article');
    if (articleElements.length > 0) {
      const article = articleElements[0];
      const title = document.title || '当前页面';
      const text = article.textContent || '';
      const url = window.location.pathname;
      
      content.push({
        title,
        content: text,
        url,
        path: url.replace(/^\/blog\//, '')
      });
      
      console.log('从当前页面提取了博客内容');
    }
    
    // 尝试从页面中的所有链接提取博客列表
    const links = document.querySelectorAll('a[href^="/blog"]');
    links.forEach(link => {
      const url = link.getAttribute('href');
      const title = link.textContent.trim();
      
      if (url && title) {
        content.push({
          title,
          content: title, // 内容仅使用标题，因为我们无法获取实际内容
          url,
          path: url.replace(/^\/blog\//, '')
        });
      }
    });
  } catch (e) {
    console.error('从页面提取内容失败:', e);
  }
  
  return content;
}

/**
 * 简单搜索 - 使用关键词匹配
 * @param {string} query - 搜索查询
 * @param {Array} content - 博客内容数组
 * @param {number} limit - 结果数量限制
 * @returns {Array} 搜索结果
 */
function simpleSearch(query, content, limit = 5) {
  if (!query || !content || content.length === 0) {
    return [];
  }
  
  // 转换查询为小写，用于不区分大小写的搜索
  const lowerQuery = query.toLowerCase();
  
  // 搜索博客内容
  const results = content.map(item => {
    const title = item.title || '';
    const text = item.content || '';
    const lowerTitle = title.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // 计算匹配分数
    let score = 0;
    
    // 标题匹配权重更高
    if (lowerTitle.includes(lowerQuery)) {
      score += 0.8;
    }
    
    // 内容匹配
    if (lowerText.includes(lowerQuery)) {
      score += 0.4;
      
      // 计算匹配位置，用于提取相关内容片段
      const matchIndex = lowerText.indexOf(lowerQuery);
      if (matchIndex >= 0) {
        // 提取匹配周围的内容
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(text.length, matchIndex + query.length + 100);
        item.snippet = text.substring(start, end).trim();
        
        // 如果截取的内容不是从头开始，添加省略号
        if (start > 0) {
          item.snippet = '...' + item.snippet;
        }
        
        // 如果截取的内容不是到末尾结束，添加省略号
        if (end < text.length) {
          item.snippet += '...';
        }
      } else {
        // 如果没有找到精确匹配，使用前100个字符作为摘要
        item.snippet = text.substring(0, 100).trim() + '...';
      }
    } else {
      // 如果内容中没有匹配，使用前100个字符作为摘要
      item.snippet = text.substring(0, 100).trim() + '...';
    }
    
    // 精确匹配加分
    if (lowerTitle === lowerQuery) {
      score += 0.5;
    }
    
    // 词组匹配（标题中包含查询词组的所有单词）
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);
    if (queryWords.length > 1) {
      const matchedWords = queryWords.filter(word => lowerTitle.includes(word));
      if (matchedWords.length === queryWords.length) {
        score += 0.3;
      } else if (matchedWords.length > 0) {
        score += 0.1 * (matchedWords.length / queryWords.length);
      }
    }
    
    return {
      ...item,
      score
    };
  });
  
  // 过滤掉得分为0的结果，按分数排序，并限制结果数量
  return results
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 搜索博客内容
 * @param {string} query - 搜索查询
 * @param {number} limit - 返回结果数量限制
 * @returns {Promise<Array>} 搜索结果数组
 */
export async function search(query, limit = 5) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    // 确保博客内容已加载
    const content = await loadBlogContent();
    
    // 使用简单搜索
    return simpleSearch(query, content, limit);
  } catch (error) {
    console.error('搜索失败:', error);
    return [];
  }
}

/**
 * 初始化搜索引擎
 * @returns {Promise<void>}
 */
export async function initSearchEngine() {
  try {
    await loadBlogContent();
    console.log('搜索引擎初始化完成');
  } catch (error) {
    console.error('初始化搜索引擎失败:', error);
  }
} 