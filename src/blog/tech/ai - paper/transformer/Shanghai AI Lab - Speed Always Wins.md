*论文发布时间：2025-08-13*

这篇由 Shanghai AI Laboratory 等团队发布的综述 **《[Speed Always Wins: A Survey on Efficient Architectures for Large Language Models](https://arxiv.org/abs/2508.09834)》** 是对后 Transformer 时代架构演进的一次全面“阅兵”。

简单来说，随着大模型应用进入深水区，业界不再只追求“大”，而是开始疯狂追求“快”和“省”。这篇论文系统梳理了**高效 LLM 架构**的版图，从 Mamba 到 MoE，从线性 Attention 到混合架构，旨在找到打破“性能-效率”不可能三角的终极方案。

## “高效架构”解决了什么问题？

**核心问题：标准 Transformer 架构在长序列和大规模部署下的“计算昂贵”与“显存臃肿”。**

尽管 Transformer 效果拔群，但它在实际落地中（尤其是长文本和端侧场景）面临两大拦路虎：

*   **$O(N^2)$ 的复杂度噩梦：** 标准 Self-Attention 的计算量和显存占用随着序列长度 $N$ 呈平方级增长。处理 100k tokens 的成本不是 10k 的 10 倍，而是 100 倍。这让超长上下文（Long Context）的推理变得极度昂贵。
*   **KV Cache 的显存黑洞：** 在推理阶段，为了不重复计算，我们需要缓存所有历史 Token 的 Key 和 Value。这会消耗海量显存，导致显存带宽（Memory Bandwidth）成为推理速度的绝对瓶颈。

**高效架构的作用：** 通过改变底层数学原理（如将 Attention 线性化）或稀疏化计算（如 MoE），在保持模型“聪明”程度（性能）接近 Transformer 的前提下，将推理成本降低数倍甚至数十倍。

## 这个问题真实存在吗？

**生死攸关。**

在 2023-2024 年，大家还在比拼谁的模型参数更大；到了 2025-2026 年，竞争焦点已经转移到了**推理成本（Tokens per Dollar）**和**响应速度（Tokens per Second）**。

*   **商业闭环：** 如果生成一次回答的电费比用户订阅费还贵，商业模式就不成立。
*   **端侧落地：** 手机和笔记本的显存有限（通常 <16GB），标准 7B 模型跑起来都很吃力，更别提更长窗口了。只有高效架构才能让 AI 真正跑在每个人的设备上。

## 为什么现在才有人去解决？

其实从 2020 年起就有 Linear Transformer 的尝试，但直到最近才迎来爆发，原因有二：

1.  **长文本需求的爆发：** RAG（检索增强生成）、代码分析、小说续写等场景都需要处理 100k+ 的上下文，Transformer 的 $O(N^2)$ 瓶颈彻底暴露。
2.  **新架构的成熟：** 早期的高效架构（如 Reformer, Performer）效果往往大打折扣。但随着 **Mamba (SSM)**、**RWKV** 和 **DeepSeek-MoE** 的出现，人们发现高效架构的性能终于可以媲美甚至超越标准 Transformer 了。

## 它是如何解决的？

这篇综述将高效架构的“武器库”归纳为五大类：

### 1. 线性与稀疏序列建模 (Linear & Sparse Sequence Modeling)
这是最激进的流派，试图彻底干掉 $O(N^2)$。
*   **代表技术：** **Mamba (SSM)**, **RWKV**, **Linear Attention**。
*   **原理：** 它们通过循环神经网络（RNN）的形式或核方法（Kernel Trick），将注意力机制的复杂度降为 $O(N)$。这意味着无论输入多长，推理时的显存占用和计算量都是恒定的。

### 2. 高效的全注意力变体 (Efficient Full Attention)
这一派不想放弃强大的 Softmax Attention，而是通过“剪枝”来加速。
*   **代表技术：** **Sliding Window Attention** (Mistral), **Ring Attention**。
*   **原理：** 不让每个 Token 看所有历史，而是只看最近的 $K$ 个，或者分块计算。

### 3. 稀疏混合专家 (Sparse Mixture-of-Experts, MoE)
这是目前大模型界的“当红炸子鸡”（如 DeepSeek-V3, Mixtral）。
*   **原理：** 模型参数虽然巨大（如 total 600B），但处理每个 Token 时只激活其中一小部分（active 30B）。
*   **效果：** 拥有大模型的知识容量，却只有小模型的推理延迟。

### 4. 混合架构 (Hybrid Architectures)
博采众长，取长补短。
*   **代表技术：** **Jamba** (Mamba + Transformer), **Griffin** (RNN + Local Attention)。
*   **原理：** 用 SSM 层处理长距离依赖（省显存），穿插 Transformer 层处理复杂的查取任务（保质量）。这是目前公认的“六边形战士”方案。

### 5. 扩散大模型 (Diffusion LLMs)
*   **原理：** 借鉴图像生成的 Diffusion 思想，尝试非自回归（Non-Autoregressive）生成，可能打破“只能一个词一个词往外崩”的串行限制。

## 还有更好的解决方案吗？

这篇综述本身就是在探讨“更好的解决方案”。目前的共识是：**没有一种架构能通吃所有场景。**

*   **短文本对话：** MoE Transformer 依然是王者（生态好，泛化强）。
*   **超长文本分析：** Mamba/Hybrid 架构优势巨大（无限窗口，不掉速）。
*   **端侧设备：** 极度轻量化的 RWKV 或 Mobile-MoE 更具潜力。

## 关键词解析

### 1. SSM (State Space Models / 状态空间模型)

*   **传统模型 (Transformer)：** 每次都要翻阅完整的历史记录（KV Cache），像一个**永远在翻看厚厚日记本**的人。
*   **SSM (如 Mamba)：** 无论经历多少事，只把核心记忆压缩进一个固定大小的状态 $h_t$ 中，像一个**拥有极强短期记忆**的人，边走边忘边记。
*   **通俗理解：** Transformer 是“开卷考试”（随时查书），SSM 是“闭卷考试”（全凭脑子记）。虽然闭卷难，但答题速度极快。

### 2. MoE (Mixture of Experts / 混合专家)

*   **机制：** 你的大脑里住着 100 个专家（数学家、诗人、码农...）。
*   **传统模型 (Dense)：** 不管问什么问题（比如 1+1 等于几），都要把这 100 个人全叫醒一起开会。效率极低。
*   **MoE：** 遇到数学题，门口的接待员（Router）只叫醒数学家；遇到写诗，只叫醒诗人。
*   **优势：** **训练快、推理快、容量大。**

### 3. 线性注意力 (Linear Attention)

*   **核心魔法：** 改变计算顺序。
*   **标准 Attention：** $(Q \times K^T) \times V$。先算 $N \times N$ 的分数矩阵，内存爆炸。
*   **线性 Attention：** $Q \times (K^T \times V)$。利用结合律，先算 $K$ 和 $V$ 的聚合，得到一个 $d \times d$ 的小矩阵，再和 $Q$ 乘。
*   **代价：** 必须去掉或近似 Softmax 非线性变换，这通常会导致精度损失。

---

### 总结

《Speed Always Wins》这篇综述告诉我们，LLM 的架构演进正在从“暴力美学”转向“精细化管理”。未来的超级模型很可能是一个**混合体**：

1.  用 **MoE** 扩大容量。
2.  用 **SSM/Linear** 解决长窗口。
3.  用 **Transformer** 保证核心逻辑。

**速度不仅仅是体验，更是智能的扩展边界。** 只有架构足够高效，我们才能让 AI 像电力一样无处不在。

# 参考资料

- [论文地址：Speed Always Wins: A Survey on Efficient Architectures for Large Language Models](https://arxiv.org/abs/2508.09834)
- [GitHub 仓库](https://github.com/weigao266/Awesome-Efficient-Arch)

*编辑：2026-01-30*
