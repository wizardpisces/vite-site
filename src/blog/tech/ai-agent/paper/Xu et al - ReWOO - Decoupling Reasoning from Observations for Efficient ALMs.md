*论文发布时间：2023-05-24*

**ReWOO**（论文标题为《[ReWOO: Decoupling Reasoning from Observations for Efficient Augmented Language Models](https://arxiv.org/abs/2305.18323)》）解决了一个被普遍忽视的效率问题：**ReAct 等主流 Agent 范式在每一步推理时都要把完整的历史 prompt 重新发给 LLM，导致 token 消耗随推理步数二次增长。** ReWOO 通过将"推理规划"和"工具观察"彻底解耦，用 Planner-Worker-Solver 三模块架构实现了 **5 倍 token 效率提升**，同时在 HotpotQA 上准确率还提高了 4%。

## ReWOO 解决了什么问题？

**核心问题：ReAct 范式的 token 消耗随推理步数二次增长，既贵又慢。**

```
ReAct 的工作方式（交替推理-观察）:
────────────────────────────────────

第 1 轮 LLM 调用:
  输入: [Context Prompt] + [6 个 Exemplar] + [用户问题]
  输出: Thought₁ + Action₁
  → 暂停，等待工具返回 Observation₁

第 2 轮 LLM 调用:
  输入: [Context Prompt] + [6 个 Exemplar] + [用户问题]
       + Thought₁ + Action₁ + Observation₁          ← 全部重传！
  输出: Thought₂ + Action₂
  → 暂停，等待 Observation₂

第 3 轮 LLM 调用:
  输入: [Context Prompt] + [6 个 Exemplar] + [用户问题]
       + T₁ + A₁ + O₁ + T₂ + A₂ + O₂               ← 越来越长！
  输出: Thought₃ + Action₃
  ...

问题:
  • Context Prompt 和 Exemplar 每轮都要重传（OpenAI API 无状态）
  • 历史 TAO 越积越多，每轮输入越来越长
  • k 步推理的总 token 消耗 ∝ k × (Context + Exemplar) + k² × TAO
  • HotpotQA 平均 5 步推理 → 每个问题消耗 ~9800 token，约 $0.02

实际成本:
  ReAct 在 HotpotQA 上: 1000 个问题花费 $19.59
  → 这还只是一个简单的问答基准
  → 工业级 Agent 系统每天处理百万请求，成本不可承受
```

这个问题不仅是"贵"——token 超限也是一个硬约束。GPT-3.5 的上下文窗口只有 4096 token，ReAct 在复杂任务中经常因为历史太长而被截断，直接导致推理失败。

## 它是如何解决的？

ReWOO 的核心洞察：**LLM 其实不需要看到每一步的工具返回结果就能规划出完整的解题步骤。** 人类在解题时也是先列提纲、再逐步执行、最后汇总——ReWOO 把这三步拆成独立模块。

### Planner-Worker-Solver 三模块架构

```
ReWOO 的工作方式:
──────────────────

  ┌─ Planner（一次性生成完整计划）────────────────────────┐
  │                                                        │
  │  输入: [Context] + [Exemplar] + [用户问题]             │
  │  输出: 完整的蓝图，包含多步计划 + 占位符               │
  │                                                        │
  │  Plan: 搜索 Jon Raymond Polito 的信息                  │
  │  #E1 = Wikipedia[Jon Raymond Polito]                   │
  │                                                        │
  │  Plan: 找出 1989 漫画书的名字                          │
  │  #E2 = LLM[1989 漫画书叫什么？依据: #E1]              │
  │                                                        │
  │  Plan: 搜索该漫画改编电影的信息                        │
  │  #E3 = Wikipedia[#E2 电影版]                           │
  │                                                        │
  │  Plan: 找出漫画作者                                    │
  │  #E4 = LLM[谁创作了 #E2？依据: #E3]                   │
  │                                                        │
  │  注意: #E1~#E4 是占位符，此时还没有实际值              │
  │  Planner 凭"可预见推理"能力规划出完整路径              │
  └────────────────────────────────────────────────────────┘
          │
          ▼
  ┌─ Worker（按计划执行工具调用）──────────────────────────┐
  │                                                        │
  │  #E1 = Wikipedia["Jon Raymond Polito"]                 │
  │       → 返回: "...appeared in The Rocketeer..."        │
  │                                                        │
  │  #E2 = LLM["1989 漫画书叫什么？依据: {#E1的内容}"]    │
  │       → 返回: "The Rocketeer"                          │
  │                                                        │
  │  #E3 = Wikipedia["The Rocketeer film version"]         │
  │       → 返回: "...created by Dave Stevens..."          │
  │                                                        │
  │  #E4 = LLM["谁创作了 The Rocketeer？依据: {#E3}"]     │
  │       → 返回: "Dave Stevens"                           │
  │                                                        │
  │  无依赖的步骤可以并行执行                              │
  └────────────────────────────────────────────────────────┘
          │
          ▼
  ┌─ Solver（整合计划和证据，给出最终答案）────────────────┐
  │                                                        │
  │  输入: [Solver Context] + [用户问题]                   │
  │       + Plan₁ + Evidence₁                              │
  │       + Plan₂ + Evidence₂                              │
  │       + Plan₃ + Evidence₃                              │
  │       + Plan₄ + Evidence₄                              │
  │                                                        │
  │  输出: "Dave Stevens"                                  │
  └────────────────────────────────────────────────────────┘
```

### Token 消耗的数学分析

```
k 步推理的 token 消耗对比:
──────────────────────────

ReAct（交替推理-观察）:
  #Token = k×(Context + Exemplar + Question) + Σ(k-j)×(T+A+O)
         ≈ k × 固定开销 + O(k²) × 每步开销
  → 二次增长

ReWOO（计划-执行-求解）:
  #Token = 2×(Context + Question) + 1×Exemplar + Σ(Plan+Evidence)
         ≈ 2 × 固定开销 + O(k) × 每步开销
  → 线性增长

关键差异:
  ReAct: Context 和 Exemplar 重复 k 次（每轮都要重传）
  ReWOO: Context 只出现 2 次（Planner 一次，Solver 一次）
         Exemplar 只出现 1 次（只在 Planner 中使用）

  当 k 增大（任务越复杂），ReWOO 的优势越明显
```

### 效率提升的真正来源：不是并行，是"少调 LLM"

一个常见误解：ReWOO 省 token 是因为并行执行工具。**不是。** 大部分计划步骤之间有依赖关系（Plan2 用 #E1 的结果），不能并行。省 token 的核心是**减少 LLM 调用次数**：

```
ReAct: k 步推理 → 调 LLM k 次，每次重传完整历史
  LLM 调用 1: [Context + Exemplar + Q]                              → T1, A1
  LLM 调用 2: [Context + Exemplar + Q + T1+A1+O1]                  → T2, A2
  LLM 调用 3: [Context + Exemplar + Q + T1+A1+O1 + T2+A2+O2]      → T3, A3
              ↑ Context+Exemplar 每次都重传，历史越积越长

ReWOO: 只调 LLM 2 次
  Planner:  [Context + Exemplar + Q] → 完整计划（一次性）
  Worker:   按顺序执行工具调用（不调 LLM，纯工具调用，无 token 消耗）
  Solver:   [Context + Q + 所有 Plan+Evidence] → 最终答案
            ↑ Context 只发 2 次，Exemplar 只发 1 次

→ 省的是"重复发给 LLM 的冗余 prompt"
→ 并行只是附带收益（如果恰好有无依赖步骤）
```

### "可预见推理"——不看结果就规划，质量够吗？

Planner 生成的计划**确实有依赖关系**——Plan2 引用 #E1，Plan3 引用 #E2。它不是"把所有步骤独立规划"，而是"在不知道 #E1 具体内容的情况下，假设 #E1 会是某种类型的结果（比如人名），然后基于这个假设规划后续步骤"。

```
举例:
  问题: "Melanie C 的 2000 年冠军单曲的合唱者是谁，此人 2002 年车祸去世？"

  Planner 的输出（不看任何工具结果）:
    Plan1: 搜索 Melanie C → #E1
    Plan2: 从 #E1 中提取合唱者 → #E2        ← 依赖 #E1，不能并行
    Plan3: 搜索 #E2 的信息 → #E3              ← 依赖 #E2，不能并行
    Plan4: 确认 #E2 是否 2002 年车祸去世 → #E4

  Planner 不知道 #E2 具体是"Lisa Lopes"
  但它知道 #E2 "应该是一个人名"
  → 用 #E2 作为占位符传给 Plan3、Plan4 完全合理

这就是"可预见推理"(Foreseeable Reasoning):
  不依赖具体观察值，仅依赖对结果类型的合理预期来规划

合理质疑: 不看中间结果就规划，不是比看了再决定更差吗？
  理论上: 是的，自适应规划 > 盲规划
  实际上: ReWOO 准确率反而更高（42.4% vs ReAct 40.8%）

为什么？论文分析了 100 个 ReAct 失败案例:
  76/100 是"推理被带偏"——工具返回了噪声，后续推理跟着错
  18/100 是"token 超限"——历史太长被截断
  → ReAct 的"看了再决定"反而成了弱点：看到垃圾就被垃圾带偏
  → ReWOO 的"盲规划"不受工具噪声干扰，反而更稳定
```

## 实验结果

### Token 效率

```
HotpotQA（1000 题，基于 GPT-3.5-turbo）:
                  准确率    Token 总量    每千题成本
──────────────────────────────────────────────────
Direct Prompt     37.8%       55.5        $0.11
CoT               41.6%      481.9        $0.96
ReAct             40.8%    9,795.1       $19.59
ReWOO             42.4%    1,986.2        $3.97    ← 5x 省 token，准确率还更高

→ ReWOO 用 ReAct 1/5 的 token 达到了更高的准确率
→ 节省的不是微量——是 $15.62 / 千题的实打实成本差
```

### 六大基准平均表现

```
六个公开 NLP 基准的平均表现（GPT-3.5-turbo）:
──────────────────────────────────────────────────

ReWOO vs ReAct:
  • Token 消耗平均降低 64%
  • 准确率平均提高 4.4%
  • 在所有 6 个基准上 ReWOO 全面胜出

各基准详情:
                    ReAct 准确率 → ReWOO 准确率    Token 节省
HotpotQA            40.8%  →  42.4%  (+1.6%)       -80%
TriviaQA            59.4%  →  66.6%  (+7.2%)       -68%
GSM8K               62.0%  →  62.4%  (+0.4%)       -42%
StrategyQA          64.6%  →  66.6%  (+2.0%)       -24%
PhysicsQA           64.1%  →  66.0%  (+1.9%)       -43%
SportsUnderstanding 58.6%  →  61.3%  (+2.7%)       -50%
SOTUQA (curated)    64.8%  →  70.2%  (+5.4%)       -43%
```

### 工具失败时的鲁棒性

```
当所有工具返回"No evidence found"时（HotpotQA）:
──────────────────────────────────────────────────

              正常准确率 → 工具失败后准确率     下降幅度
ReAct         40.8%    →    0.0%               -40.8%  ← 完全崩溃
ReWOO         42.4%    →   13.2%               -29.2%  ← 仍有残余能力

为什么 ReWOO 更鲁棒？
  ReAct: 工具失败 → 下一步推理基于错误观察 → 陷入无限循环
         → 反复调同一个失败的工具直到 token 超限
  ReWOO: 计划已经制定好了，不受工具失败影响
         → Solver 拿到空证据后仍然可以用内置知识尝试回答
```

### 多余工具有害

```
从 2 个工具逐步增加到 7 个工具（HotpotQA）:
──────────────────────────────────────────────

工具数量:  2 → 3 → 4 → 5 → 6 → 7
准确率趋势: ↗ (Google 短暂提升) → 持续 ↓ ↓ ↓

分析 20 个失败案例:
  17/20 是工具误用（如用 Yelp 搜名人）

→ 不必要的工具是有害的——它们扩大了行动空间，增加了选错工具的概率
→ 这对当前 MCP 生态有直接启示：不是接入越多工具越好
```

### 解耦的附带收益：Planner 可以轻松蒸馏到小模型

ReWOO 的解耦设计还带来一个重要的附带收益——Planner 模块可以被独立蒸馏到小模型。这直接源于核心设计：**Planner 不接触工具返回值，所以微调数据只需要 (问题 → 计划) 对，不需要模拟工具环境。**

```
为什么这跟 ReWOO 的核心设计有关？
──────────────────────────────────

ReAct 要蒸馏到小模型:
  训练数据需要: 问题 → T1 → A1 → O1 → T2 → A2 → O2 → ... → 答案
                                   ↑        ↑
                              工具真实返回值（必须模拟或收集）
  → 要么真的搭建工具环境跑一遍，要么收集大量带工具返回值的轨迹
  → 非常复杂，且换一套工具就要重新收集

ReWOO 的 Planner 要蒸馏:
  训练数据需要: 问题 → Plan1 + #E1, Plan2 + #E2, ...
                       ↑
                  只有计划和占位符，不包含任何工具返回值
  → 用 GPT-3.5 跑一遍 Planner 就能收集数据
  → 换工具只需改工具描述，不用重新收集

实验结果:
  ① LLaMA 7B → 52k Self-Instruct 微调 → Alpaca 7B（通用能力）
  ② Alpaca 7B → 2000 条 Planner 数据微调 → Planner 7B（规划能力）

  Zero-shot 准确率对比:
                    GPT-3.5    Alpaca 7B    Planner 7B
  HotpotQA           42.4%      ~38%         ~42%     ← 7B 追平 175B
  TriviaQA           66.6%      ~62%         ~65%
  StrategyQA         66.6%      ~60%         ~64%

  → 25 倍参数缩减，性能基本持平
  → 用区区 2000 条规划数据就够了（因为数据结构简单）
```

## 还有更好的解决方案吗？

ReWOO 有一个根本性局限：**当任务需要根据环境反馈动态调整计划时，"可预见推理"失效。**

```
ReWOO 失效的场景——AlfWorld 环境探索:

  "你在房间中央，周围有 drawer 1-5, shelf 1-12, cabinet 1-4..."
  "任务: 把花瓶放进保险箱"

  → Planner 不知道花瓶在哪个抽屉/架子上
  → 必须枚举所有可能位置：打开 drawer1 → 没有 → 打开 drawer2 → ...
  → 计划步数 = 最坏情况的穷举搜索
  → 此时 ReWOO 退化为和 ReAct 一样的复杂度

本质限制:
  可预见推理 ✓: "搜 A → 从 A 中提取 B → 搜 B → 确认 C"
                 每步输出的类型是可预期的（人名、事实、数字）
  可预见推理 ✗: "打开 drawer1 → 根据里面有什么决定下一步"
                 下一步完全取决于上一步的具体内容，无法预见
```

## 冷思考：ReWOO 在 Agent 架构演化中的位置

### 1. ReAct 的效率批判者

ReWOO 最重要的贡献不是模型性能，而是**第一次正式量化了 ReAct 范式的效率问题**，并给出了数学分析（二次 vs 线性增长）。在此之前，大家关注的都是"Agent 能不能解对题"，没人认真算过"解一道题要花多少 token"。

```
Agent 架构关注点的演化:
──────────────────────

2023.03 ReAct:     "LLM 能不能交替推理和使用工具？" → 能
2023.03 Reflexion:  "失败后能不能反思改进？" → 能
2023.03 HuggingGPT: "能不能调度海量模型？" → 能
2023.05 ReWOO:      "等等，这些方案到底花了多少钱？" → 贵得离谱
                    "有没有更省的方式？" → 有，而且还更准

→ ReWOO 把"效率"正式引入 Agent 架构的评估维度
```

### 2. 与 HuggingGPT 和 Pre-Act 的关系

ReWOO 的 Planner-Worker-Solver 架构和 [HuggingGPT](./ZJU%20%26%20Microsoft%20-%20HuggingGPT%20-%20Solving%20AI%20Tasks%20with%20ChatGPT%20and%20Hugging%20Face.md) 的四阶段流水线（任务规划 → 模型选择 → 任务执行 → 响应生成）在结构上高度相似，但出发点不同：

```
HuggingGPT vs ReWOO:
────────────────────

HuggingGPT:
  目标: 让 LLM 调度跨模态专家模型
  计划和执行天然分离（因为要调不同的模型）
  没有讨论 token 效率

ReWOO:
  目标: 降低 ReAct 范式的 token 消耗
  主动将计划和执行分离（为了避免 prompt 冗余）
  token 效率是核心评估指标

Pre-Act:
  目标: 通过多步规划提升 Agent 的行动质量
  也是"先规划再执行"
  关注的是规划质量而非效率

三者在架构上趋同: 都是"先规划 → 再执行 → 最后整合"
但各自的核心关切不同: 能力边界 / 成本效率 / 规划质量
```

### 3. "多余工具有害"对 MCP 生态的警示

ReWOO 的实验发现——**增加不相关工具反而降低准确率**——对当前 MCP 生态有直接启示。

```
当前 MCP 的隐患:
────────────────

MCP 让接入工具变得极其简单
  → 开发者倾向于接入尽可能多的 MCP Server
  → "万一用得上呢"

ReWOO 的实验数据:
  2 个工具 → 7 个工具: 准确率持续下降
  17/20 失败案例是工具误用

启示:
  工具数量 ≠ 能力强度
  精确匹配任务需求的少量工具 > 大量"可能有用"的工具
  → Agent 系统需要"工具准入机制"，而不是无限扩展工具池
```

### 4. 可预见推理的自举条件

延续 [Toolformer](./Meta%20-%20Toolformer%20-%20Language%20Models%20Can%20Teach%20Themselves%20to%20Use%20Tools.md) 分析中的自举框架：

```
ReWOO 的自举前置条件:
────────────────────

前置条件: LLM 的"可预见推理"能力
  → 模型必须能在不看工具结果的情况下，预见结果的类型并规划后续步骤
  → 这本质上是一种"计划能力"，需要模型对任务结构有足够的理解

Specialization 的自举链:
  GPT-3.5 有可预见推理能力
  → 用 GPT-3.5 生成 2000 条规划数据
  → 微调 LLaMA 7B → 获得可预见推理能力
  → 7B 模型在 zero-shot 下追平 GPT-3.5

成功的关键:
  因为 Planner 模块不接触工具返回值
  → 微调数据只需要 (问题 → 计划) 对
  → 不需要模拟工具环境
  → 比蒸馏 ReAct 简单得多（ReAct 要连 TAO 一起蒸馏）
```

## 总结

ReWOO 通过将推理规划与工具观察彻底解耦，用 Planner-Worker-Solver 三模块架构把 ReAct 的二次 token 增长降为线性，在六个基准上实现了平均 **64% 的 token 节省和 4.4% 的准确率提升**。它最有价值的贡献有三个：一是**首次正式量化了 Agent 的效率问题**，把"花多少钱"引入评估体系；二是发现了**"可预见推理"这种反直觉的 LLM 能力**——不看工具结果也能做出合理规划；三是证明了**多余工具有害**，对当前"接入越多工具越好"的 MCP 生态敲响警钟。
