# [Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)

这篇文章是 Manus 团队基于构建通用 AI Agent（Manus）的实战经验，分享关于**上下文工程（Context Engineering）**的深度技术文章。

**核心思想**：
在构建复杂的 Agent 系统时，**Context Engineering（上下文工程）比 Prompt Engineering 更重要**。不仅仅是“写好提示词”，而是要像管理内存一样，精心设计上下文的结构、存储和生命周期。

*   **上下文是稀缺资源**：尽管模型支持 128k+ 上下文，但在实际工程中，上下文的长度直接关联到**成本（Cost）**、**延迟（Latency）**和**准确率（Accuracy）**。
*   **KV-Cache 是关键指标**：Agent 的运行是一个不断循环的过程（Loop），每一轮都会产生新的 Token。必须优化 KV-Cache 的命中率（Hit Rate），避免每一步都重新计算整个上下文。
*   **信息压缩与外部化**：不要把所有东西都塞进 Context Window，学会使用文件系统作为“外挂内存”。

**解决的问题**：
1.  **高昂的推理成本与延迟**：在长任务中，Input Token 远多于 Output Token（比例可达 100:1），如果每次都全量重新处理，速度极慢且烧钱。
2.  **“迷失中间”（Lost in the Middle）**：随着对话变长，Agent 容易忘记最初的目标或上一轮的决策细节。
3.  **模式僵化（Pattern Collapse）**：过多的 Few-Shot 示例会导致模型刻板模仿，失去灵活性。
4.  **错误恢复能力差**：很多系统倾向于隐藏错误，导致 Agent 不知道自己试错过什么，从而陷入死循环。

**核心策略（Manus 的解决方案）**：
1.  **极致优化 KV-Cache（降本提速）**
    *   **前缀稳定性**：保持 System Prompt 和早期历史记录绝对不变。
    *   **Append-Only 原则**：不要修改或删除历史消息。
    *   **确定性序列化**：工具输出（如 JSON）键值顺序固定。
2.  **外部化记忆（Externalized Memory）**
    *   **文件系统即记忆**：将长内容写入文件，Context 里只保留路径。
    *   **按需读取**：只有确实需要细节时才读取文件内容。
3.  **保持注意力的技巧**
    *   **Recitation（背诵/复述）**：强制 Agent 维护 `todo.md`，每轮思考前读取，明确当前进度。
    *   **保留错误堆栈**：报错是极高价值的反馈信号，能帮助 Agent 自我修正。
4.  **对抗模式僵化**
    *   **动态 Few-Shot**：引入随机性或结构变异，防止模型过拟合。

**思考与未来**：
Manus 的方案是当前架构下的工程最佳实践。未来可能的方向：
*   **架构级改进**：如 Linear Attention, SSM (State Space Models) 解决长序列遗忘。
*   **智能压缩**：使用小模型将长文本压缩为 Embedding 或 Summary Tokens。
*   **元学习**：Agent 拥有跨任务的长期记忆。

> **Context is Money.** 不要迷信模型能力的无限提升，好的工程架构（特别是上下文管理）才是让 Agent 从 Demo 走向 Production 的关键。

*编辑：2026-01-20*