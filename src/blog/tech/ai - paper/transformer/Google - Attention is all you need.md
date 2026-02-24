*论文发布时间：2017-06-12*

Google 团队发布的 **Transformer**（论文标题为《[Attention Is All You Need](https://arxiv.org/abs/1706.03762)》）是 AI 发展史上的一座里程碑。

简单来说，这篇论文提出了一种全新的网络架构 **Transformer**，彻底抛弃了当时主流的循环神经网络（RNN）和卷积神经网络（CNN），完全依赖**注意力机制（Attention Mechanism）**来处理序列数据。这一架构后来成为了 BERT、GPT 等所有现代大语言模型的基石。

## Transformer 解决了什么问题？

**核心问题：RNN 在处理长序列时的“无法并行”和“长距离依赖遗忘”问题。**

在 Transformer 出现之前，NLP 领域的统治者是 LSTM 和 GRU 等 RNN 变体。它们存在两个致命缺陷：

*   **无法并行（计算效率低）：** RNN 必须按照时间步（t, t+1, ...）依次计算。处理第 100 个词之前，必须先算完前 99 个词。这导致 GPU 的并行计算能力无法发挥，训练极慢。
*   **长距离依赖（记忆瓶颈）：** 虽然 LSTM 缓解了梯度消失，但当序列很长时（比如一段几百字的话），开头的信息传到结尾时依然会变得模糊。模型很难“记住”很久之前出现的主语。

**Transformer 的作用：** 它引入了 **Self-Attention（自注意力）** 机制，让模型可以**一次性看到所有词**。无论句子多长，第 1 个词和第 100 个词之间的距离都是 1（可以直接交互），而且所有计算都可以并行进行。

## 这个问题真实存在吗？

**极其真实，是当时制约 NLP 发展的最大路障。**

*   **训练时长：** 当时的 SOTA 模型在 WMT 翻译数据集上需要训练数天甚至数周。Transformer 将训练时间缩短了几个数量级（在 8 个 P100 GPU 上仅需 3.5 天）。
*   **性能上限：** RNN 的串行特性限制了模型的深度和宽度。想把模型做大（Scaling），就必须解决并行训练的问题。Transformer 的出现才让后来 GPT-3 这种千亿参数模型成为可能。

## 为什么是 Attention？

其实“注意力机制”在 2014 年就已经被引入 RNN（Bahdanau Attention），用来提升翻译质量。但 Vaswani 等人的突破性思维在于：**既然 Attention 效果这么好，为什么还需要 RNN？**

1.  **大胆做减法：** 之前的模型是 "RNN + Attention"。这篇论文直接去掉了 RNN，证明了 **Attention Is All You Need**（只需要注意力机制）。
2.  **硬件的呼唤：** GPU/TPU 擅长大规模矩阵乘法。Transformer 的核心计算（$QK^T$）全是矩阵乘法，完美契合硬件特性，让算力利用率大幅提升。
3.  **信息的直接通路：** 在 RNN 中，信息传递需要 $O(N)$ 步；在 Transformer 中，任意两个词的信息传递只需要 $O(1)$ 步。

## 它是如何解决的？

Transformer 的架构构建了一个标准的“编码器-解码器”（Encoder-Decoder）结构。其核心在于将序列处理转化为矩阵运算，从而实现高效并行。

### 1. 核心架构组件

*   **自注意力（Self-Attention）：** 灵魂所在。模型在处理每个词时，都会计算它与句中其他所有词的关联度，捕捉上下文依赖。
*   **多头注意力（Multi-Head Attention）：** 赋予模型“多视角”观察能力。不同头关注不同的语法或语义特征（如一个头看主谓关系，一个头看指代关系），最后拼接融合。
*   **位置编码（Positional Encoding）：** 弥补 Attention 无序性的“补丁”。通过正弦/余弦波为每个词注入位置信息，使模型能区分词序（如 "Tom hit Jerry" vs "Jerry hit Tom"）。
*   **前馈网络与残差连接（FFN & Residual）：** 经典的深度学习组件，保证网络能构建得足够深而不退化。

### 2. 深度解构：串行堆叠的 Layer (Vertical Stacking)

**Layer (= MultiHead Attention + FFN) 的堆叠是串行的，而非并行的。**

在 Transformer 架构图中的 $N \times$（如 $N=6$ 或 $N=96$），代表的是**垂直方向的深度堆叠**。

*   **数据流向：**
    $$ \text{Input} \to \text{Layer}_1 \to \text{Layer}_2 \to \dots \to \text{Layer}_N \to \text{Output} $$
    必须等 Layer 1 算完，Layer 2 才能拿到输入开始计算。这就是为什么网络越深，推理延迟（Latency）越高。

*   **真正的并行在哪里？** Transformer 的并行能力体现在**序列维度（Sequence）**和**多头维度（Multi-Head）**，而非层级维度。
    *   **Training 阶段：** 我们可以一次性把一句话里所有的 1000 个 Token **同时**塞进 Layer 1 进行计算（因为有 Teacher Forcing）。
    *   **Inference 阶段：** 第 $t$ 个词必须等第 $t-1$ 个词生成完才能开始（自回归），但在处理每一个词的内部，Attention 的 8 个头是**并行**工作的。

*   **最后是如何预测的？（Training vs Inference）**
    *   **Training 时（全量计算）：** 输入是一整句话（$N$ 个词），模型会并行计算出 $N$ 个隐藏状态 $h_1, \dots, h_N$。然后把这 $N$ 个 $h$ **全部**拿去乘以 LM Head，算出每一位置对下一个词的预测。
    *   **Inference 时（增量计算）：** 我们只关心**最后一个**词生成什么。所以虽然输入序列很长，但我们只取**最后一个位置**的隐藏状态 $h_{last}$ 去乘以 LM Head，算出下一个词的 Logits。之前的词在 KV Cache 里存着，不用重算。

#### A. 关键连接：Cross-Attention (交叉注意力)
除了处理序列内部关系的 Self-Attention，Encoder 和 Decoder 之间通过 **Cross-Attention** 进行桥接：
*   **交互方向：** **Decoder 关注 Encoder**。
*   **Query (Q)：** 来自 **Decoder**。意为：“为了预测下一个词，我需要关注源句子的哪些部分？”
*   **Key (K) & Value (V)：** 来自 **Encoder**。意为：“这是源句子的完整上下文特征。”
*   **直观模型：** 类似于**开卷考试**。Decoder（考生）拿着试卷上的问题（Query），去 Encoder（教科书）中检索相关的知识点（Key/Value）来生成答案。

#### B. 训练阶段：基于 Teacher Forcing 的并行化
**核心误区澄清：所谓的“并行”到底指什么？**
这里的并行**并非**指 Encoder 和 Decoder 互不依赖地同时计算（实际上 Decoder 必须等待 Encoder 输出）。Transformer 的核心突破在于**序列维度（Time Step）的并行化**，彻底消除了 RNN 的时序依赖。

由于训练时已知目标序列（Ground Truth），模型采用 **Teacher Forcing** 策略：
1.  **Encoder 前向计算：** 输入完整源序列，一次性计算出特征矩阵（K, V）。
2.  **Decoder 并行预测：** 将正确的目标序列经 Mask 处理后，**一次性**输入 Decoder。
    *   计算位置 10 的 Loss（预测第 11 个词）时，直接利用已知的正确前 10 个词作为输入。
    *   **结果：** 整个序列所有位置的概率计算和 Loss 计算，被转化为一个巨大的矩阵乘法，**在一个时间步内同时完成**。

> **疑问：联合训练时，不同位置对参数的更新会冲突吗？**
>
> 这并非冲突，而是**梯度的聚合（Gradient Aggregation）**。在反向传播中，Encoder 接收到的梯度是 Decoder 所有位置回传梯度的**向量和**。模型寻找的是**全局最优解**，让参数向着“使整体 Loss 最小”的平衡方向更新。

#### C. 推理阶段：串行的自回归 (Autoregressive)
在实际推理时，没有标准答案，模型必须**逐步生成**：
1.  **Encoder 预计算：** 处理源序列，生成 K, V 矩阵（复用）。
2.  **Decoder 循环生成：**
    *   **Step 1：** 输入 `<Start>`，结合 K/V，预测 `I`。
    *   **Step 2：** 将 `I` 拼接到输入，输入 `<Start> I`，结合 K/V，预测 `love`。
    *   ... 循环直至 `<End>`。

**结论：** 训练是**并行**的（高效），推理是**串行**的（逐步）。

### 3. 特殊优化：LayerNorm、残差连接与权重绑定

#### A. LayerNorm：模型的“稳压器”

在 Transformer 的每个 Block 中，无论是 Attention 还是 FFN，它们的输入前（Pre-Norm）或输出后（Post-Norm）都会接一个 **Layer Normalization (LayerNorm)**。

*   **为什么要归一化？**
    *   深度神经网络的数据流就像水流，流经每一层时，数值的**均值（Mean）**和**方差（Variance）**都会发生剧烈抖动（Internal Covariate Shift）。
    *   如果不加控制，数值可能在某一层突然爆炸（梯度爆炸）或消失（梯度消失），导致模型根本练不起来。

*   **LayerNorm 做了什么？**
    *   它强制把每一层输入的向量拉回到一个**“均值为 0，方差为 1”**的标准正态分布。
    *   这就好比每次考试前，都先把大家的卷面分折算成标准分，确保不同科目（不同层）之间的分数具有可比性。
    *   **效果：** 极大地稳定了梯度的传播，让我们可以用更大的学习率去训练更深的模型。没有它，BERT 和 GPT 这种百层模型根本跑不起来。

#### B. 残差连接 (Residual Connection)：信息的“高速公路”

在架构图中，你会看到每一层都有一个 $Add \ \& \ Norm$ 的操作，其中 $Add$ 指的就是残差连接：
$$ Output = F(x) + x $$

*   **它解决了什么？**
    *   在深层网络中，信号传得越深越容易“失真”或“衰减”。就像传话游戏，传到第 100 个人时，原始信息可能早就面目全非了。
    *   在反向传播时，梯度经过层层乘法，很容易变成 0（梯度消失），导致前面的层根本收不到更新信号。

*   **它是如何工作的？**
    *   它在复杂的变换网络 $F(x)$ 旁边，修了一条**直通的高速公路**（直接加 $x$）。
    *   这保证了至少有 $100\%$ 的原始信息能无损通过这一层。模型只需要去学习那些“变化的残差部分”（Residual），而不是从头学习整个映射。
    *   **效果：** 让网络理论上可以无限堆叠深度。著名的 ResNet 论文证明，有了它，训练 1000 层网络都成为了可能。

#### C. 权重绑定 (Weight Tying)

它对节省参数至关重要。

*   **问题背景：**
    Transformer 的“出口”是一个巨大的线性层（LM Head），将 $d_{model}$ 维向量映射回 $V$（词表大小）维的概率分布。
    $$ 4096 \times 100,000 \approx 4 \text{亿参数} $$
    这一层如果不优化，可能占据模型一半以上的参数。

*   **核心思想：**
    研究人员发现，**Embedding 矩阵**（把词 ID 变成向量）和 **LM Head 矩阵**（把向量变成词 ID 概率）其实是在做**互逆**的事情。
    *   **Input Embedding ($W_E$):** `ID -> Vector`。每一行代表一个词的“语义坐标”。
    *   **Output Head ($W_{out}$):** `Vector -> ID Logits`。每一列其实也是在判断向量是否符合该词的“语义坐标”。

*   **操作手法：**
    直接强制让输出矩阵等于输入矩阵的转置：
    $$ W_{out} = W_E^T $$

*   **真的省掉了吗？**
    **是的，物理上省掉了 $W_{out}$ 这个矩阵。**
    *   **不绑定：** 显存里要存两个巨大的矩阵：$W_{in}$ (入口) 和 $W_{out}$ (出口)。
    *   **绑定：** 显存里只存一个 $W_{in}$。计算输出时，直接将 $W_{in}$ 矩阵**转置（Transpose）** 后拿来用。
    *   **改变了什么？** 模型的最后一层（LM Head）在物理上**消失了**，变成了对第一层（Embedding）的**复用引用**。
    *   **效果：** 进门领的卡（Embedding），出门直接刷同一张卡（Tying）结算。不仅省了一半参数，还让“预测词”和“理解词”的任务共同打磨同一个向量，提升了 Embedding 质量。

*   **怎么知道对应哪个词？**
    由于我们复用的是 $W_E$，而 $W_E$ 的第 $i$ 行对应的就是词表中第 $i$ 个词（比如 "apple"）。
    所以计算 $h \cdot W_E^T$ 得到的向量中，第 $i$ 个数值自然就代表了模型对第 $i$ 个词的打分。

---

## 还有更好的解决方案吗？

在 2017 年，Transformer 就是**最优解**。而在今天（2026年），虽然它依然是霸主，但也出现了挑战者：

*   **线性 Attention (Linear Transformer)：** 试图将计算复杂度从 $O(N^2)$ 降为 $O(N)$。
*   **SSM / Mamba：** 状态空间模型，试图结合 RNN 的推理效率（$O(1)$ 内存）和 Transformer 的训练并行能力。
*   **MoE (Mixture of Experts)：** 如 DeepSeek-V3，引入稀疏计算，在保持 Transformer 架构基础的同时大幅提升计算效率。

## 关键词解析

### 1. 自注意力 (Self-Attention)
Transformer 抛弃 RNN 的底气。核心在于**“寻址（Addressing）”**与**“提取（Extraction）”**的分离。

*   **第一步：$Q \cdot K$ (寻址与评分)**
    *   **回答问题：** “我应该信谁？”
    *   **过程：** 拿着你的需求向量 ($Q$) 去和所有人的标签向量 ($K$) 做点积。
    *   **结果：** 得到一个**评分 (Attention Score)**。比如 "The" 找 "apple"，匹配度 0.9；找 "is"，匹配度 0.1。这一步只决定了**“视线看向哪里”**。

*   **第二步：Score $\cdot V$ (提取与合成)**
    *   **回答问题：** “我到底获得了什么信息？”
    *   **过程：** 根据刚才的评分，按比例去提取实际的内容向量 ($V$)。
    *   **结果：** 提取 90% 的 "apple" 的语义，10% 的 "is" 的语义，混合成一个新的向量。这解释了为什么 K 和 V 要分开：**“用来搜索的特征”**（书脊标签）和**“实际包含的内容”**（书内正文）往往不同。

*   **公式：** $$ Attention(Q, K, V) = \underbrace{softmax(\frac{QK^T}{\sqrt{d_k}})}_{\text{寻址 (Weights)}} \cdot \underbrace{V}_{\text{提取 (Content)}} $$

### 2. 多头机制 (Multi-Head)
增强模型的“容错率”和“语义捕获力”。
*   **解法：** 把向量切成多份（如 8 头），独立计算 Attention 后拼接。
*   **效果：** 就像瞎子摸象，不同的人摸不同的部位，汇总后才能还原整只象。

### 3. KV Cache：推理加速的关键技术

在 GPT 等 Decoder-only 模型的**推理（Inference）**阶段，**KV Cache** 是降低计算成本的核心技术。为什么我们只缓存 Key 和 Value，而不缓存 Query？这涉及到 Attention 机制的内在逻辑。

#### A. 为什么 Q 和 K 必须投影到不同空间？（非对称性建模）
输入虽然是同一个词向量 $x$，但通过 $W_Q$ 和 $W_K$ 投影后，它们承载了完全不同的语义功能：
*   **数学视角的非对称性 (Asymmetry)：** 注意力机制本质上是在建模词与词之间的**有向关系**。
    *   例如在 "The apple" 中，定冠词 "The" 需要强关注名词 "apple"，但名词 "apple" 对 "The" 的关注度通常较低。
    *   如果强制 $W_Q = W_K$（即 $Q=K$），那么 $Q \cdot K^T$ 将变成一个**对称矩阵**，意味着 $Attention(A \to B)$ 恒等于 $Attention(B \to A)$，这将严重限制模型捕捉复杂语言关系的能力。
*   **功能视角的差异：**
    *   **Query (Q)：** 代表**查询向量**，编码了“当前位置需要什么信息”的意图。
    *   **Key (K)：** 代表**索引向量**，编码了“当前位置包含什么特征”的信息，用于被检索。

#### B. 为什么 Q 不需要 Cache？（自回归的瞬时性）
在自回归（Autoregressive）生成过程中，模型逐个生成 Token。让我们分析生成第 $t$ 个 Token 时的计算流：

1.  **当前状态 (Query)：** 模型根据当前的输入 $x_t$，计算出查询向量 $q_t$。这个 $q_t$ 仅反映了**当前这一步**的查询需求（例如：寻找下一个搭配词）。
2.  **历史检索 (Key/Value)：** $q_t$ 需要与所有历史时刻的键值对 $(K_{1:t-1}, V_{1:t-1})$ 进行运算。
3.  **用完即弃：** 一旦第 $t$ 步的计算完成，生成了下一个 Token，$q_t$ 的生命周期就结束了。在第 $t+1$ 步时，会有全新的 $q_{t+1}$ 出现。旧的 Query 对未来的计算没有复用价值。
4.  **持久化价值：** 相反，历史 Token 的 $K$ 和 $V$ 向量在未来的**每一步**生成中都会被作为“被查询对象”反复使用。因此，将它们缓存（Cache）在显存中，可以避免重复计算，大幅降低 FLOPs。

#### C. 工程权衡与优化 (GQA / PagedAttention / MLA)
KV Cache 是一种典型的**空间换时间**策略：
$$ Output_t = \text{softmax}( \color{red}{q_t} \cdot [ \color{blue}{K_{cache}}, k_t ]^T ) \cdot [ \color{green}{V_{cache}}, v_t ] $$
随着序列长度增长，显存占用（VRAM）呈线性增长。为了解决**显存爆炸**问题，业界提出了多种优化方案：

1.  **GQA (Grouped-Query Attention)：** Llama-2/3 采用的方案。
    *   **机制：** 让多个 Head **共享**同一组 KV。例如 8 个 Query 头共享 1 个 KV 头。
    *   **原理：** 虽然 Query (意图) 需要多样化，但 Key/Value (底层特征) 往往高度冗余，可以共用。
    *   **代价：** 显存减少 8 倍，但属于**有损压缩**（丢失了部分多头信息）。

2.  **MLA (Multi-Head Latent Attention)：** DeepSeek-V2/V3 的核心创新。
    *   **机制：** **架构层面的先天设计**。
        *   与传统 Transformer 直接映射 ($Input \to K$) 不同，MLA 在网络结构定义时就强制插入了**“低秩瓶颈”**：$Input \to \text{压缩向量 } c \to \text{解压} \to K$。
        *   这就好比规定模型**只能**用 500 个常用字（压缩向量 $c$）来写文章，逼迫模型在训练阶段就学会极高密度的信息表达。
    *   **原理：** 利用矩阵乘法的结合律 $q^T \cdot (c \cdot W_{Up}) = (q^T \cdot W_{Up}) \cdot c$。
        *   **存储时：** KV Cache 只存那个极小的 $c$（压缩态）。
        *   **计算时：** 不需要把 $c$ 还原成巨大的 $K$，而是直接把解压矩阵 $W_{Up}$ **“吸收”** 到 Query 一侧处理（即用 $q$ 去乘 $W_{Up}$）。
    *   **优势：** **无损压缩**（数学上严格等价），显存占用比 GQA 更低，却能保留 MHA 的完整表达能力。

3.  **PagedAttention (vLLM)：** 借鉴操作系统虚拟内存的分页技术。将 KV Cache 切分为非连续的显存块，解决显存碎片化问题，大幅提升推理吞吐量。

### 4. 位置编码 (Positional Encoding)

Transformer 引入位置编码是为了解决 Attention 的无序性。它经历了从**“绝对加法”**到**“相对旋转”**的进化。

#### A. 1.0 时代：Sinusoidal Absolute PE (Transformer 原作)
Google 团队在 2017 年提出使用不同频率的正弦/余弦函数生成位置向量，并**直接加**到词向量上：
$$ \mathbf{x}_{pos} = \mathbf{x}_{embed} + \mathbf{p}_{pos} $$
*   **局限性分析（展开 Attention 公式）：**
    当计算两个位置 $m$ 和 $n$ 的 Attention 时：
    $$ (x_m + p_m)^T (x_n + p_n) = \underbrace{x_m^T x_n}_{\text{内容-内容}} + \underbrace{x_m^T p_n}_{\text{内容-位置}} + \underbrace{p_m^T x_n}_{\text{位置-内容}} + \underbrace{p_m^T p_n}_{\text{位置-位置}} $$
    *   虽然最后一项 $p_m^T p_n$ 确实包含相对位置信息，但中间两项交叉项（内容乘以位置）带来了**强烈的干扰**。
    *   这意味着：**“我是谁”（内容）和“我在哪”（位置）纠缠在了一起，无法解耦。** 这导致模型难以纯粹地根据“距离”来判断关系，从而限制了长文本外推能力。

#### B. 2.0 时代：RoPE (Rotary Positional Embedding) (现代标配)
Llama、DeepSeek 等现代模型均采用 RoPE。它的核心洞见是：**不要改变向量的模长（加法），而是改变向量的角度（旋转）。**

*   **机制：** 将词向量（二维切片）在复数平面上进行旋转。
    *   位置 $m$ 的向量旋转角度为 $m\theta$： $f(x, m) = x \cdot e^{i m \theta}$
    *   位置 $n$ 的向量旋转角度为 $n\theta$： $f(y, n) = y \cdot e^{i n \theta}$
*   **数学魔法：**
    当计算 Attention (内积) 时，旋转效果会发生奇妙的对消：
    $$ \begin{aligned} Score &= \text{Real}(q_m \cdot k_n^*) \\ &= \text{Real}((x_q e^{i m \theta}) \cdot (x_k e^{i n \theta})^*) \\ &= \text{Real}(x_q x_k^* \cdot e^{i(m-n)\theta}) \end{aligned} $$
    *   **结果：** 最终的 Attention 分数严格只取决于 **$(m-n)$**，即**相对距离**。
*   **优势：**
    1.  **纯粹的相对性：** 彻底消除了绝对坐标 $m$ 和 $n$ 的干扰。
    2.  **外推性 (Extrapolation)：** 模型能通过旋转规律理解比训练长度更远的距离（只要距离远，旋转频率高，相关性自然衰减），是 Long Context 模型的基石。

### 5. 缩放点积 (Scaled Dot-Product)
公式里的 $\sqrt{d_k}$。
*   **作用：** 防止梯度消失。高维向量点积结果过大回导致 Softmax 进入饱和区（梯度近 0）。除以缩放系数能把数值拉回舒适区，利于训练。

---

## 拓展：Transformer 的家族演变

虽然 Transformer 原作提出了完整的 Encoder-Decoder 架构，但后续的发展将其拆解为三大流派，各自统治了不同的 AI 领域。

### 1. Encoder-only (编码器流派)
*   **代表作：** **BERT**, **Sentence-BERT (SBERT)**, RoBERTa
*   **机制：** 只有 Encoder，使用**双向注意力 (Full Attention)**，能同时看到上下文。
*   **训练任务：** **完形填空 (Masked Language Modeling)**。挖掉句子中的词，让模型根据上下文填回去。
*   **核心能力：** **“理解”与“表示”**。
*   **适用场景：** 文本分类、情感分析、**语义匹配（Embedding）**。
    *   *注：SBERT 正是利用 Encoder 强大的语义提取能力，将句子压缩成高质量向量，用于计算句子间的相似度。*

### 2. Decoder-only (解码器流派)
*   **代表作：** **GPT 系列**, **Llama**, **Claude**, **DeepSeek**
*   **机制：** 只有 Decoder，使用**单向注意力 (Masked Self-Attention)**，只能看到前面的词。
*   **训练任务：** **文字接龙 (Causal Language Modeling)**。预测下一个词。
*   **核心能力：** **“生成”与“推理”**。
*   **适用场景：** 对话、写作、代码生成。这是目前 LLM 的主流架构。
    *   *注：在 Decoder-only 架构中，输入（Prompt）和输出（Completion）在同一个序列中流转，不再有独立的 Encoder 输出 C。*

### 3. Encoder-Decoder (编解码器流派)
*   **代表作：** **Transformer 原作**, **T5**, BART
*   **机制：** 完整的双塔结构。
*   **训练任务：** 翻译、序列到序列生成。
*   **核心能力：** **“转换”**。
*   **适用场景：** 机器翻译、文本摘要。

---

## 总结

**Attention Is All You Need** 不仅仅是一个标题，更是一种宣言。

1.  它证明了**并行计算**是提升 AI 能力的关键路径。
2.  它把**特征提取**的主动权完全交给了数据之间的相互作用（Self-Attention），而非人为设计的结构。
3.  它开启了 **Pre-training + Fine-tuning** 的大模型时代。

如果没有这篇论文，就没有今天的 ChatGPT、Claude 或 DeepSeek。

# 参考资料

- [论文原文](https://arxiv.org/abs/1706.03762)
- [The Illustrated Transformer (Jay Alammar)](http://jalammar.github.io/illustrated-transformer/)

*编辑：2026-01-26*
