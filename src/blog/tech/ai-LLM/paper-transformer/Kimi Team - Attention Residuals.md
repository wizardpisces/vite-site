*论文发布时间：2026-03-16*

Kimi Team 发布的 **Attention Residuals**（[论文链接](https://arxiv.org/abs/2603.15031)）是 Transformer 架构演进的一次重要创新。这篇论文针对现代大语言模型中标准残差连接的固有缺陷，提出了一种基于注意力机制的动态残差连接方案。

## 核心问题：PreNorm 残差连接的固有缺陷

**标准残差连接的问题是什么？**

在现代 LLM 中，PreNorm 结构的残差连接已成为标准配置。其基本形式为：

```
x_{l+1} = x_l + Layer_l(Norm(x_l))
```

这种设计存在一个根本性问题：**所有层的输出都以固定的单位权重（1）累加**。随着网络深度增加：

1. **不受控的隐藏状态增长**：每层的贡献被平等累加，导致深层网络的隐藏状态幅度失控增长
2. **层贡献逐渐稀释**：后续层的输出被淹没在前面所有层的累积和中，单个层的影响力被稀释
3. **信息选择能力缺失**：模型无法根据输入内容动态决定应该更多依赖哪些层的表示

**这个问题真实存在吗？**

确实存在。实验观察到：
- 标准 Transformer 在深层网络中，输出幅度随深度指数增长
- 梯度分布在不同层之间严重不均匀
- 深层模型难以有效训练和优化

## Attention Residuals：用注意力替代固有累加

**核心思想非常直接：既然 Attention 机制能够在时间维度上动态选择信息，为什么不能在深度维度上也这样做？**

### 基本架构

Attention Residuals 将固定的残差累加替换为 softmax 注意力：

```
x_{l+1} = Σ_{i=0}^{l} α_{l,i}(x_l) · x_i

其中 α_{l,i}(x_l) = softmax(q_l^T k_i / √d)
q_l = W_q · x_l  (query 从当前层输出计算)
k_i = W_k · x_i  (key 从第 i 层输出计算)
```

### 关键问题：这真的是 Attention 吗？

**AttnRes 不是简单的"可学习权重"，而是真正的 Attention：**

| 方案 | 权重形式 | 是否依赖输入 | Q-K 机制 |
|------|---------|------------|---------|
| 固定残差 | w_i = 1 (常量) | ❌ | ❌ |
| 可学习权重 | w_i ∈ ℝ (参数) | ❌ | ❌ |
| **AttnRes** | **α_i = f(x_l, x_i)** | **✅** | **✅** |

**核心区别：**

```python
# 可学习权重：所有输入用同一组权重
x_out = w_0*x_0 + w_1*x_1 + ... + w_L*x_L  
# w_i 是固定参数，"cat" 和 "dog" 用相同权重

# AttnRes：权重动态计算
q = W_q @ x_l; k_i = W_k @ x_i
α_i = softmax(q @ k_i / √d)  # 通过 Q-K 内积计算
x_out = Σ α_i * x_i
# 不同输入 → 不同权重分布
```

**为什么叫 Attention？** 因为使用了 Query-Key 机制，权重随输入内容动态变化，不同样本、不同位置会产生不同的层聚合模式。

### 为什么有效？

- **打破固定权重假设**：不同输入可以依赖不同层的表示
- **幅度控制**：softmax 归一化避免了累加导致的幅度膨胀
- **梯度稳定**：更均匀的跨层梯度分布，易于训练深层网络

## Block AttnRes：实用化的关键

### 回答关键问题：在哪里使用 AttnRes？

**三种方案对比：**

1. **标准 Transformer（Baseline）**
   - 每一层都用固定残差：`x_{l+1} = x_l + Layer_l(Norm(x_l))`
   - 所有层与层之间都是简单相加

2. **全量 AttnRes（理想但不实用）**
   - 每一层都用注意力聚合所有前面层的输出
   - Layer 10 需要对 Layers 0-9 做注意力
   - Layer 20 需要对 Layers 0-19 做注意力
   - 问题：**复杂度 O(L²)**，内存和通信开销巨大

3. **Block AttnRes（论文实际采用）**
   - **并非所有层之间都用 AttnRes**
   - 而是将层分成多个 block，只在 block 级别使用 AttnRes

### Block AttnRes 的具体设计

**分块策略：**

假设有 12 层 Transformer，分成 3 个 block（每个 block 4 层）：

```
Block 1: Layers 1-4
Block 2: Layers 5-8
Block 3: Layers 9-12
```

**连接方式：**

1. **Block 内部（Layer 与 Layer 之间）**：
   - 使用**标准残差连接**（固定权重相加）
   - Layer 2 = Layer 1 + Transform(Norm(Layer 1))
   - Layer 3 = Layer 2 + Transform(Norm(Layer 2))
   - 这部分和原始 Transformer 完全一样，快速且无额外开销

2. **Block 之间（Block 与 Block 之间）**：
   - 使用 **Attention Residuals**
   - Block 2 的起始输入 = AttnRes(Block 1 的输出, Block 0 的输出)
   - Block 3 的起始输入 = AttnRes(Block 2 的输出, [Block 0, Block 1, Block 2 的输出])
   - 每个 block 只需要对前面的 N 个 block 做注意力，而不是对 L 个 layer

**形象理解：**

```
标准 Transformer:
Layer1 --[+]--> Layer2 --[+]--> Layer3 --[+]--> ... --[+]--> Layer12
         ↑               ↑               ↑                    ↑
      固定权重1      固定权重1      固定权重1            固定权重1

全量 AttnRes:
Layer1 --------→ Layer2 --------→ Layer3 --------→ ... --------→ Layer12
         ↘     ↗         ↘     ↗         ↘     ↗              ↗
          Attention      Attention      Attention        Attention
            (所有前面的层)   (所有前面的层)   (所有前面的层)    (所有前面的层)

Block AttnRes:
[Block1: L1→L2→L3→L4] --Attention--> [Block2: L5→L6→L7→L8] --Attention--> [Block3: L9→L10→L11→L12]
     Block内部用[+]                        Block内部用[+]                       Block内部用[+]
                        ↘              ↗                      ↘              ↗
                         Block级别的Attention                 Block级别的Attention
```

**复杂度优化：**

| 方案 | 注意力次数 | 内存复杂度 | 通信开销 |
|------|-----------|-----------|---------|
| 标准 Transformer | 0 | O(d) | O(L) |
| 全量 AttnRes | L 次 | O(L·d) | O(L²) |
| Block AttnRes (L=12, N=3) | N=3 次 | O(N·d) | O(N²) |

**关键优势：**
- 将注意力操作从 L 次降低到 N 次（N << L）
- 内存从 O(L·d) 降至 O(N·d)
- 通信次数从 O(L²) 降至 O(N²)
- 保留了大部分全量 AttnRes 的收益（80-90%）

**实现技巧：**
- **基于缓存的流水线通信**：复用已计算的 block 表示，避免重复传输
- **两阶段计算策略**：分离 block 内和 block 间的计算，优化调度

### 具体计算流程示例

假设 12 层 Transformer，分成 3 个 block（每 block 4 层）：

**输入**: x₀

**Block 1 (Layers 1-4) 内部标准残差：**
```
x₁ = x₀ + Layer₁(Norm(x₀))
x₂ = x₁ + Layer₂(Norm(x₁))
x₃ = x₂ + Layer₃(Norm(x₂))
x₄ = x₃ + Layer₄(Norm(x₃))  ← Block 1 输出
```

**Block 2 (Layers 5-8) 开始前使用 AttnRes：**
```
# 注意：这里用 AttnRes 聚合 Block 1 的输出
x₄' = AttnRes(x₄, [x₄])  # 目前只有一个 block 的输出

# 然后 Block 2 内部继续标准残差
x₅ = x₄' + Layer₅(Norm(x₄'))
x₆ = x₅ + Layer₆(Norm(x₅))
x₇ = x₆ + Layer₇(Norm(x₆))
x₈ = x₇ + Layer₈(Norm(x₇))  ← Block 2 输出
```

**Block 3 (Layers 9-12) 开始前使用 AttnRes：**
```
# 这里用 AttnRes 聚合 Block 1 和 Block 2 的输出
x₈' = AttnRes(x₈, [x₄, x₈])  # 对两个 block 的输出做注意力

# 然后 Block 3 内部继续标准残差
x₉ = x₈' + Layer₉(Norm(x₈'))
x₁₀ = x₉ + Layer₁₀(Norm(x₉))
x₁₁ = x₁₀ + Layer₁₁(Norm(x₁₀))
x₁₂ = x₁₁ + Layer₁₂(Norm(x₁₁))  ← Block 3 输出（最终输出）
```

**关键点：**
- AttnRes 只在 **block 边界** 使用（3 个 block = 2 次 AttnRes 调用）
- Block 内部的 4 层之间全部是 **标准残差**（没有额外开销）
- 每个 block 开始时会"回顾"前面所有 block 的输出，动态选择聚合权重

### 实验验证

**Scaling Law 实验：**
- AttnRes 在不同模型规模下都持续超越 baseline
- Block AttnRes 能匹配用 1.25 倍计算量训练的 baseline 性能
- 验证了深度维度选择机制的有效性

**Kimi Linear 集成：**
- 模型规模：48B 总参数 / 3B 激活参数
- 预训练数据：1.4T tokens
- **性能提升跨所有评估任务**：
  - MMLU: 73.5 → 74.6 (+1.1)
  - 更均匀的输出幅度
  - 更稳定的跨层梯度分布

## 技术洞察

### 1. Attention 的普适性：从时间到深度

Transformer 用 Attention 解决了 RNN 在**时间维度**的串行计算问题。AttnRes 进一步将这一思想扩展到**深度维度**：

| 维度 | 传统方法 | Attention 方法 | 收益 |
|------|----------|----------------|------|
| 时间 | RNN 串行 | Self-Attention | 并行化、长距离依赖 |
| 深度 | 固定残差 | Attention Residuals | 动态选择、幅度控制 |

**深层联系：**
- **Self-Attention**：token 之间的动态加权（哪些词重要？）
- **AttnRes**：layer 之间的动态加权（哪些层重要？）
- **统一思想**：让模型学习"在什么情况下关注什么"，而不是硬编码

### 2. 工程实现的重要性

**全量 AttnRes 虽然理论优雅，但工程上不可行。** Block AttnRes 通过：
- 分层设计（block 内外不同策略）
- 通信优化（缓存 + 两阶段计算）

在保留 80-90% 理论收益的同时，将额外开销降至可接受水平（仅增加 ~5% 训练时间）。

**这是 AI 研究中"理论-工程"平衡的典范。**

## 与其他方案对比

| 方案 | 核心思想 | 优势 | 劣势 |
|------|---------|------|------|
| 标准残差 | 固定单位权重累加 | 简单高效 | 幅度失控、无选择性 |
| DenseNet | 显式连接所有前序层 | 信息流丰富 | 参数量爆炸 |
| Mixture of Depths | 跳过某些层计算 | 计算高效 | 信息损失 |
| **AttnRes** | **动态注意力聚合** | **内容依赖、幅度可控** | **额外计算开销** |

## 局限与展望

**当前局限：**
- Block 粒度需要手动调优（粒度 vs 开销的权衡）
- 额外 5-10% 的训练开销
- 与 MoE、Sparse Attention 等的组合尚未充分探索

**未来方向：**
- 自适应 Block 划分
- 多模态模型中的应用
- 极深网络（100+ 层）的潜力
- 利用学到的权重指导模型压缩

## 启示

1. **质疑常识**：架构中的"标准组件"（如固定残差）可能并非最优，值得重新审视
2. **工程平衡**：理论优雅的方案需要工程优化才能落地（全量 AttnRes → Block AttnRes）
3. **深度潜力**：网络深度的价值不只在"堆叠"，更在于"如何连接"

## 代码实现

官方实现已开源：[MoonshotAI/Attention-Residuals](https://github.com/MoonshotAI/Attention-Residuals)

核心伪代码：

```python
# AttnRes 核心实现
class AttentionResidual(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.query = nn.Linear(d_model, d_model)  # W_q
        self.key = nn.Linear(d_model, d_model)    # W_k
    
    def forward(self, current_layer_output, all_previous_outputs):
        """
        Args:
            current_layer_output: [batch, seq, d_model]
            all_previous_outputs: list of [batch, seq, d_model]
        
        维度说明:
            B: Batch Size (批次大小) - 一次处理多少句话
            S: Sequence Length (序列长度) - 每句话有多少个词
            D: d_model (模型隐藏维度) - 每个词用多少维向量表示
            L: Layer Count (层数) - 前面有多少层的输出
        """
        # 计算 Query 和 Keys
        q = self.query(current_layer_output)  # [B, S, D]
        
        # Q-K 内积计算注意力分数
        attn_scores = []
        for prev_output in all_previous_outputs:
            k = self.key(prev_output)
            score = (q * k).sum(dim=-1, keepdim=True)  # [B, S, 1]
            attn_scores.append(score)
        
        # Softmax 归一化
        attn_weights = torch.softmax(
            torch.cat(attn_scores, dim=-1), dim=-1
        )  # [B, S, L]
        
        # 加权聚合
        stacked_outputs = torch.stack(all_previous_outputs, dim=-1)  # [B, S, D, L]
        output = (stacked_outputs * attn_weights.unsqueeze(2)).sum(dim=-1)  # [B, S, D]
        
        return output

# Block AttnRes 实现
class TransformerBlock(nn.Module):
    def __init__(self, d_model, num_layers_per_block):
        super().__init__()
        self.layers = nn.ModuleList([
            TransformerLayer(d_model) 
            for _ in range(num_layers_per_block)
        ])
    
    def forward(self, x):
        for layer in self.layers:
            x = x + layer(nn.LayerNorm(x))  # Block 内标准残差
        return x

class BlockAttentionResidual(nn.Module):
    def __init__(self, d_model, num_blocks, layers_per_block):
        super().__init__()
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, layers_per_block)
            for _ in range(num_blocks)
        ])
        self.attn_res = AttentionResidual(d_model)
    
    def forward(self, x):
        block_outputs = []
        
        for i, block in enumerate(self.blocks):
            if i > 0:
                # Block 边界使用 AttnRes 聚合
                x = self.attn_res(x, block_outputs)
            x = block(x)  # Block 内标准残差
            block_outputs.append(x)
        
        return x
```

## 总结

**核心贡献：**
- 用 Q-K Attention 机制替代固定权重残差，实现输入依赖的层聚合
- Block AttnRes 在保留收益的同时将开销降至可接受水平
- 在 48B 参数模型上验证了跨任务的性能提升

**技术价值：**
- 缓解 PreNorm 的幅度膨胀和梯度不稳定问题
- 证明了深度维度的动态信息选择的有效性
- 为深度网络架构设计提供新视角

**一句话：** Attention 不仅能处理时间维度的序列，也能处理深度维度的层级——这是 Transformer 思想的又一次延伸。
