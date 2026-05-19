*论文发布时间：2026-03-26*

这篇论文的全名是《[Rethinking Failure Attribution in Multi-Agent Systems: A Multi-Perspective Benchmark and Evaluation](https://arxiv.org/abs/2603.25001)》。

## 一句话结论

这篇论文反驳了一个隐含假设：

**多 Agent 系统失败时，不一定只有一个唯一根因。**

过去很多 failure attribution benchmark 会要求模型预测一个标准答案：

```text
失败步骤 = Step 4
责任 Agent = TesterAgent
```

Rethinking 认为这不符合真实调试。真实多 Agent 失败经常有多个合理解释：

```text
SearchAgent 漏找关键文件，是一个合理归因。
CoderAgent 没主动检查相关逻辑，是一个合理归因。
TesterAgent 没发现 patch 没修好，也是一个合理归因。
```

所以失败归因不应该是“单选题”，而应该是：

```text
给出多个可能失败点
每个失败点给理由
按共识度 / 优先级排序
```

## 用一个例子理解

假设有一个 Coding Agent 系统：

```text
用户任务：
修复登录页 bug：表单无效时，提交按钮必须 disabled。

Agent 分工：
PlannerAgent  拆任务
SearchAgent   找相关文件
CoderAgent    修改代码
TesterAgent   验证修复是否正确
```

执行轨迹：

```text
Step 1 - PlannerAgent
输出：需要检查登录表单和校验逻辑。

Step 2 - SearchAgent
输出：找到了 LoginPage.vue。
问题：漏掉了 useLoginValidation.ts。

Step 3 - CoderAgent
输入：只看到 LoginPage.vue。
输出：只改了按钮 CSS，没有改 disabled 逻辑。

Step 4 - TesterAgent
输入：任务要求 + diff + 现有测试结果。
输出：测试通过，任务完成。

Final
按钮仍然没有在表单无效时 disabled。
```

如果你用传统单根因思路，可能只能选一个：

```text
标准答案：Step 4 / TesterAgent
```

理由是：TesterAgent 最后有机会发现问题，但它误判完成。

但 Rethinking 说，这种标注方式太硬了。因为其他视角也成立。

## 三种合理归因视角

### 视角 1：SearchAgent 是根因

```text
失败点：
Step 2 - SearchAgent

理由：
SearchAgent 本该找登录表单相关的校验逻辑，但只找到了 UI 组件，漏掉了 useLoginValidation.ts。

理想动作：
它应该继续搜索 validation、disabled、submit、form invalid 等关键词，返回完整相关文件集。
```

这个视角关注的是 **信息检索责任**。

如果 SearchAgent 一开始就找全文件，后面的 CoderAgent 可能不会改错位置。

### 视角 2：CoderAgent 是根因

```text
失败点：
Step 3 - CoderAgent

理由：
CoderAgent 看到任务是 disabled 行为，却只改了 CSS。它应该意识到“视觉样式变化”和“disabled 交互逻辑”不是一回事。

理想动作：
它应该检查按钮 disabled prop、form validity state、submit handler，而不是只修改 class。
```

这个视角关注的是 **实现责任**。

即使 SearchAgent 给的信息不完整，CoderAgent 也可以主动要求更多上下文，或者从组件代码里追踪 validation hook。

### 视角 3：TesterAgent 是根因

```text
失败点：
Step 4 - TesterAgent

理由：
TesterAgent 的职责是验证是否真的修复用户问题。现有测试通过不代表 disabled 行为正确。它应该发现没有新增行为测试，也没有验证无效表单状态。

理想动作：
它应该要求增加测试：form invalid 时 button.disabled === true。
```

这个视角关注的是 **验收责任**。

前面步骤有错，但在 Step 4 仍可恢复。TesterAgent 没有兜底，失败才进入最终输出。

## 论文真正想改的是什么？

它想把 failure attribution 从这个形式：

```text
输入：失败 trace
输出：唯一失败步骤
```

改成这个形式：

```text
输入：失败 trace
输出：
[
  {step: 2, reason: "SearchAgent 漏找关键文件", ideal_action: "..."},
  {step: 3, reason: "CoderAgent 没改核心逻辑", ideal_action: "..."},
  {step: 4, reason: "TesterAgent 没验证行为", ideal_action: "..."}
]
```

也就是从 **deterministic failure attribution** 变成 **multi-perspective failure attribution**。

## 为什么这很重要？

因为真实工程调试不是判卷。

如果你只允许一个标准答案，会有两个问题。

### 问题 1：合理答案会被误判

假设 benchmark 标准答案是：

```text
Step 4 - TesterAgent
```

模型预测：

```text
Step 2 - SearchAgent
```

传统评测会直接判错。

但在真实工程里，SearchAgent 确实有问题。这个预测不是胡说，它只是站在“信息检索链路”的视角归因。

### 问题 2：调试建议变窄

单根因会诱导你只修一个点：

```text
只加强 TesterAgent。
```

但真实改进可能需要三件事：

```text
SearchAgent：改检索策略，找完整相关文件。
CoderAgent：改实现检查清单，区分样式和行为。
TesterAgent：增加行为验收测试。
```

多视角归因更适合指导系统改进。

## 论文怎么证明这个观点？

论文构造了 MP-Bench，让多个专家独立标注同一条失败轨迹。

关键发现：

```text
只有 16.2% 的 failure-inducing steps 被 3 个标注者一致标为失败。
27.8% 被 2 个标注者标为失败。
56.1% 只被 1 个标注者标为失败。
标注者之间 disagreement 可接近 60%。
```

这说明：失败归因确实高度依赖视角。

这个 disagreement 不一定是噪声。它可能代表不同专家对“正确执行路径”的不同假设。

## MP-Bench 是怎么构造的？

MP-Bench 是这篇论文为了支持 multi-perspective failure attribution 构造的数据集和评测协议。

它的核心不是“更多数据”，而是“更接近真实调试的数据”。

论文构造了：

```text
289 条 execution logs
121 个不同 MAS configurations
3 个专家标注者
每条 trace 都有多视角标注
```

这里要分清两类“来源”：

```text
任务来源 = 用什么题目来考 Agent 系统
Agent 系统来源 = 用什么多 Agent 框架去解这些题
execution log = Agent 系统解题时产生的完整过程记录
```

论文的数据生成链路是：

```text
GAIA / AssistantBench 里的任务
  ↓
交给 MAgenticOne / CaptainAgent 这两类多 Agent 系统去执行
  ↓
系统执行过程中产生 step-by-step execution logs
  ↓
挑出失败的 logs
  ↓
让 3 个专家标注哪些 step 诱发失败、为什么、理想动作是什么
```

具体来说：

| 名称 | 类型 | 在这篇论文里的作用 |
| --- | --- | --- |
| **GAIA** | Agent 能力评测任务集 | 提供复杂问题，让 Agent 系统去解 |
| **AssistantBench** | Web/信息检索型助手任务集 | 提供需要查资料、综合信息的任务 |
| **MAgenticOne** | 手工设计的多 Agent 系统 | 固定角色和协作结构，用来跑任务 |
| **CaptainAgent** | 自动组队 / 自动生成的多 Agent 系统 | 根据任务动态生成 Agent 团队，用来跑任务 |

可以把它类比成软件测试：

```text
GAIA / AssistantBench = 测试用例
MAgenticOne / CaptainAgent = 被测系统
execution log = 测试运行日志
MP-Bench = 从失败运行日志里整理出的调试数据集
```

所以 `289 条 execution logs` 的意思不是论文手写了 289 个案例，而是：

```text
用 121 种不同 MAS 配置去跑 GAIA / AssistantBench 任务，
最终收集到 289 条多 Agent 执行过程日志。
```

每条 log 大致长这样：

```text
Task:
回答某个需要搜索、推理或工具使用的问题。

Step 1 - PlannerAgent:
拆解任务。

Step 2 - SearchAgent:
搜索资料。

Step 3 - WorkerAgent:
基于资料生成答案。

Step 4 - VerifierAgent:
检查答案。

Final:
答案错误 / 任务失败。
```

然后专家才会看这些失败日志，标注：

```text
哪个 step 可能诱发失败？
为什么？
这个 step 理想情况下应该怎么做？
```

数据规模不算大，但它的标注方式更贴近真实失败归因。

对比一下：

```text
MP-Bench: 289 条，专家标注，多视角
TracerTraj: 2500 条，自动标注，单视角
Aegis: 9500 条，自动标注，单视角
Who&When: 184 条，专家标注，单视角
```

MP-Bench 的定位是：规模小一些，但更适合研究真实 MAS 调试里的归因歧义。

## MP-Bench 标注什么？

每个专家看完整 execution log，对每一步标三类信息：

```text
1. Failure-inducing Step
   这一步是否诱发失败？

2. Failure Reason
   为什么这一步有问题？

3. Ideal Action
   这一步本来应该怎么做？
```

放回 Coding Agent 例子：

```text
Step 2 - SearchAgent
Failure-inducing: yes
Failure Reason:
  It returned only LoginPage.vue and missed useLoginValidation.ts,
  which contains the form validity logic.
Ideal Action:
  Search validation hooks and disabled submit logic before handing context to CoderAgent.
```

再看 Step 4：

```text
Step 4 - TesterAgent
Failure-inducing: yes
Failure Reason:
  It treated existing tests as sufficient, but no test checked disabled behavior.
Ideal Action:
  Add or request a test for invalid form state and button.disabled.
```

`Ideal Action` 很关键。它让 benchmark 不只是“定位错误”，还提供“应该怎么修”。

## 多个专家标注怎么合并？

MP-Bench 不把专家分歧当噪声丢掉，而是计算共识率。

假设三个专家标注结果是：

```text
专家 A：Step 2, Step 4
专家 B：Step 3, Step 4
专家 C：Step 4
```

合并结果：

```text
Step 4: 3/3 = 100% consensus
Step 2: 1/3 = 33% consensus
Step 3: 1/3 = 33% consensus
```

最终排序：

```text
Rank 1: Step 4
Rank 2: Step 2
Rank 3: Step 3
```

这对工程调试很自然：

```text
100% 共识：优先修。
66% 共识：高概率问题，继续检查。
33% 共识：某个视角下成立，作为补充线索。
```

## MP-Bench 怎么评测模型？

它不用普通 accuracy，而用 ranking evaluation。

流程：

```text
1. 给 LLM 一条失败 trace。
2. 让 LLM 输出多个 failure-inducing steps、reason、ideal action。
3. 多次采样，得到多组归因。
4. 合并模型输出，按出现频率生成 predicted ranking。
5. 和专家 ranking 比较。
```

核心指标是：

```text
nDCG@K
```

可以理解为：

```text
模型有没有把专家高度共识的失败步骤排在前面？
```

比如专家排序：

```text
Rank 1: Step 4
Rank 2: Step 2
Rank 3: Step 3
```

模型输出：

```text
Rank 1: Step 4
Rank 2: Step 3
Rank 3: Step 2
```

这不算完全错，因为它找到了多个合理点；但 Step 2 / Step 3 顺序和专家共识不一致，所以分数会受影响。

这比 accuracy 更适合多视角归因。

## Reasoning 怎么评估？

MP-Bench 还评估模型给出的理由和理想动作。

它用 LLM-as-a-Judge 比较：

```text
模型 failure reason 是否和专家 reason 一致？
模型 ideal action 是否合理？
理由是否基于 execution context？
解释是否充分？
```

评分维度包括：

```text
consistency with human judgments
grounding in execution context
explanatory adequacy
reasonableness of proposed actions
```

这点对工程很重要。

因为一个归因如果没有理由，实际没法用：

```text
差：
Step 4 错了。

好：
Step 4 错了，因为 TesterAgent 只看了现有测试通过，
但没有验证用户要求的 disabled 行为。
理想动作是补充 invalid form state 的行为测试。
```

## 实验结论

论文比较了多个模型：

```text
GPT-4.1
GPT-5.1
o3-mini
GPT-oss-120B
Claude-Sonnet-4.5
Qwen3-8B
```

主要发现有三个。

### 1. LLM 在多视角评测下并不差

过去 Who&When 这类单根因 benchmark 得出的结论是：

```text
LLM 做 step-level failure attribution 接近随机。
```

MP-Bench 的结论不同：

```text
如果允许多视角、多次采样、ranking evaluation，
LLM 能找出不少和专家一致的归因。
```

这说明过去的低分可能部分来自评测设定不合理，而不是模型完全不会归因。

### 2. 高温采样有帮助

论文发现 temperature = 0 的确定性输出通常更差。

原因直接：

```text
多视角任务需要多种解释。
完全确定性 decoding 会压缩输出多样性。
```

实践建议：

```text
不要只跑一次 deterministic attribution。
用 moderate temperature 多采样几次，再聚合。
```

### 3. 多模型组合更好

论文发现，组合不同模型家族通常比单一模型多采样更强。

原因：

```text
同一个模型多采样：主要提供随机变化。
不同模型组合：提供不同 reasoning bias。
```

实践建议：

```text
用 Claude / GPT / 开源模型分别给归因。
合并相同失败点。
按共识和证据排序。
```

## 和 TraceElephant 的区别

TraceElephant 强调：

```text
要看完整 trace。
要记录 input_context。
最好能 replay。
```

Rethinking 强调：

```text
即使 trace 完整，失败归因也可能不是唯一答案。
```

两者关系：

```text
TraceElephant 解决“看不全，所以归因难”。
Rethinking 解决“即使看全了，也可能有多个合理归因”。
```

这两个观点不冲突，应该组合使用。

## 工程上怎么用？

如果你在做 Agent 系统调试，不要让归因器只输出一个责任点。

更合理的输出格式是：

```json
{
  "failure_attributions": [
    {
      "rank": 1,
      "step": 4,
      "agent": "TesterAgent",
      "reason": "TesterAgent treated existing tests as sufficient, but did not verify disabled behavior.",
      "ideal_action": "Add or run a behavior test for invalid form state.",
      "fix_area": "validation / testing"
    },
    {
      "rank": 2,
      "step": 2,
      "agent": "SearchAgent",
      "reason": "SearchAgent returned only UI component and missed validation hook.",
      "ideal_action": "Search for validation state and submit disabled logic.",
      "fix_area": "retrieval"
    },
    {
      "rank": 3,
      "step": 3,
      "agent": "CoderAgent",
      "reason": "CoderAgent changed visual style instead of disabled logic.",
      "ideal_action": "Trace form validity state and bind it to button disabled prop.",
      "fix_area": "implementation"
    }
  ]
}
```

注意这里的目标不是找“唯一正确答案”，而是输出一组可行动的修复方向。

## 实践建议

### 1. 不要做单选归因

不要这样：

```text
责任 Agent：TesterAgent
```

要这样：

```text
高优先级：TesterAgent 漏验收
中优先级：SearchAgent 漏文件
中优先级：CoderAgent 没追踪逻辑
```

### 2. 归因要带 ideal action

失败归因没有修复建议，工程价值很低。

每个归因都应该包含：

```text
失败点
失败理由
理想动作
建议修复模块
```

### 3. 多模型/多采样有价值

论文发现，不同模型或同一模型多次采样会产生不同归因视角。这个现象在单根因 benchmark 里会被看作“不稳定”，但在多视角范式里是有用信号。

实践上可以这样做：

```text
Claude 生成一组归因
GPT 生成一组归因
本地模型生成一组归因
合并同类项
按出现频率和证据强度排序
```

### 4. 排序比分类更实用

真实调试需要的是优先级：

```text
先修哪个？
哪个最有共识？
哪个修复成本最低？
哪个风险最大？
```

所以评估也应该更像 ranking，而不是 single-label classification。

### 5. 可以直接借鉴 MP-Bench 的报告格式

如果要落地到自己的 Agent 系统，建议输出调试报告，而不是输出单个标签：

```text
高优先级问题：
Step 4 TesterAgent 漏验收。
证据：diff 未改 disabled 逻辑，测试未覆盖 invalid form。
建议：增强 verifier prompt，要求生成行为测试。

次优先级问题：
Step 2 SearchAgent 漏文件。
证据：trace 中没有 useLoginValidation.ts。
建议：改检索策略，要求追踪 hook / import / state。
```

这就是 MP-Bench 思路的工程化版本。

## 局限性

这篇论文也有边界：

* MP-Bench 只有 289 条 execution logs，规模不大。
* 数据主要来自 GAIA / AssistantBench，软件工程类任务覆盖不够。
* 多视角归因提升了真实性，但也增加了评估复杂度。
* LLM-as-a-Judge 参与 reasoning 评估，仍然有 judge bias 风险。
* 论文更像 benchmark / evaluation 研究，不是可直接部署的归因工具。

## 总结

Rethinking 的核心价值是纠正了 failure attribution 的任务定义。

它告诉我们：

```text
多 Agent 失败不是总能归结到一个唯一错误步骤。
同一条失败轨迹可以有多个合理归因视角。
归因系统应该输出多个失败点、理由和理想动作。
调试时应该按优先级处理，而不是追求唯一标准答案。
```

一句话：

**Agent 失败归因不应该是“找一个罪魁祸首”，而应该是“找出一组可行动的失败解释”。**

# 参考资料

- [论文原文：Rethinking Failure Attribution in Multi-Agent Systems: A Multi-Perspective Benchmark and Evaluation](https://arxiv.org/abs/2603.25001)
- [PDF](https://arxiv.org/pdf/2603.25001)
- [官方代码与数据：yeonjun-in/MP-Bench](https://github.com/yeonjun-in/MP-Bench)

*编辑：2026-05-08*
