# 可优化的 AI Agent：用 3 个例子讲清 DSPy、TextGrad、AdalFlow 与 Trace/OPTO

很多团队第一次把 LLM 接进业务时，都会走一条熟悉的路：

1. 写一版 Prompt（“你是一个专业助手…”）
2. 线下跑几条 case，看起来不错
3. 一上线，开始“玄学翻车”：边界条件、长文本、工具失败、格式不稳

如果你经历过这种翻车，你会很自然地问出一个更本质的问题：

> 我们能不能像训练神经网络一样，让 Agent/工作流在反馈中**持续变好**，而不是靠“灵感写 Prompt”？

这正是近两年 DSPy / TextGrad / AdalFlow / Trace 这条技术支线的共同目标：把“提示词工程”升级成“**可优化系统**”。

本文不讲论文公式，只用 3 个可复制的例子，把它们各自解决什么、需要什么前置条件、什么时候该用讲清楚。

参考链接（建议收藏）：
- 微软：[`Tracing the path to self-adapting AI agents`](https://www.microsoft.com/en-us/research/blog/tracing-the-path-to-self-adapting-ai-agents/)
- DSPy 文档：[`DSPy`](https://dspy.ai/)
- TextGrad 仓库：[`zou-group/textgrad`](https://github.com/zou-group/textgrad)
- AdalFlow 仓库：[`SylphAI-Inc/AdalFlow`](https://github.com/SylphAI-Inc/AdalFlow)

---

## 1）先把“可优化”说透：优化的不是权重，而是系统参数

很多人听到“自我进化”，第一反应是“那不得微调模型吗？”  
但在绝大多数工程场景里，最便宜、最有效、也最容易回滚的优化对象其实是：

- **指令（instructions）**：系统 prompt、格式要求、边界条件、失败策略
- **示例（few-shot demos）**：高质量的输入/输出（最好还带推理过程）
- **流程（workflow）**：先检索再回答？先查 schema 再写 SQL？先规划再执行？
- **工具策略**：何时调用、怎么填参、失败怎么重试、怎么兜底

如果把 Agent 看成一个程序，那么这些就是“参数”。  
这些框架做的事，本质上都是：

> 用可重复的评估（metric/反馈）驱动参数更新，把“人肉调参”变成“系统化迭代”。

**没有评估，就没有优化。**这是全文最重要的一句话。

---

## 2）例子一：分类/抽取任务 —— DSPy 为什么像“编译器”

### 场景
你做了一个客服意图分类器：

- 输入：用户一句话（“我想取消订单”）
- 输出：一个固定标签（`cancel_order` / `refund` / `change_address` …）

你很快会发现：Prompt 里多一句话、少一个例子，准确率就能抖动 5～15%。  
于是你想做一件更“工程化”的事：**把这段 LLM 程序编译成更稳的 Prompt。**

### DSPy 的核心思路
DSPy 的主张是：不要把行为写成一大段字符串 prompt，而是写成结构化程序，然后用优化器“编译”出更好的 prompts/weights：[`DSPy`](https://dspy.ai/)。

你可以把它理解成：

- 你写的“AI 程序”是**骨架**（输入输出字段、模块链路）
- 编译器（optimizer）会在你的数据集上反复试，自动找出：
  - **更好的指令**
  - **更好的 few-shot 示例组合**

### 一个很直观的“编译前/编译后”差别

**编译前**（通常是零样本或少量样本，容易飘）：

```text
你是客服意图分类助手。请输出最合适的标签。
输入：{text}
输出：{label}
```

**编译后**（DSPy 会把“最有效的示例”和更好的指令放进去，变成稳定模板）：

```text
你是客服意图分类助手。输出必须是候选标签之一。

示例1：
输入：我不想要了，能退吗？
输出：refund

示例2：
输入：地址填错了怎么改？
输出：change_address

现在开始：
输入：{text}
输出：
```

注意：这不是“运行时动态 prompt”，而是**离线编译得到的“黄金模板”**——上线后会稳定复用。

### DSPy 的前置条件（非常硬）
DSPy 最吃的不是“天才 prompt”，而是两样东西：

- **一份覆盖真实分布的数据集**（几十到几百条就能起步）
- **一个稳定的指标/裁判**（accuracy、F1、exact match…）

如果你没有裁判，DSPy 没法知道“更好”是什么。

---

## 3）例子二：算术/推理/格式不稳 —— TextGrad 的“文本梯度”到底是什么

### 场景
你给模型一个 system prompt：  
“请一步步思考，算出有多少蔬菜。”

它却经常漏数、跳步、或者算对但过程乱。  
你当然可以“让模型自己反思再答一次”，但 TextGrad 的贡献是：把这件事变成一个**可重复、可组合的训练循环**：[`zou-group/textgrad`](https://github.com/zou-group/textgrad)。

### “文本梯度”不是微积分，是“可执行的改写建议”

在数值梯度里，梯度告诉你“参数往哪改，loss 会下降”。  
在文本世界，梯度变成了**一段非常具体的自然语言建议**，例如（TextGrad README 里就展示过这种形式）：

- “鼓励模型显式逐项相加”
- “要求最后复核总数”
- “如果发现不一致，重新计算并更正”

这段建议就是“梯度”：它告诉优化器要把 system prompt 往哪个方向改。

### 进阶例子：代码解题（Solution）优化

除了优化 Prompt，TextGrad 也可以优化**具体的答案（Solution）**。想象你要解一个数学题或写一段代码：

1.  **Forward（模型试写）**：写了一个解方程的步骤，但把公式 $b^2 - 4ac$ 写成了 $b^2 + 4ac$。
2.  **TextLoss（裁判）**：检测到最终答案错误，或者 LLM 裁判指出“判别式符号有误”。
3.  **Backward（生成梯度）**：
    > “Gradient: The solution used the wrong sign in the discriminant formula. It should be minus, not plus.”
4.  **Optimizer.step（更新答案）**：模型根据这个“梯度”修正解题过程，而不仅仅是重试。

这本质上就是**系统化的 Self-Correction**，但它把“找错（Gradient）”和“改错（Step）”解耦成了通用算子。

### 你可以把它想象成“自动 Code Review”

把 prompt 当成代码：

- **loss.backward()**：像做 code review 一样指出问题与改法（用 LLM 生成建议）
- **optimizer.step()**：按建议把 prompt 重新写一版

关键区别不是“LLM 能不能改”，而是：

> 你能否把“反馈 → 归因 → 改写”这条链路做成稳定的、可复用的流水线，并且能扩展到更复杂的系统（多变量、多步链路）。

### TextGrad 的前置条件
TextGrad 更偏“反馈驱动”，你至少需要一个能给出好坏信号的东西：

- 单测/规则校验（通过/失败）
- 任务得分（0/1 或连续分数）
- 结构校验（JSON schema 是否通过、SQL 是否可执行）

如果你只能说“我觉得更好”，那“梯度”会越来越主观，越调越玄学。

---

## 4）例子三：工具型 Agent 翻车 —— Trace/OPTO 想解决的“归因问题”

### 场景：Text-to-SQL 的“背锅侠”
做一个 Text-to-SQL Agent，链路大概是：

1. **Step A**: 读用户问题
2. **Step B**: （可选）查表结构 schema
3. **Step C**: 生成 SQL
4. **Step D**: 执行 SQL → **报错：Table not found**

翻车了。如果是传统调试，你可能会去改 Step C 的 Prompt：“请注意表名正确”。  
但真正的原因可能是 **Step B 压根没去查表**，或者查错了库。

微软 Trace/OPTO 的愿景，是把这种复合系统当成动态计算图，并基于反馈做端到端优化：[`Tracing the path to self-adapting AI agents`](https://www.microsoft.com/en-us/research/blog/tracing-the-path-to-self-adapting-ai-agents/)。

### “最小子图”调试故事

OPTO 的核心逻辑（OPTO-Prime）是做**因果切片**：

1.  **Capture Trace**：记录全过程 A->B->C->D。
2.  **Backtrack（回溯）**：收到 D 的报错，OPTO 发现 D 依赖 C，C 依赖 B。
3.  **Causal Graph（归因）**：它发现 C 写错是因为 B 没有提供正确的 Schema 信息。
4.  **Optimization（优化）**：
    - 它不会去瞎改 C 的 Prompt。
    - 它会生成一个针对 B 的优化建议：“在涉及模糊表名时，强制执行 schema 查询工具。”
    - 或者更直接地：把 B 步骤的 `tool_use_strategy` 参数更新了。

这就是**“信用分配（Credit Assignment）”**——把锅甩给真正该负责的那个参数，而不是只在报错的地方修修补补。

---

## 5）AdalFlow：为什么看起来像 DSPy？因为它更像“工程整合器”

AdalFlow 的定位非常直白：一个 PyTorch-like 的库，用来构建并自动优化 LLM 工作流（从 RAG 到 Agents）：[`SylphAI-Inc/AdalFlow`](https://github.com/SylphAI-Inc/AdalFlow)。

你觉得它像 DSPy，很正常：

- 都推崇“用代码描述行为”，而不是手写长 prompt
- 都提供“优化”能力（而不是只给编排）

它更像是把几条路线揉在一起的工程产物：你可以把它当成一个“更重、更全”的框架选项，用于快速搭建并迭代完整工作流。

---

## 6）到底实不实用？一句话：看你有没有“裁判”

这类方法是否实用，不取决于框架有多酷，而取决于你是否具备三件事：

1. **裁判（metric/verifier）**：单测、规则、执行结果、结构校验……必须能给出稳定好坏信号  
2. **样本/场景覆盖**：几十到几百条覆盖真实边界条件的案例（或可重复运行的环境）  
3. **可观测性（trace/log）**：每一步输入输出、工具参数、错误都能回放

如果这三件事齐了，收益往往非常可观；如果缺一两件，上这些框架很容易变成“更贵的玄学调参”。

---

## 7）怎么落地：一份“从零到可优化”的最小清单

如果你想把它落到自己的系统里，建议按这个顺序（越往后越花钱）：

1. **先把评估做出来**：哪怕是最粗糙的 pass/fail
2. **收集一个小而硬的 benchmark**：优先覆盖最常翻车的边界条件
3. **把链路打通可观测性**：日志要能定位到“是哪一步导致了失败”
4. **选工具路线**：
   - 有清晰标签与数据集：优先 DSPy 的编译式优化 [`DSPy`](https://dspy.ai/)
   - 有强反馈、链路长、错误多：考虑 TextGrad 这类反馈改写 [`zou-group/textgrad`](https://github.com/zou-group/textgrad)
   - 需要框架化搭建工作流：可评估 AdalFlow [`SylphAI-Inc/AdalFlow`](https://github.com/SylphAI-Inc/AdalFlow)
   - 希望做“系统级自适应”：用 Trace/OPTO 的思路设计你的图与反馈 [`Tracing the path to self-adapting AI agents`](https://www.microsoft.com/en-us/research/blog/tracing-the-path-to-self-adapting-ai-agents/)
5. **最后再考虑微调**：当你确认“系统参数优化”已经把工程水分挤干净，而能力瓶颈仍在模型本体时，再走权重更新（SFT/RL）。

### 一张“快速选型表”

| 你的现状 | 更像哪条路线 | 你需要先补的东西 |
| --- | --- | --- |
| 有明确标签/标准答案（分类、抽取、QA） | DSPy | 训练集 + 稳定指标（accuracy/F1/EM） |
| 没有标签，但有强反馈（单测/可执行性/结构校验） | TextGrad | 裁判函数（pass/fail 或得分）+ 可回放日志 |
| 想快速搭建并迭代完整工作流（RAG/Agent/工具链） | AdalFlow | 先定义评估，再用框架把链路工程化 |
| 链路很长，失败点很多，最痛是“到底该改哪里” | Trace/OPTO（思路） | 把系统拆成图 + 把反馈能归因到上游参数 |

---

## 8）结语：从“写 Prompt”到“写评估”

这些框架共同指向一个现实：  
在 Agent 时代，最稀缺的不是 prompt 灵感，而是**可验证性**。

当你能用测试、指标、规则、反馈把“好”定义清楚，优化就会从玄学变工程；  
当你只能凭感觉说“更像人”“更自然”，所谓“自动优化”就很难稳定收敛。

换句话说：真正的技术门槛不是“Prompt 工程”，而是**评估工程**。
