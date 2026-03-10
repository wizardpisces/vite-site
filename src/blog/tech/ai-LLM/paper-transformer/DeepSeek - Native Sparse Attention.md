*论文发布时间：2025-02-17*

DeepSeek 团队发布的 **NSA (Native Sparse Attention)**（论文标题为《[Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089)》）是长文本模型效率优化的一次重要突破。

简单来说，这篇论文提出了一种**原生可训练（Natively Trainable）**且**硬件对齐（Hardware-Aligned）**的稀疏注意力机制。它打破了“稀疏注意力只能用于推理加速”的刻板印象，证明了在**训练阶段**就引入稀疏性，不仅能大幅降低计算成本，还能在长上下文和推理任务上超越全注意力（Full Attention）模型。

## NSA 解决了什么问题？

**核心问题：全注意力机制（Full Attention）在长文本下的昂贵开销，以及现有稀疏方法的“虚假繁荣”。**

在 NSA 出现之前，长文本处理面临两个主要困境：

*   **全注意力的计算墙：** 标准 Attention 的计算复杂度是 $O(N^2)$。处理 64k 甚至更长的序列时，计算量和显存占用呈二次方爆炸。这不仅拖慢推理，更让长序列的**训练**变得极其昂贵。
*   **现有稀疏方法的局限：** 业界虽然有很多稀疏注意力方法（如 H2O, Quest, MInference），但它们大多存在致命缺陷：
    *   **推理“特供”：** 大多数方法是在模型训练完后，推理时强行砍掉“不重要”的 KV。这是一种“事后诸葛亮”，模型在训练时没见过稀疏模式，导致效果下降。
    *   **难以训练：** 一些试图在训练中引入稀疏的方法（如基于聚类或哈希），往往包含不可导的操作（如 Top-k index），或者由于内存访问不连续，无法利用 GPU Tensor Core 加速，导致**理论上计算少了，实际上跑得更慢**。

**NSA 的作用：** 它设计了一套既能**端到端训练**，又能**完美契合硬件（Triton 优化）**的稀疏架构。它让模型在“娘胎里”（预训练阶段）就学会如何高效地“挑重点看”，从而在保持甚至超越全注意力性能的同时，实现数倍的训练和推理加速。

## 这个问题真实存在吗？

**极其真实，是迈向“无限上下文”和“深度推理”的必经之路。**

*   **长文本刚需：** 现在的 AI 需要阅读整本书、处理整个代码库（Repo-level coding）、进行超长思维链（Long Chain-of-Thought）推理。64k、128k 甚至 1M 的上下文正在成为标配。
*   **算力瓶颈：** 在 64k 长度下，Attention 计算占据了 70%-80% 的推理延迟。如果不解决这个问题，单纯堆卡也无法实现实时的长文本应用。
*   **硬件利用率陷阱：** 很多稀疏算法看着很美（计算量只有 10%），但因为内存读写（IO）太乱，GPU 大部分时间都在等数据，导致加速比极低。

## 它是如何解决的？

NSA 的核心在于**“分层（Hierarchical）”**的设计思想，它将注意力分配到了三个不同的分支，像漏斗一样高效筛选信息。

### 1. 核心架构组件：三支柱策略

![NSA 三分支架构总览：压缩、选择、滑动窗口的层级设计](https://arxiv.org/html/2502.11089v1/x1.png)

NSA 的核心在于**“分层（Hierarchical）”**的设计思想，它将注意力分配到了三个不同的分支，像漏斗一样高效筛选信息。以下是它们在**网络层（Tensor Op）**的具体实现：

#### A. 压缩注意力 (Token Compression) —— “低分辨率扫全局”

*   **原理：** 将连续的 Token 块压缩成一个摘要 Token，用极低的成本扫描全局。
*   **网络层实现：**
    1.  **Reshape (分组)：** 将输入序列 `[t, d]` 切分为 `[t/32, 32, d]` 的块（例如 Block Size = 32）。
    2.  **MLP (融合)：** 使用一个简单的 MLP 对每个块内的 32 个 Token 进行加权融合（类似于池化），输出 `[t/32, d]` 的压缩向量。
    3.  **Result：** 得到一个长度仅为原始 1/32 的“目录”序列。
*   **作用：** 解决“因为稀疏而漏掉重要信息”的问题。计算量减少了 97%。

#### B. 选择注意力 (Token Selection) —— “高分辨率看重点”

*   **原理：** 基于压缩分支的评分，选出最重要（Top-k）的原始 Block 进行精读。
*   **网络层实现：**
    1.  **Score (打分)：** Query 与“目录”序列计算相似度。
    2.  **TopK (筛选)：** 这是一个不可导操作（但在 Forward 中使用），选出分数最高的 $k$ 个索引（Indices）。
    3.  **Gather (取货)：** **这是关键一步**。利用索引，直接从显存中的原始高精度 KV 存储区（Shape `[t, d]`）中，**只搬运**那 $k$ 个 Block 到计算单元。
    4.  **Attention：** 只对这 $k \times 32$ 个 Token 进行标准的 Attention 计算。
*   **作用：** 它是稀疏性的主要来源。无论总长度 $t$ 多长，计算量被锁定为常量 $O(k)$。

#### C. 滑动窗口 (Sliding Window) —— “高分辨率看眼前”

*   **原理：** 无论如何，始终保留最近的 $w$ 个 Token。
*   **网络层实现：**
    1.  **Slice (切片)：** 这是一个简单的张量切片操作 `K[:, -w:, :]`。
    2.  **Attention：** 对这 $w$ 个 Token 进行标准计算。
*   **作用：** 保证基础流畅度和局部逻辑不丢失。

> **疑问：这三个分支处理的 Token 会重叠吗？是重复计算吗？**
>
> *   **物理重叠：** 是的。一个重要的近期 Token，可能既在 **Window** 里，又被 **Selection** 选中了。
> *   **计算不重复（特征解耦）：** 论文强调了 **Independent Keys and Values**。也就是说，这三个分支拥有**独立的一套投影参数 ($W_{QKV}$)**。
>     *   **Window 分支**可能侧重看“语法”（比如主谓一致）。
>     *   **Selection 分支**可能侧重看“语义”（比如指代消解）。
>     *   **Compression 分支**则负责“宏观概括”。
>     *   即使是同一个词，被三个分支“看”的时候，提取出的特征也是**正交**的，这不仅不是浪费，反而是全方位的增强。

### 2. 硬件对齐 (Hardware-Aligned) 的魔法

![硬件对齐的稀疏 Kernel：块级稀疏与 GQA 友好的内核设计](https://arxiv.org/html/2502.11089v1/x2.png)

算法设计得再好，如果由于内存访问碎片化导致 GPU 跑不快也是白搭。NSA 做了两项关键的工程优化：

*   **块级稀疏 (Blockwise Sparsity)：**
    *   **问题：** GPU 极其讨厌“随机访问”（比如读第 1 个，第 5 个，第 9 个 Token）。
    *   **NSA 的解法：** 强制以 **Block（块）** 为单位进行读取（比如一次读连续的 64 个 Token）。这就像搬砖，一次搬一整车，而不是一块块捡，完美利用了 Tensor Core 的矩阵乘法能力。
*   **GQA 友好的内核设计 (Group-Centric Kernel)：**
    *   **问题：** 现代大模型都用 GQA（分组查询注意力），多个 Query 头共享一组 KV。
    *   **NSA 的解法：** 在底层 Kernel 实现上，强制让同一组的 Query 共享 KV 加载。这避免了重复读取显存，进一步压榨了 IO 性能。
    *   **结果：** 在 64k 长度下，前向传播（Forward）加速 **9 倍**，解码（Decoding）加速 **11.6 倍**。

### 3. 原生可训练 (Natively Trainable)

*   **门控融合 (Gating)：** 三个分支的结果不是简单相加，而是通过一个可学习的 MLP 门控网络进行加权融合。
*   **训练稳定性：** 相比于那些生硬的“剪枝”，NSA 的每个组件都是可微或通过巧妙设计参与反向传播的，这让模型能真正学会“如何稀疏”。

## 深度解构：从网络层视角看变化

为了更有“体感”地理解 NSA 对网络层的改变，我们直接对比标准 **Decoder-only Transformer (如 GPT)** 和 **NSA** 在推理（Inference）时的**关键数学公式**。

### 1. 标准 Attention 层 (Baseline)

在标准的《Attention Is All You Need》架构中，Decoder 生成第 $t$ 个词时，需要回头看之前所有的 $t-1$ 个词。

$$
Output_t = \text{Softmax}\left(\frac{\mathbf{q}_t \cdot \mathbf{K}_{1:t}^T}{\sqrt{d}}\right) \cdot \mathbf{V}_{1:t}
$$

*   **计算瓶颈：** $\mathbf{K}_{1:t}$ 的长度是 $t$。随着生成长度无限增长（例如 64k），这个矩阵乘法的计算量呈线性爆炸 $O(t)$，且每次都要搬运巨大的 KV Cache。

### 2. NSA Attention 层

NSA 将上述单一的巨大矩阵计算，拆解为三个并行的小型矩阵计算，并通过门控（Gating）融合。

> **关键前置知识：这些 K 和 V 是从哪来的？**
>
> 在计算公式之前，必须先明确数据流的**“身世”**。NSA 并不是简单地对一套 KV 进行切分，而是引入了**三套独立的投影**（为了特征解耦）：
>
> 1.  **输入：** 原始隐藏状态 $X$ (Shape: $[t, d_{model}]$)
> 2.  **独立投影：**
>     *   **Window 分支：** $K^{win} = X W_K^{win}$ （保留原始精度）
>     *   **Selection 分支：** $K^{slc} = X W_K^{slc}$ （保留原始精度）
>     *   **Compression 分支：** $K^{raw\_cmp} = X W_K^{cmp}$ $\rightarrow$ **压缩变换** $\rightarrow$ $K^{cmp}$
>
> 搞清楚了原料来源，我们再看具体的烹饪过程：

$$
Output_t = g_{cmp} \cdot \mathbf{O}_{cmp} + g_{slc} \cdot \mathbf{O}_{slc} + g_{win} \cdot \mathbf{O}_{win}
$$

其中三个核心组件的计算公式如下：

#### A. 压缩注意力 (Compression) —— “低分辨率扫全局”
$$
K_{cmp} = \text{MLP}(\text{Reshape}(K^{raw\_cmp}))
$$
$$
\mathbf{O}_{cmp} = \text{Attention}(\mathbf{q}_t, \mathbf{K}_{cmp}, \mathbf{V}_{cmp})
$$
*   **网络层实现 (Tensor Op)：**
    1.  **Reshape (分组)：** 将长度为 $t$ 的序列切成 $t/32$ 个块。比如 `[64000, d]` $\rightarrow$ `[2000, 32, d]`。
    2.  **MLP (融合)：** 对每个块内的 32 个 Token 向量进行加权融合（学习如何提取摘要），变成 1 个向量。形状变为 `[2000, d]`。
    3.  **Result：** 这 2000 个向量就是“目录”。
*   **意义：** 计算量直接砍掉 97%，用极低成本获取全局概览。

#### B. 选择注意力 (Selection) —— “高分辨率看重点”
$$
\text{Indices} = \text{TopK}(\text{Softmax}(\mathbf{q}_t \cdot \mathbf{K}_{cmp}^T)) \quad \leftarrow \text{1. 拿【压缩分支】的评分}
$$
$$
\mathbf{K}_{indices} = \text{Gather}(K^{slc}, \text{Indices}) \quad \leftarrow \text{2. 去【选择分支】取货}
$$
$$
\mathbf{O}_{slc} = \text{Attention}(\mathbf{q}_t, \mathbf{K}_{indices}, \mathbf{V}_{indices})
$$
*   **网络层实现 (Tensor Op)：**
    1.  **Score (打分)：** Query 和 2000 个“目录”向量算相似度，得到 2000 个分数。
    2.  **TopK (筛选)：** 选出分数最高的 16 个索引（比如第 5 块和第 100 块）。
    3.  **Gather (取货)：** 利用这 16 个索引，从 $K^{slc}$（原始精度存储）中把对应的 Token 块搬运到 GPU 计算单元。注意：这里搬运的是**未经压缩**的原始向量。
    4.  **Attention：** 只对这 $16 \times 32 = 512$ 个 Token 进行精细计算。
*   **意义：** **这是最关键的公式变化**。无论总长度 $t$ 是 64k 还是 100k，这一步的计算量永远锁定在 512 个 Token。**复杂度从 $O(t)$ 降为 $O(1)$**。

#### C. 滑动窗口 (Window) —— “高分辨率看眼前”
$$
\mathbf{O}_{win} = \text{Attention}(\mathbf{q}_t, \mathbf{K}^{win}_{t-w:t}, \mathbf{V}^{win}_{t-w:t})
$$
*   **维度变化：** 输入的 KV 长度固定为 $w$（例如 512）。
*   **意义：** 保证附近的词（Local Context）永远被高精度关注。

> **疑问：这三个分支处理的 Token 会重叠吗？是重复计算吗？**
>
> *   **物理重叠：** 是的。一个重要的近期 Token，可能既在 **Window**（因为它近）里，又被 **Selection**（因为它重要）选中了，同时也参与了 **Compression**（因为它在全文里）。
> *   **计算不重复（特征解耦）：** 论文特别强调了 **Independent Keys and Values**。也就是说，这三个分支拥有**独立的一套投影参数 ($W_{QKV}$)**。
>     *   **Window 分支**可能侧重看“语法”（比如主谓一致）。
>     *   **Selection 分支**可能侧重看“语义”（比如指代消解）。
>     *   **Compression 分支**的 $W_{cmp}$ 则是看“宏观概括”。
>     *   即使是同一个词，被三个分支“看”的时候，提取出的特征也是**正交**的，就像你是通过形状、颜色和气味三个独立通道去感知同一个苹果，这不仅不是浪费，反而是全方位的增强。

> **追问：Standard Transformer 的 N 层堆叠本身不就是为了提取多层次抽象吗？NSA 在单层内搞 3 个分支，是不是把 N 变成了 3N 层抽象？**
>
> **不是。这 3 个分支是并行（Parallel）的，不是串行（Sequential）的。**
>
> 你可以把它理解为 **Attention 层的 MoE（混合专家）**：
>
> *   **Full Attention (老师傅)：** 一个人干完所有活（看全局、看细节、看局部），能力强但慢。
> *   **NSA (分工协作)：** 把活拆给三个**专精的小工**：
>     *   小工 A (Window) 负责看眼前。
>     *   小工 B (Selection) 负责挑重点。
>     *   小工 C (Compression) 负责扫大局。
> *   他们**同时干活**，最后把结果拼起来。这依然是**一层**的计算量，并没有增加网络的深度，而是增加了单层内的**“特征广度”**。

### 3. 核心差异总结

| 维度 | 标准 Attention (GPT) | NSA (DeepSeek) | 体感差异 |
| :--- | :--- | :--- | :--- |
| **KV 矩阵大小** | 随时间 $t$ 无限增长 | 锁定为常数 ($C \approx 2000$) | **越聊越慢 vs. 永不减速** |
| **计算复杂度** | $O(t)$ (Linear) | $O(1)$ (Constant) | 彻底解决长文本推理延迟 |
| **显存带宽** | 必须搬运全量 KV Cache | 只搬运 Top-K 块 (Cache Hit) | 显存带宽压力骤降 |

**本质变化：**
NSA 在数学上将注意力的“广度”和“精度”解耦了。
*   **旧公式：** 要么全看（高精但慢），要么不看（快但傻）。
*   **新公式：** 远处“眯着眼看”（Compression），感兴趣的地方“拿放大镜看”（Selection），眼前“睁大眼看”（Window）。这非常符合人类的阅读直觉。

## 还有更好的解决方案吗？

长文本优化是目前的“兵家必争之地”，NSA 并不是唯一的玩家。我们用**网络层公式的视角**来对比各路豪杰：

$$
\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{QK^T}{\sqrt{d}}\right)V
$$

### 1. Ring Attention / FlashAttention
*   **流派：** **系统优化派 (System Optimization)**。
*   **公式视角：** **公式完全不变**。
    *   它们不改变数学公式的任何一项，计算结果和标准 Attention 一模一样。
    *   **核心改动：** 它们优化的是**如何切分** $Q, K, V$ 矩阵，以及**如何搬运**它们进 GPU 显存（Tiling & IO Optimization）。
*   **对比 NSA：**
    *   FlashAttention 是把 $O(N^2)$ 做得更快，但还是 $O(N^2)$。
    *   NSA 是直接把公式里的 $N$ 换成了常数 $C$，实现了算法层面的降维打击。

### 2. Mamba / SSM (状态空间模型)
*   **流派：** **线性递归派 (Linear Recurrence)**。
*   **公式视角：** **彻底抛弃 $QK^T$**。
    *   **公式变化：** $h_t = A h_{t-1} + B x_t$ （类似于 RNN）。
    *   它不再保留历史的 $K$ 和 $V$ 矩阵，而是把所有历史压缩进一个固定大小的隐状态 $h_t$ 中。
*   **对比 NSA：**
    *   **SSM：** 遗忘是必然的。因为 $h_t$ 容量有限，太久远的信息会被挤出去，无法“精准回看”。
    *   **NSA：** 保留了 Attention 的灵魂——**随时可以精准回看**（只要它被 Selection 选中）。它结合了 RNN 的速度（压缩分支）和 Attention 的精度（选择分支）。

### 3. 其他稀疏 Attention (H2O, Quest, InfLLM)
*   **流派：** **推理剪枝派 (Inference Pruning)**。
*   **公式视角：** **训练时用全量，推理时用残量**。
    *   **训练公式：** $Output = \text{Attention}(Q, K_{all}, V_{all})$
    *   **推理公式：** $Output = \text{Attention}(Q, K_{topk}, V_{topk})$
*   **对比 NSA：**
    *   这种“训练一套、推理一套”的做法导致了**分布偏移 (Distribution Shift)**。模型在训练时习惯了依赖微弱的信号，推理时突然被切断，性能会崩塌。
    *   **NSA：** 训练和推理用的是同一套稀疏公式，模型**适应了稀疏**。

### 4. Gated Attention (Alibaba)
*   **流派：** **门控修正派 (Gating Correction)**。
*   **公式视角：** **公式外部加锁**。
    *   **公式变化：** $Output = \text{Attention}(Q, K, V) \odot \sigma(Gate)$
    *   它不改变 Attention 内部的计算（依然是全量 $O(N^2)$），但在输出时加了一个门，如果不重要就乘 0。
*   **对比 NSA：**
    *   **Gated Attention：** 解决的是**质量问题**（注意力黑洞），计算量没变，甚至略有增加。
    *   **NSA：** 解决的是**速度问题**，计算量大幅减少。

**NSA 的优势在于：** 它不妥协。既要 Attention 的精准（Performance），又要 RNN 级别的速度（Efficiency），还要能像标准 Transformer 一样好训练。

## 关键词解析

### 1. 压缩与选择 (Compression & Selection)

这是 NSA 解决“既要全局又要细节”矛盾的核心。

*   **压缩 (Compression)：** 就像看书先看**目录**。把一章的内容（比如 32 个词）压缩成一个向量。Query 先和这些“目录”算相关性。
*   **选择 (Selection)：** 发现第 5 章“目录”很有趣，于是把第 5 章的**正文**（原始 KV）完整加载出来细读。
*   **通俗理解：** 如果全注意力是“逐字阅读整本书”，NSA 就是“先扫目录，再跳读重点章节，同时余光扫视正在读的这一段（滑动窗口）”。

### 2. 硬件算术强度 (Arithmetic Intensity)

这是 DeepSeek 团队非常强调的一个底层概念。

*   **定义：** 计算量 (FLOPs) / 内存访问量 (Bytes)。
*   **现状：** Transformer 的解码阶段（Decoding）是典型的**内存受限 (Memory-bound)** 任务。GPU 算力过剩，但显存带宽不够，数据供不上。
*   **NSA 的解法：** 通过大幅减少需要读取的 KV Block 数量（只读 Top-k），直接降低了内存访问压力，从而释放了 GPU 的计算潜能。

### 3. MLA (Multi-Head Latent Attention) 是 NSA 吗？

**不是，它们是 DeepSeek 的两把不同的“屠龙刀”。**

很多同学因为它们都出自 DeepSeek 且都涉及“省显存”而混淆。

*   **MLA (DeepSeek-V2/V3 核心)：**
    *   **本质：** **无损压缩的全注意力 (Compressed Full Attention)**。
    *   **解决问题：** **存不下**。通过低秩分解（Low-Rank Compression）把 KV 向量压得极小，让 64k 长度的 KV Cache 能塞进显存。
    *   **计算：** **依然是全量计算**。逻辑上，Query 还是要和 64k 个（解压后的）KV 交互。计算复杂度依然是 $O(N^2)$。
    *   **关键词：** 显存容量 (Memory Capacity)、低秩 (Low-Rank)。

*   **NSA (新论文)：**
    *   **本质：** **有损（但聪明）的稀疏注意力 (Sparse Attention)**。
    *   **解决问题：** **算得慢**。即使显存放得下，算 64k 次乘法也太慢了。NSA 选择只和 1k 个最重要的 KV 交互。
    *   **计算：** **稀疏计算**。Query 忽略绝大多数“无关紧要”的 KV。计算复杂度是 $O(N \log N)$ 或更低。
    *   **关键词：** 计算效率 (Compute Efficiency)、选择 (Selection)。

**终极形态预测：** 未来的模型（DeepSeek-V4？）很可能会**同时使用 MLA 和 NSA** —— 用 MLA 让你能以极低显存代价“存”下 100 万字，用 NSA 让你能以极快速度“读”完这 100 万字。

---

## 总结

NSA 的本质是**“符合 GPU 脾气的原生稀疏注意力”**：

1.  **原生 (Native)：** 它是训练出来的，不是推理想象出来的。模型自己学会了忽略噪音。
2.  **分层 (Hierarchical)：** 宏观（压缩）+ 微观（选择）+ 局部（窗口），三管齐下，无死角覆盖。
3.  **工程化 (Engineering)：** 一切算法设计都为硬件效率让路（Blockwise, Triton Kernel），将理论稀疏度转化为真实的物理加速。

# 参考资料

- [论文原文 (ArXiv)](https://arxiv.org/abs/2502.11089)

*编辑：2026-01-30*
