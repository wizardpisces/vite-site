这篇论文讲的是一个反直觉观点：

**大模型生成下一个 token 时，不一定应该永远用最后一层的输出。**

论文题目是 **“Deeper is Not Always Better: Mitigating the Alignment Tax via Confident Layer Decoding”**。它的核心问题是：标准 LLM 解码默认从最后一层拿 logits，但作者发现，在复杂推理任务里，最后几层有时会把中间层已经形成的好答案“扰动”掉。来源：[arXiv 原文](https://arxiv.org/html/2606.21906v1)。

用一个例子串起来。

假设模型在解一道物理题：

> A planet has mass M and radius R. What determines the surface gravity?

合理的关键 token 应该沿着物理语义走，比如：

```text
mass, radius, gravitational, proportional, inverse-square
```

模型内部生成每个 token 时，会经过很多层。论文把这个过程概括成三段：

1. **Guess 猜测阶段**  
   前几层先形成粗糙预测，可能只是知道“这是物理题”。

2. **Refine 精炼阶段**  
   中间层逐渐抓到真正语义：这里要讲质量、半径、引力公式。  
   在某个中间偏后的层，模型对下一个 token 可能已经非常确定，比如强烈倾向输出 `radius`。

3. **Perturb 扰动阶段**  
   最后几层受 instruction tuning / RLHF / DPO 这类对齐训练影响，可能把分布往更安全、更普通、更像助手语气的 token 拉。  
   于是本来很具体的 `radius`、`mass`，可能被拉向 `the`、`is`、`.`、`therefore` 这类高频、通用、顺滑但信息量低的 token。

这就是论文说的 **alignment tax，对齐税**：

**对齐训练让模型更听话、更安全、更像助手，但在高难推理时，最后层的“助手化/安全化/通用化”倾向可能会伤害已经形成的推理轨迹。**

所以作者提出 **Confident Decoding**。

它不是重新训练模型，也不是砍掉后几层。模型仍然完整跑完所有层。区别只在于：  
标准解码永远从最后一层拿 token；Confident Decoding 会在靠近最后的若干层里，找一个“模型最自信”的层来拿 token。

怎么判断“最自信”？看 entropy，熵。

简单说：

```text
熵高 = 分布很散 = 模型不确定
熵低 = 分布很尖 = 模型很确定
```

如果从最后一层往前看，发现某个中间层的熵最低，像一个“谷底”，说明模型在这里已经形成了很明确的预测。论文叫它 **entropy valley**。

所以 Confident Decoding 的逻辑是：

```text
如果最后层继续降低熵：
  用最后层，说明最后层还在正常 refine

如果最后层反而让熵升高：
  回退到前面的 entropy valley，避开最后层扰动
```

再回到物理题例子。

某一步生成时，各层可能是这样：

```text
第 35 层：radius 概率 0.42，熵较低
第 36 层：radius 概率 0.55，熵更低
第 37 层：radius 概率 0.62，熵最低
第 38 层：the 概率上升，radius 下降，熵变高
第 39 层：is / the / . 这些通用 token 更强
第 40 层：标准解码输出 the
```

标准解码会拿第 40 层，可能输出一个更顺滑但更泛的词。  
Confident Decoding 会发现第 37 层是熵谷，于是从第 37 层输出 `radius`。

论文的实验结果支持这个方向。比如在 Qwen3.5-35B-A3B 上，Confident Decoding 相比最后层 greedy decoding：

```text
GPQA-Diamond: 76.3 -> 82.8
HLE:          9.2  -> 11.2
LiveCodeBench:70.1 -> 74.4
Omni-MATH:    72.3 -> 73.0
```

作者还比较了 base model 和 instruct model。结果是：Confident Decoding 对 instruct model 的提升更大，平均提升约 `+2.6`，而 base model 平均约 `+1.1`。这被作者用来支持一个判断：**问题确实和后训练对齐有关，而不只是模型架构本身的问题。**

它还有一个工程点：  
Confident Decoding 不跳过 transformer 层，所以 KV cache、attention、MoE routing 这些仍然照常工作。它只是多算几个靠近最后层的 logits 和 entropy。论文称在 vLLM 实现里，额外延迟低于 `2%`，额外 KV-cache 内存为 `0`。

**核心启发**

这篇论文最重要的启发是：

**“更深”不等于“更好”。最后层不一定是模型内部语义最好的位置。**

过去我们默认：

```text
层数越深 -> 表示越成熟 -> 最后一层最好
```

这篇文章挑战这个默认假设。它说，在对齐后的模型里，最后层有两种作用：

1. 对普通对话和安全任务，它是 guardrail，帮助模型更稳、更安全。
2. 对复杂数学、科学、代码推理，它可能变成 tax，把具体推理 token 拉向通用、安全、顺滑的输出。

所以它的核心思想可以压缩成一句话：

**生成 token 时，不要盲信最后一层；应该按 token 动态选择“模型最有把握、但还没被最后层对齐偏置扰动”的层。**

这也给后续模型设计一个很大的启发：  
alignment 不一定应该直接压在整个 residual stream 的最后阶段上。未来可能需要把“推理能力”和“对齐风格/安全控制”解耦，否则模型可能在内部已经想对了，但最后输出时被对齐层改歪。