/**
 * 使用 BGE 中文模型生成博客内容的嵌入向量
 * BGE 中文模型专为中文检索优化，效果更好
 */

const fs = require('fs');
const path = require('path');

// 输入和输出文件
const BLOG_CONTENT_PATH = path.join(__dirname, '../public/blog-content.json');
const BLOG_EMBEDDINGS_PATH = path.join(__dirname, '../public/blog-embeddings-bge.json');

// 使用 BGE 中文模型
const MODEL_NAME = 'Xenova/bge-small-zh-v1.5';

async function generateEmbeddings() {
  try {
    // 动态导入 transformers 库
    const { pipeline } = await import('@xenova/transformers');
    
    // 加载博客内容
    console.log('正在加载博客内容...');
    const blogContent = JSON.parse(fs.readFileSync(BLOG_CONTENT_PATH, 'utf8'));
    console.log(`已加载${blogContent.length}篇博客内容`);
    
    // 创建嵌入管道
    console.log(`正在加载嵌入模型 ${MODEL_NAME}（中文模型）...`);
    const pipe = await pipeline('feature-extraction', MODEL_NAME);
    console.log('中文嵌入模型加载完成');
    
    // 生成嵌入向量
    console.log('正在生成嵌入向量...');
    const embeddings = [];
    
    // 分批处理
    const batchSize = 10;
    for (let i = 0; i < blogContent.length; i += batchSize) {
      const batch = blogContent.slice(i, i + batchSize);
      console.log(`处理第${i + 1}到${Math.min(i + batchSize, blogContent.length)}篇博客...`);
      
      for (const item of batch) {
        // 对于中文内容，使用标题和内容的组合
        const text = `${item.title} ${item.content.substring(0, 500)}`;
        const result = await pipe(text, { 
          pooling: 'mean', 
          normalize: true 
        });
        
        embeddings.push({
          url: item.url,
          embedding: Array.from(result.data)
        });
      }
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }
    }
    
    // 保存嵌入向量
    fs.writeFileSync(BLOG_EMBEDDINGS_PATH, JSON.stringify(embeddings, null, 2));
    console.log(`已生成并保存${embeddings.length}篇博客的中文嵌入向量`);
    console.log('使用中文 BGE 模型，应该对中文内容有更好的语义理解');
  } catch (error) {
    console.error('生成嵌入向量失败:', error);
    process.exit(1);
  }
}

// 执行脚本
generateEmbeddings(); 