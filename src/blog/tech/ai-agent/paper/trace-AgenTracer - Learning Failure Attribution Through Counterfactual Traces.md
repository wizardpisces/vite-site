*论文发布时间：2025-09-03，v2 修订：2025-09-04*

**AgenTracer**（论文标题为《[AgenTracer: Who Is Inducing Failure in the LLM Agentic Systems?](https://arxiv.org/abs/2509.03312)》）研究的是：**如何训练一个模型，自动判断 Agent 系统失败时到底是谁的问题、哪一步的问题。**

它和 TraceElephant / MP-Bench 的关系可以这样理解：

```text
TraceElephant：告诉你 trace 必须记录完整 input / output / tool logs。
MP-Bench：告诉你失败归因不一定只有一个根因。
AgenTracer：尝试训练一个专门的 failure attribution 模型。
```

所以 AgenTracer 更偏方法论文，不只是 benchmark。

## 一句话结论

AgenTracer 的核心想法是：

**与其只让大模型看失败日志猜原因，不如构造“反事实 trace”，训练模型学习：如果某一步被修正后任务能成功，那么这一步就很可能是关键失败点。**

它最有价值的地方是把失败归因从“静态看日志”推进到“用反事实轨迹学习因果关系”。

## 先用一个例子说明

假设有一个 Coding Agent 系统：

```text
用户任务：
修复登录页 bug：表单无效时，提交按钮必须 disabled。

Agent 分工：
SearchAgent   找相关文件
CoderAgent    修改代码
TesterAgent   验证结果
```

失败轨迹：

```text
Step 1 - SearchAgent
输出：找到了 LoginPage.vue。
问题：漏掉 useLoginValidation.ts。

Step 2 - CoderAgent
输入：只有 LoginPage.vue。
输出：只改了按钮样式，没有改 disabled 逻辑。

Step 3 - TesterAgent
输出：现有测试通过，任务完成。

Final
按钮仍然没有 disabled。
```

现在有三个候选归因：

```text
候选 A：SearchAgent 漏文件。
候选 B：CoderAgent 改错逻辑。
候选 C：TesterAgent 验收不严格。
```

普通静态归因只能看 trace 猜：

```text
可能是 TesterAgent，因为它最后没兜底。
```

AgenTracer 的思路更接近实验：

```text
如果我把 Step 1 修正，让 SearchAgent 找到 useLoginValidation.ts，
后续任务是否更可能成功？

如果我把 Step 2 修正，让 CoderAgent 正确修改 disabled 逻辑，
后续任务是否成功？

如果我把 Step 3 修正，让 TesterAgent 要求补行为测试，
系统是否能恢复？
```

这就是 **counterfactual trace**：

```text
原始世界：Step 1 漏文件 -> Step 2 改错 -> Step 3 误判 -> 失败
反事实世界：Step 1 找全文件 -> 后续可能成功
```

如果修正某一步后任务从失败变成功，说明这一步与失败有更强因果关系。

## AgenTracer 解决了什么问题？

它解决的是 failure attribution 的训练数据问题。

过去常见做法：

```text
收集失败 trace
让人标注谁错了、哪一步错了
训练或评测模型
```

问题是：

```text
人工标注贵。
不同专家会有分歧。
单看失败 trace 很难判断因果。
```

AgenTracer 的解决方式：

```text
用 counterfactual replay 和 fault injection 自动构造大量带标签的训练数据。
```

也就是说，它不是只靠人类标注，而是主动制造和验证失败原因。

## 核心机制：从失败 trace 到训练数据

AgenTracer 可以拆成四步：

```text
1. 采集成功 / 失败 Agent 轨迹
2. 构造反事实 trace
3. 用 programmed fault injection 自动注入错误
4. 训练 AgenTracer-8B 做失败归因
```

下面用 Coding Agent 例子串起来。

## 1. Counterfactual Replay：从某一步重跑

假设原始失败轨迹是：

```text
Step 1 SearchAgent：漏掉 validation 文件
Step 2 CoderAgent：只改样式
Step 3 TesterAgent：误判完成
Final：失败
```

Counterfactual replay 做的是：

```text
选择一个候选步骤，例如 Step 1。
把 Step 1 的输出替换成更合理的输出。
从 Step 2 开始重跑后续 Agent。
观察最终是否成功。
```

例子：

```text
原 Step 1：
SearchAgent -> LoginPage.vue

反事实 Step 1：
SearchAgent -> LoginPage.vue + useLoginValidation.ts

重新运行：
CoderAgent 现在看到 validation hook。
它修改 disabled 逻辑。
TesterAgent 验证通过。
Final 成功。
```

这说明 Step 1 的错误对失败有强影响。

反过来，如果修正 Step 1 后仍然失败，说明真正问题可能在后面。

## 2. Fault Injection：主动制造可控错误

Counterfactual replay 需要知道“修正后会怎样”。但真实失败数据不够多，所以 AgenTracer 用 **programmed fault injection** 主动制造错误。

还是 Coding Agent 例子。

原本有一条成功轨迹：

```text
Step 1 SearchAgent：找到 LoginPage.vue + useLoginValidation.ts
Step 2 CoderAgent：正确修改 disabled 逻辑
Step 3 TesterAgent：新增 invalid form 测试并通过
Final：成功
```

现在故意注入错误：

```text
注入到 Step 1：
把 SearchAgent 输出改成只返回 LoginPage.vue。
```

再运行后续步骤：

```text
Step 2 CoderAgent 因为缺上下文，改错。
Step 3 TesterAgent 没发现。
Final 失败。
```

这条失败轨迹的标签天然就是：

```text
失败注入点：Step 1 / SearchAgent
失败原因：关键文件缺失
```

这比纯人工标注便宜，也更适合规模化。

## 3. TracerTraj：自动构造的大规模归因数据

AgenTracer 基于这种方法构造了 **TracerTraj** 数据集。

核心特点：

```text
由 counterfactual replay / fault injection 生成。
包含失败轨迹和对应归因标签。
用于训练专门的 failure attribution 模型。
```

和 MP-Bench 的区别：

```text
MP-Bench：
  小规模、专家标注、多视角、适合评测真实性。

TracerTraj：
  更偏自动构造、规模训练、适合训练归因模型。
```

一个简单对比：

| 数据 / 方法 | 重点 | 优点 | 缺点 |
| --- | --- | --- | --- |
| TraceElephant | full trace / replayable environment | 贴近工程调试 | 数据规模小 |
| MP-Bench | multi-perspective expert labels | 更真实地处理多根因 | 标注贵 |
| TracerTraj | counterfactual / injected failures | 可规模化训练 | 人工注入错误可能不覆盖真实失败 |

## 4. AgenTracer-8B：训练专门归因模型

论文训练了一个 **AgenTracer-8B**。

输入是失败轨迹：

```text
task instruction
agent roles
step-by-step trace
tool logs
final failure
```

输出是失败归因：

```text
responsible agent
failure step
failure reason
possible correction
```

用 Coding Agent 例子，理想输出是：

```json
{
  "failure_step": 1,
  "responsible_agent": "SearchAgent",
  "failure_reason": "SearchAgent returned only LoginPage.vue and missed useLoginValidation.ts, which contains the form validity logic.",
  "ideal_action": "Search validation-related files and provide the validation hook to CoderAgent."
}
```

如果按照 MP-Bench 的多视角范式，也可以输出多个候选：

```json
{
  "attributions": [
    {
      "step": 1,
      "agent": "SearchAgent",
      "reason": "Missed validation hook.",
      "evidence": "Only LoginPage.vue was passed to CoderAgent."
    },
    {
      "step": 3,
      "agent": "TesterAgent",
      "reason": "Accepted existing tests without checking disabled behavior.",
      "evidence": "No invalid-form behavior test was added."
    }
  ]
}
```

论文主要强调的是训练一个归因器，而不是定义多视角输出协议；但工程上建议把两者结合。

## 结果说明什么？

论文报告了几类结果：

```text
1. AgenTracer-8B 在 Who&When 上超过多个强基线。
2. 它在跨系统归因上比通用 LLM 更稳定。
3. 将归因结果反馈给 Agent 系统，可以提升后续任务成功率。
```

它声称在 MetaGPT / MaAS 等系统上，基于归因反馈能带来约 **4.8% - 14.2%** 的性能提升。

这个结果的意义不是“AgenTracer 已经解决归因问题”，而是：

```text
失败归因可以变成训练信号。
归因结果可以反过来改善 Agent 系统。
```

## 和 TraceElephant / MP-Bench 的区别

### TraceElephant vs AgenTracer

TraceElephant 的重点：

```text
完整 trace 很重要。
input_context 很重要。
可重放环境很重要。
```

AgenTracer 的重点：

```text
用 counterfactual replay 和 fault injection 生成训练数据。
训练专门的 failure attribution 模型。
```

关系：

```text
TraceElephant 更像观测标准。
AgenTracer 更像自动诊断方法。
```

### MP-Bench vs AgenTracer

MP-Bench 的重点：

```text
失败可能有多个合理归因。
评测应该用 multi-perspective ranking。
```

AgenTracer 的重点：

```text
用反事实轨迹学习归因。
```

关系：

```text
MP-Bench 改任务定义。
AgenTracer 改训练方法。
```

两者应该组合：

```text
AgenTracer 负责产生候选归因。
MP-Bench 思路负责把候选归因排序、解释、保留多个视角。
```

## 工程上怎么用？

如果你要把 AgenTracer 思路落地，不建议一上来训练 8B 模型。更现实的是先实现流程。

### 1. 先让 Agent 系统支持 replay

最低要求：

```text
每一步 trace 可序列化。
每一步 input_context 可还原。
工具调用结果可缓存。
可以从某个 step 重新执行后续流程。
```

没有 replay，AgenTracer 的核心方法用不起来。

### 2. 建一个小型 fault injection 集合

可以从常见失败开始：

```text
SearchAgent：
  删除一个关键文件
  返回过期文档
  返回相似但错误的 API

CoderAgent：
  改错文件
  只改样式不改逻辑
  忽略边界条件

TesterAgent：
  只跑已有测试
  忽略失败日志
  错误判断任务完成

Orchestrator：
  过早结束
  派错 Agent
  没有触发重试
```

每种 fault 都能自动产生标签：

```text
注入在哪里，标签就是哪里。
```

### 3. 用小模型或通用 LLM 做归因器

早期不需要训练专门模型。

可以这样做：

```text
输入：
失败 trace + fault injection 类型库 + Agent 职责说明

输出：
多个候选失败点 + reason + ideal action
```

再用 replay 验证前几个候选。

### 4. 把归因结果变成改进动作

归因输出不能停在“谁错了”。

应该进入改进闭环：

```text
SearchAgent 高频失败
=> 改检索 query expansion / 文件依赖追踪。

CoderAgent 高频失败
=> 增加 patch checklist / 要求解释行为变化。

TesterAgent 高频失败
=> 强制生成验收测试 / mutation test。

Orchestrator 高频失败
=> 改 done criteria / 加重试策略。
```

## 和 MP-Bench 组合后的推荐架构

一个比较合理的工程形态：

```text
失败 trace
  ↓
候选归因生成器（AgenTracer 思路）
  ↓
多视角聚合与排序（MP-Bench 思路）
  ↓
Top-K 候选 replay 验证
  ↓
输出调试报告
  ↓
修 prompt / 工具 / orchestration / tests
```

输出报告可以长这样：

```json
{
  "top_attributions": [
    {
      "rank": 1,
      "step": 3,
      "agent": "TesterAgent",
      "reason": "TesterAgent did not verify the disabled behavior.",
      "counterfactual_result": "When TesterAgent was prompted to require invalid-form test, the failure was detected.",
      "fix": "Strengthen verifier done criteria and require behavior-level tests."
    },
    {
      "rank": 2,
      "step": 1,
      "agent": "SearchAgent",
      "reason": "SearchAgent missed validation hook file.",
      "counterfactual_result": "When useLoginValidation.ts was included, CoderAgent generated a correct patch.",
      "fix": "Improve code search with import/dependency expansion."
    }
  ]
}
```

这比输出单个“责任 Agent”更有工程价值。

## 局限性

AgenTracer 也有明显边界：

* Fault injection 生成的是“人为错误”，不一定覆盖真实世界所有失败。
* Counterfactual replay 依赖可复现环境；很多生产 Agent 系统没有这个能力。
* 如果任务成功判定本身不可靠，反事实结果也不可靠。
* 它更偏单根因 / 可控注入范式，和 MP-Bench 的多视角真实分歧仍需结合。
* 训练专门模型成本不低，早期工程不一定划算。

## 总结

AgenTracer 的核心价值是：

**把 Agent 失败归因从“看日志猜原因”，推进到“用反事实轨迹学习原因”。**

关键点：

1. **Counterfactual replay：** 修改某一步，重跑后续，看任务是否恢复。
2. **Fault injection：** 从成功轨迹主动制造失败，自动获得归因标签。
3. **AgenTracer-8B：** 用这些反事实数据训练专门 failure attribution 模型。
4. **工程闭环：** 归因结果可以反过来改进 Agent 系统。

实践上，我更建议把它和 TraceElephant / MP-Bench 组合：

```text
TraceElephant：先把 trace 记录完整。
AgenTracer：用 replay / fault injection 验证和训练归因。
MP-Bench：保留多个合理归因，并按优先级排序。
```

一句话：

**AgenTracer 不是单纯评测 Agent 错在哪，而是尝试让系统通过“如果当时那一步没错会怎样”来学习失败因果。**

# 参考资料

- [论文原文：AgenTracer: Who Is Inducing Failure in the LLM Agentic Systems?](https://arxiv.org/abs/2509.03312)
- [PDF](https://arxiv.org/pdf/2509.03312)

*编辑：2026-05-08*
