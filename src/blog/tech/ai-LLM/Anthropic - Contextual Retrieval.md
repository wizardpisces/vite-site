*论文发布时间：2024-09-19*

Anthropic 工程团队发布的 **《Contextual Retrieval》**（[工程博客](https://www.anthropic.com/engineering/contextual-retrieval)）提出了一种显著提升 RAG 检索准确率的方法。虽然这不是传统意义上的学术论文，但其技术影响力不亚于论文——它直指 RAG 系统最被忽视的瓶颈，并用极简方案给出了工程上可落地的答案。

简单来说，传统 RAG 把文档切成小块再嵌入，但单个块往往丢失了关键上下文。Contextual Retrieval 的做法是：**在嵌入每个块之前，用 Claude 为每个块生成一段上下文说明，然后将「上下文 + 原始块」一起嵌入**。仅此一步，top-20 检索失败率即可降低 35%，与 Contextual BM25 结合可降低 49%，再加 Reranking 可降低 67%。

## 这篇论文解决了什么问题？

**核心问题：分块（Chunking）导致的上下文丢失，严重削弱了检索的语义匹配能力。**

传统 RAG 的流程是：文档 → 切块 → 嵌入 → 存入向量库 → 查询时按相似度检索。问题出在「切块」这一步：为了控制 token 数量，每个块通常只有几百个 token，**块与块之间的关联信息被切断**。比如一个块写着「公司收入环比增长 3%」，但检索时无法知道这是哪家公司、哪个季度的数据——嵌入向量只能捕捉到「收入」「增长」「3%」这些孤立语义，无法与用户查询「ACME 公司 2023 年 Q2 收入增长」精确匹配。

Anthropic 在博客中给出了一个直观的例子：原始块是 `"The company's revenue grew by 3% over the previous quarter."`，经过 Contextual Retrieval 增强后变成 `"This chunk is from an SEC filing on ACME corp's performance in Q2 2023; the previous quarter's revenue was $314 million. The company's revenue grew by 3% over the previous quarter."`。前者在向量空间中与「ACME Q2 2023」的查询可能毫无交集，后者则能精确匹配。

## 这个问题真实存在吗？

**非常普遍，且被严重低估。**

Anthropic 在代码库、小说、ArXiv 论文、科学论文等多个领域做了实验，**Contextual Retrieval 在所有领域都带来了显著提升**。这说明「块内信息不足」不是个别场景的偶发问题，而是 RAG 架构的普遍缺陷。

更值得反思的是：整个 RAG 社区把大量精力花在优化嵌入模型（换更好的 embedding）、优化检索算法（Hybrid Search、Reranking）、优化分块策略（chunk size、overlap）——但很少有人追问：**块里到底有没有足够的信息让检索算法发挥作用？** 如果块本身是「信息残缺」的，再好的嵌入模型和检索算法也救不回来。

## 为什么之前没人解决？

1. **问题被归因错了：** 检索失败时，大家习惯性怀疑「嵌入模型不够好」或「检索策略有问题」，很少追溯到「块本身信息不足」。整个 RAG 产业链——从向量数据库厂商到嵌入模型提供商——都在围绕「如何更好地表示和匹配块」做优化，却很少有人质疑「块本身是否值得被更好地表示」。

2. **成本门槛高：** 为每个块调用 LLM 生成上下文，在 Prompt Caching 出现之前，成本是 O(N) 的 LLM 调用。假设 100 万块、每块 50 token 的上下文生成，若每次调用都传整篇文档，token 消耗和 API 成本会呈数量级增长，对百万级文档库几乎不可行。Prompt Caching 的出现，使得「文档传一次、块级请求复用」成为可能，才让 Contextual Retrieval 有了工程落地的前提。

3. **已有方案效果有限：** Anthropic 提到，此前有人尝试过「给块加文档摘要」「假设性文档嵌入（HyDE）」「基于摘要的索引（LlamaIndex 的 Document Summary Index）」等方法，但实验效果不佳。Contextual Retrieval 的关键区别在于：**为每个块生成块级、文档内的具体上下文**，而不是文档级的泛化摘要。前者是「块 A 在文档 X 第 3 节中讨论 ACME Q2 收入」，后者是「本文是一篇关于公司财务的 SEC 文件」——检索时需要的恰恰是前者这种可区分、可匹配的信息。

## 它是如何解决的？

**核心思路：在索引构建阶段，用 LLM 为每个块「补全」其缺失的上下文，再对「上下文 + 原始块」做嵌入和 BM25 索引。**

具体做法：

1. **Contextual Embeddings：** 对每个块，用 Claude 生成一段 50–100 token 的上下文说明（如「这段来自 ACME 公司 2023 年 Q2 的 SEC 文件，上季度收入为 3.14 亿美元」），将上下文 prepend 到原始块前，再送入嵌入模型。
2. **Contextual BM25：** 同样的「上下文 + 原始块」文本用于构建 BM25 的 TF-IDF 索引，使词法检索也能利用上下文中的实体名、时间等关键信息。

**工程智慧：Prompt Caching。** 为每个块生成上下文时，需要传入完整文档作为参考。若每次调用都传整篇文档，成本会爆炸。Anthropic 利用 Claude 的 Prompt Caching：**文档只加载进缓存一次，后续所有块共享这份缓存**。假设 800 token 的块、8k token 的文档、50 token 的指令、每块 100 token 的上下文，每百万 document tokens 的一次性索引成本约 1.02 美元，成本降低约 90%，延迟降低 2 倍以上。索引构建是一次性成本，查询时无额外延迟。

**实现细节：** Anthropic 使用 Claude 3 Haiku 作为上下文生成模型，prompt 的核心是「请为这个块在整篇文档中的位置和含义提供简短、具体的上下文，以改善检索效果」。生成的上下文通常 50–100 token，直接 prepend 到原始块前，再送入嵌入模型和 BM25 索引。

**实践要点小结：**

| 维度 | 建议 |
|------|------|
| Chunk 数量 | 实验表明传递 20 个块优于 10 个或 5 个，但需根据业务权衡上下文长度与模型注意力 |
| 上下文生成 prompt | 通用 prompt 已有效，可针对领域定制（如加入术语表、文档结构说明） |
| 嵌入模型 | Contextual Retrieval 对所有测试的嵌入模型均有提升，Gemini 和 Voyage 表现最佳 |
| Chunk 边界 | 分块大小、重叠、边界策略（按段落/句子/固定长度）会影响检索效果，需实验调优 |
| 生成阶段 | 可将上下文与原始块一并传给生成模型，并明确标注「上下文」与「块内容」的区分 |

## 关键词解析

### 1. Contextual Embeddings（上下文嵌入）

在嵌入前为每个块 prepend 一段 LLM 生成的、块级专属的上下文说明，使嵌入向量能编码「这个块在文档中的具体位置和含义」，而非孤立的文本片段。与「文档级摘要」不同，这里的上下文是**块级、具体、可区分**的。

### 2. Contextual BM25（上下文 BM25）

将同样的上下文增强应用于 BM25 的词法检索。BM25 基于 TF-IDF，擅长精确词匹配，但在技术文档、错误码、专有名词等场景下，若块内缺少这些关键 token，用户查询「Error code TS-999」或「ACME Q2 2023」无法命中。Contextual Retrieval 将「这段来自某技术文档，涉及错误码 TS-999 的说明」这类信息写入块前，BM25 索引中便包含了这些词，词法检索的召回率显著提升。语义检索（Embeddings）与词法检索（BM25）的互补性在 Contextual 增强下得到进一步放大。

### 3. Prompt Caching（提示缓存）

Claude 提供的特性：重复出现的 prompt 片段可被缓存，后续请求只需引用缓存 ID，无需重复传输。在 Contextual Retrieval 中，整篇文档作为「系统级上下文」被缓存，每个块的生成请求只需传「块内容 + 缓存引用」，大幅降低 token 消耗和延迟。

### 4. Reranking（重排序）

在初步检索得到 top-N 块（如 150 个）后，用专门的 Reranking 模型对「查询 + 块」打分，选出 top-K（如 20 个）最相关的块再送入生成模型。Contextual Retrieval 与 Reranking 可叠加，两者结合可将 top-20 检索失败率降低 67%。Anthropic 使用 Cohere Reranker 做了实验，Voyage 也提供类似服务。

### 5. 实验配置与结果解读

Anthropic 的实验覆盖多种知识域（代码库、小说、ArXiv、科学论文）、多种嵌入模型（包括 Gemini Text 004、Voyage 等）、多种检索策略。评估指标采用 **1 - Recall@20**，即「在 top-20 检索结果中未能召回的相关文档比例」——数值越低越好。

| 配置 | 失败率 | 相对基线降低 |
|------|--------|-------------|
| 基线（Embeddings + BM25） | 5.7% | — |
| + Contextual Embeddings | 3.7% | 35% |
| + Contextual Embeddings + Contextual BM25 | 2.9% | 49% |
| + 上述 + Reranking | 1.9% | 67% |

实验还发现：传递 20 个块给生成模型优于 10 个或 5 个；Gemini 和 Voyage 的嵌入模型在测试中表现最佳；Contextual Retrieval 在**所有**测试的嵌入模型和知识域组合中均带来提升，说明该方法具有普适性。

---

## 延伸思考

**1. 简洁性的力量**

Contextual Retrieval 最令人惊叹的地方是：**不需要改模型、不需要改架构，只需要在索引阶段多一步 LLM 调用**。它没有发明新的嵌入算法，没有设计新的检索框架，只是把「块里缺什么」这个问题显式化，并用 LLM 的能力去补全。这种「在正确的地方加一步」的工程直觉，往往比复杂的算法创新更值得学习。

对比 Anthropic 提到的其他尝试：给块加文档摘要、假设性文档嵌入（HyDE）、基于摘要的索引——这些方法要么过于泛化（文档摘要无法区分块与块），要么与检索目标不对齐。Contextual Retrieval 的成功在于：**块级、具体、面向检索**的上下文，才是嵌入和 BM25 真正需要的。

**2. 成本与实时性的权衡**

索引构建成本仍然很高：每个块都需要一次 LLM 调用，百万级文档库的索引时间可能以小时计。对**实时更新**的数据（如新闻、工单、聊天记录），每次更新都要重新为受影响块生成上下文，运维复杂度显著上升。Contextual Retrieval 更适合**相对静态**的知识库（文档、代码库、历史案例）。

此外，Reranking 虽然能进一步提升 67% 的失败率降低，但会在**查询时**增加延迟和成本——需要对 top-150 个块逐一打分。工程实践中需要在「检索质量」与「查询延迟」之间做权衡，根据业务场景选择是否启用 Reranking、以及 Rerank 多少候选块。

**3. 上下文质量依赖 LLM 能力**

上下文生成的质量直接影响检索效果。若 LLM 生成的上下文过于泛化（如「这是一段关于财务的文本」）或包含错误，可能引入噪声甚至误导检索。实践中需要针对领域定制 prompt，必要时引入术语表、文档结构等先验知识。Anthropic 也建议：可以尝试在 prompt 中加入知识库中其他文档的关键术语，帮助模型生成更具区分度的上下文。

**4. 与「小知识库直接塞进 Prompt」的关系**

Anthropic 在文首提醒：若知识库小于 20 万 token（约 500 页），可直接将全文放入 Prompt，无需 RAG。配合 Prompt Caching，这种方式成本低、延迟小。Contextual Retrieval 的适用场景是**超出上下文窗口**的大规模知识库——此时必须分块检索，而分块带来的上下文丢失问题，正是 Contextual Retrieval 要解决的。

**5. 对 RAG 评估的启示**

Contextual Retrieval 的成功提醒我们：RAG 评估不应只关注 Recall，还应关注「检索到的文档是否包含足够信息供模型正确回答」。一个块被召回，但若块内缺少关键实体、时间、因果关系，模型仍可能答错或幻觉。评估 RAG 系统时，应结合下游任务（如 QA 准确率、引用正确性）做端到端验证，而非仅看检索指标。Anthropic 在附录中提供了各领域的示例问答，可作为构建评估集的参考。

---

## 总结

Contextual Retrieval 的核心贡献可以概括为三点：

1. **问题归因的纠正：** 分块丢失上下文是 RAG 检索失败的重要根因，其严重程度被长期低估。在优化嵌入模型和检索算法之前，应先确保「块里有足够信息」。
2. **极简方案：** 在索引阶段用 LLM 为每个块生成块级上下文，将「上下文 + 原始块」一起嵌入和索引，无需改动下游模型和架构。
3. **工程可行性：** 通过 Prompt Caching 将 O(N) 的 LLM 调用成本压到可接受范围，使该方法在百万级文档库上具有实践价值。

**实践建议：** Anthropic 在博客中给出了若干实施要点：chunk 边界的选择（大小、重叠、切分策略）会影响检索效果；可针对领域定制 contextualizer prompt，例如加入仅在知识库其他文档中定义的术语表；生成阶段可将「上下文 + 原始块」一并传给模型，并明确区分上下文与块内容，以提升回答质量。后者尤其重要：检索时用「上下文 + 块」是为了提高召回，生成时若只传块而丢弃上下文，模型可能仍无法正确理解块的背景，导致回答偏差。始终运行评估（evals）以验证端到端效果。

对于构建 RAG 系统的工程师而言，Contextual Retrieval 提供了一个低成本、高收益的改进方向——在投入复杂架构之前，不妨先问问：你的块，真的包含足够的上下文吗？

**与 RAG 综述的呼应：** 同济大学 RAG 综述指出，RAG 的瓶颈往往不在检索本身，而在「什么时候检索、检索多少、怎么用」。Contextual Retrieval 则从更底层补充：**在讨论「怎么检索」之前，先确保「检索的对象本身是可检索的」**——块必须有足够的自描述性，才能被正确召回和利用。两者从不同层次揭示了 RAG 系统的设计哲学。

# 参考资料

- [Anthropic 工程博客 - Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)
- [Claude Cookbook - Contextual Embeddings 指南](https://platform.claude.com/cookbook/capabilities-contextual-embeddings-guide)
- [Anthropic Prompt Caching 文档](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Contextual Retrieval Appendix II](https://assets.anthropic.com/m/1632cded0a125333/original/Contextual-Retrieval-Appendix-2.pdf)（各数据集示例问答与 Retrieval@5/10/20 详细结果）

*编辑：2026-03-10*
