import katex from 'katex';

/**
 * 在 markdown-it 处理之前，将 $...$ 和 $$...$$ 中的数学公式
 * 预渲染为 KaTeX HTML，避免 markdown-it 把 LaTeX 语法（如 _）误解析为 Markdown 标记。
 */
function renderMathInMarkdown(code) {
  const codeBlocks = [];
  const inlineCodes = [];

  // 保护 fenced code blocks
  let result = code.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `\x00CODEBLOCK_${codeBlocks.length - 1}\x00`;
  });

  // 保护 inline code
  result = result.replace(/`[^`]+`/g, (match) => {
    inlineCodes.push(match);
    return `\x00INLINECODE_${inlineCodes.length - 1}\x00`;
  });

  // 渲染 display math: $$...$$
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return _match;
    }
  });

  // 渲染 inline math: $...$（内容不含换行和 $）
  result = result.replace(/\$([^\$\n]+?)\$/g, (_match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return _match;
    }
  });

  // 还原保护的代码块
  result = result.replace(/\x00INLINECODE_(\d+)\x00/g, (_, i) => inlineCodes[i]);
  result = result.replace(/\x00CODEBLOCK_(\d+)\x00/g, (_, i) => codeBlocks[i]);

  return result;
}

export default function mathPlugin() {
  return {
    name: 'vite-plugin-math',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      return { code: renderMathInMarkdown(code) };
    },
  };
}
