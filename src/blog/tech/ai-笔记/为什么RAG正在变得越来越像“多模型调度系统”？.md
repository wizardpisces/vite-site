[这篇文章](https://towardsdatascience.com/dispatching-the-parsed-rag-question-chunk-strategy-model-tier-activations-audit/)讲的是：**RAG 里用户问题不要直接丢给检索和生成，而要先被解析成一张“执行计划表”，再由 dispatcher 决定后面的检索方式、chunk 处理方式、模型档位和审计记录。**

用一个例子串起来：

用户上传一份保险合同，问：

> What is the annual premium and what are the main exclusions?  
> 年保费是多少？主要除外责任有哪些？

普通 RAG 可能会这么做：  
把这句话 embedding 一下，找 top-k chunk，然后把 chunk 和问题一起塞给大模型。

文章认为这太粗了。因为这个问题其实包含两种完全不同的任务：

1. **annual premium** 是一个单点事实，答案通常是金额，比如 `EUR 12,000`。  
   这种问题应该找很局部的上下文，可能一行就够；生成时可以按 chunk 顺序逐个问模型，找到完整答案就停。

2. **main exclusions** 是一个列表/总结问题，答案可能散落在多个章节。  
   这种问题需要更大上下文，比如 section 或 chapter；生成时最好把多个相关 chunk 合并，让模型综合回答。

所以文章主张先把问题解析成结构化对象，大概像这样：

```text
answer_shape:
  premium -> single
  exclusions -> listing

answer_type:
  premium -> amount
  exclusions -> text

chunk_strategy:
  premium -> sequential
  exclusions -> combined

answer_context:
  premium -> line
  exclusions -> chapter

suggested_model:
  premium -> 小模型即可
  exclusions -> 更强模型

decomposition:
  independent，拆成两个子问题
```

然后 dispatcher 根据这个解析结果，把两个子问题送到不同执行路径。

对于“年保费是多少”，系统用关键词、金额 regex、专家词典，比如 `premium / cotisation / prime`，去找最可能包含金额的局部片段；如果 top-1 chunk 已经答出来，就不再烧 token 看后面的 chunk。

对于“主要除外责任有哪些”，系统知道这不是一个单值抽取，而是列表型、跨段落型问题，于是会扩大上下文，把多个 chunk 合在一起，让模型总结。

文章还强调一个点：**解析问题不能只看问题本身，还要看文档 profile。**

比如用户问：

> What does it say on page 3?

如果文档是 PDF，page 3 是稳定概念。  
但如果文档是 Word，page 3 取决于字体、屏幕宽度、打印设置，根本不是稳定结构。

所以 dispatcher 要根据文档 profile 调整 activations：

```text
PDF:
  extract_page_numbers = true

DOCX:
  extract_page_numbers = false
  parsing_notes = "page numbers are approximate"
```

这样系统不会很自信地给出一个假的“第 3 页答案”，而是在审计信息里记录：这个文档格式不支持可靠页码定位。

这篇文章真正想表达的不是“再加一个复杂模块”，而是：

**RAG 的质量问题，很多不是 embedding 不够强、chunk size 没调好，而是问题没有被正确路由。**

核心启发可以概括成三句话：

1. **用户问题不是一个字符串，而是一份执行计划。**  
   它应该被解析成 answer type、answer shape、scope、decomposition、chunk strategy、model choice、activation flags 等结构化字段。

2. **不同问题应该走不同 RAG 路径。**  
   单点金额、日期、IBAN 这类问题适合小上下文、顺序 chunk、便宜模型；列表、对比、总结、法律条款解释则需要大上下文、合并 chunk、更强模型。

3. **生产级 RAG 必须可审计。**  
   系统要记录：为什么拆成这些子问题、为什么用了这个模型、为什么关闭页码提取、为什么选择 combined 或 sequential。否则答案错了以后，团队只能猜问题出在哪。

所以这篇文章最重要的启发是：

**不要把 RAG 做成“问题进、top-k chunk 出、大模型答”的黑盒流水线；要先把问题解析成结构化计划，再让 dispatcher 明确控制检索、生成、模型和审计。**

它的观点很工程化：  
RAG 不只是“检索增强生成”，更像一个文档问答操作系统。问题解析器负责理解意图，dispatcher 负责调度资源，retrieval 和 generation 只是被调度的执行单元。