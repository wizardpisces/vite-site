*论文提交：2026-05-07，v3 修订：2026-05-12*

**Skill1**（论文标题为《[Skill1: Unified Evolution of Skill-Augmented Agents via Reinforcement Learning](https://arxiv.org/abs/2605.06130)》）研究的是：**如何让带技能库的 LLM Agent 真正自我进化**。

一句话说，它不是只让 Agent 学会执行任务，而是同时训练三件事：

```text
从技能库里选对技能 -> 用好这个技能完成任务 -> 把新经验沉淀成更好的技能
```

论文的核心论点是：**技能选择、技能使用、技能沉淀不能拆开各自优化，它们必须用同一个任务成功信号一起进化。**

## 先用一个例子说明

假设有个 ALFWorld 家务任务：

```text
heat some plate and put it in cabinet
把盘子加热，然后放进柜子
```

环境里同时有：

```text
stoveburner
microwave
```

从人类常识看，“加热”似乎可以用炉灶。但这个环境里有个隐藏约束：

```text
plate 不能被 stoveburner 正确加热。
plate 应该用 microwave 加热。
```

这个约束不会直接写在任务描述里。普通 Agent 如果只靠当前 observation 和模型参数，很可能会走错路线：

```text
拿起 plate
-> 去 stoveburner
-> 尝试 heat
-> 失败或卡住
-> 最后耗尽步数
```

Skill1 的思路是：如果 Agent 之前做过类似任务，它的技能库里可能已经有一条经验：

```text
当任务是 heat plate 时，如果 stoveburner 不生效，优先去 microwave。
```

于是这次任务就变成：

```text
当前任务
-> 查询技能库：有没有“加热盘子并放置”的经验？
-> 检索到 microwave 相关技能
-> 选择这条技能
-> 执行：拿盘子 -> 去 microwave -> heat -> 去 cabinet -> put
-> 成功后，再总结一条更可复用的新技能
```

论文附录里的真实 case study 就是这个任务。Skill1 检索到一条来自旧任务 `heat some plate and put it in fridge` 的技能，技能里记录了 “stoveburner 可能无效，microwave 更适合加热 plate”。最后它用 6 个动作完成任务：

```text
go to countertop 1
take plate 1 from countertop 1
go to microwave 1
heat plate 1 with microwave 1
go to cabinet 1
put plate 1 in cabinet 1
```

这个例子可以把整篇论文串起来。

## 问题不只是“有没有技能库”

很多 Agent 方法已经会存经验、存 memory、存 trajectory。但 Skill1 认为，真正难的不是“存”，而是三个能力互相依赖：

```text
选错技能 -> 执行再强也容易失败
执行失败 -> 产出的轨迹质量差
轨迹质量差 -> 沉淀出来的技能也差
技能变差 -> 下次更难选对
```

所以技能库不是外挂笔记本，而是一个和策略一起训练的系统。

拿 plate 任务看：

```text
如果 selection 不行：
  Agent 检索到了 microwave 技能，但排序时没选它。

如果 utilization 不行：
  Agent 选中了 microwave 技能，但执行时还是跑去 stoveburner。

如果 distillation 不行：
  Agent 偶然成功了一次，但没有把“plate 用 microwave”沉淀成通用经验。
```

这三件事少一件，后续任务都会受影响。

## Skill1 的完整工作流

每个任务里，Skill1 让同一个 policy 依次做四段生成：

```text
1. query：生成一句检索技能库的查询
2. re-rank：对检索到的候选技能重新排序
3. action：带着选中的技能和环境交互
4. distill：根据本次轨迹提炼新技能
```

仍然用 plate 任务举例。

### 1. 生成 query

Agent 先把任务改写成检索问题：

```text
tips for heating a plate using the correct appliance before placing it in a cabinet
```

这一步很关键。query 写得差，检索到的技能就会偏。

### 2. 重新排序候选技能

技能库可能返回三条候选：

```text
Skill A：heat mug with microwave
Skill B：heat plate with microwave because stoveburner may fail
Skill C：put clean plate in cabinet
```

普通相似度检索可能觉得 A 和 C 都相关。Skill1 让 policy 再做一次 re-ranking，把真正有用的 Skill B 排到最前面。

### 3. 使用技能执行任务

选中 Skill B 后，Agent 的行动不再只是靠当前 prompt，而是被历史经验引导：

```text
任务说 heat plate。
过去经验说 stoveburner 对 plate 不可靠。
所以我应该先找 microwave。
```

于是执行轨迹变成：

```text
拿 plate -> 找 microwave -> heat plate -> 找 cabinet -> 放入
```

### 4. 提炼新技能

任务成功后，Agent 再把这次经验压缩成新技能：

```text
适用场景：
当需要加热 plate 并放到某个位置时。

策略：
优先使用 microwave，而不是 stoveburner；加热完成后再导航到目标容器并放置。
```

注意这里不是把完整 trajectory 原封不动塞进库里，而是压缩成可复用策略。否则技能库会越来越大、越来越脏，也越来越难检索。

## 关键设计：一个任务结果，拆成三种 credit

Skill1 最有意思的地方是：它没有为 selection、utilization、distillation 各自造一个独立 reward model。

它只看最终任务结果：

```text
成功：1
失败：0
```

然后把这个信号拆给三种能力。

### Utilization：直接看这次是否成功

如果 plate 任务完成了：

```text
execution reward = 1
```

如果失败：

```text
execution reward = 0
```

这部分最直观，用来训练 Agent 如何带着技能行动。

### Selection：看技能的长期趋势

选择能力不能只看单次结果。因为某条技能可能本身很好，只是这次环境状态特殊导致失败。

所以 Skill1 给每个技能维护一个 moving average utility：

```text
microwave-plate 技能：
过去很多次被选中，平均成功率 0.95

generic-heat 技能：
过去很多次被选中，平均成功率 0.62
```

re-ranking 时，如果 policy 把长期更有用的技能排前面，就应该得到奖励。

直观说：

```text
不要因为一次偶然失败否定好技能。
要学习哪些技能在长期上稳定有用。
```

论文把这称为 **low-frequency trend**，用来给 selection 分配 credit。

### Distillation：看这次经验是否超过已有技能库

技能沉淀也不能只看“这次是否成功”。因为成功轨迹可能只是重复旧经验，没必要再存一条类似技能。

Skill1 看的是当前结果相对已有技能库最好水平的增量：

```text
当前任务成功：1.0
已检索技能里最好历史 utility：0.7
variation = 1.0 - 0.7 = +0.3
```

这个正增量说明：这次经验可能提供了比旧技能更好的策略，值得鼓励 distill。

反过来：

```text
当前任务失败：0
已有最好技能 utility：0.7
variation = 0 - 0.7 = -0.7
```

这说明这次轨迹不值得沉淀成新技能。

论文把这称为 **high-frequency variation**，用来给 distillation 分配 credit。

所以 Skill1 的核心训练逻辑可以写成：

```text
任务结果本身 -> 训练怎么执行
长期平均表现 -> 训练怎么选技能
相对历史最好技能的增量 -> 训练怎么沉淀新技能
```

## 为什么这叫 co-evolution？

因为这三件事会互相带动。

```text
selection 变好
-> 更常选到高质量技能
-> utilization 更容易成功
-> 成功轨迹更多
-> distillation 能沉淀更好的技能
-> 技能库质量提升
-> selection 下次更容易选到好技能
```

这就是 Skill1 想要形成的正循环。

论文的训练动态也支持这个判断：selection precision 先提升，随后 utilization 和 distillation 一起提升。去掉 selection 或 distillation 的 credit 后，不只是对应模块变差，其他模块也会被拖慢。

## 实验结果说明了什么？

论文在两个环境上评估：

```text
ALFWorld：文字版家务任务，考验多步规划和物体交互。
WebShop：购物网站任务，考验搜索、筛选和购买决策。
```

主结果里，Skill1 在 ALFWorld 平均成功率达到 **97.5%**，超过 RetroAgent 的 **94.9%**；在 WebShop 上也拿到最高成功率。几个关键数字：

```text
ALFWorld Avg.
RetroAgent：94.9
Skill1：97.5

WebShop Succ.
RetroAgent：82.3
Skill1：82.9
```

更有说服力的是消融实验：

```text
完整 Skill1：97.5
去掉 selection：91.8
去掉 distillation：92.4
去掉整个 library：80.9
```

这说明提升不是简单来自“多塞一个技能库”，而是来自完整生命周期被统一优化。

## 和 Reflexion / Memory 类方法的区别

Reflexion 的重点是：

```text
失败后写一段自然语言反思，下次重试时读出来。
```

Memory 类方法的重点通常是：

```text
把过往经验存起来，在相似任务里检索出来。
```

Skill1 更进一步，它问的是：

```text
谁来训练“该检索什么”？
谁来训练“该信哪条技能”？
谁来训练“什么经验值得写进库”？
```

它把技能库从“被动存储”变成“RL 训练对象的一部分”。

## 这篇论文的启发

我觉得它最重要的点是：

> Agent 的长期经验不应该只是日志、记忆或 prompt 片段，而应该是能被选择、使用、更新、淘汰的策略资产。

这对工程系统很有启发。很多 Agent 系统会越跑越臃肿：

```text
trace 越存越多
reflection 越写越长
memory 越检索越杂
```

Skill1 提醒我们，关键不是“存更多”，而是：

```text
存下来的东西有没有 utility？
检索时能不能路由到正确任务？
新经验是否真的超过旧经验？
旧技能是否需要淘汰？
```

换句话说，Agent memory / skill library 的核心问题不是容量，而是治理。

## 边界和风险

这篇论文也有明显边界：

1. 实验主要在 ALFWorld 和 WebShop 这种有明确成功信号的环境里。真实办公、代码、运营场景的 reward 往往更稀疏、更难定义。
2. 技能库上限设为 5000，任务更多样以后，固定容量可能不够，需要层级索引、聚类、版本管理和淘汰策略。
3. 训练成本不低。论文里 Skill1 在 8 张 H800 上训练，单步耗时约为无技能库 GRPO 的 1.3 到 1.7 倍。
4. 自动积累技能会带来审计和安全问题。技能库如果被 prompt injection 污染，可能沉淀出危险行动序列。

所以它不是“让 Agent 自己无限学习就完事了”，而是给了一个更清晰的方向：

```text
自我进化需要技能库。
技能库需要统一训练。
统一训练还需要治理、审计和安全边界。
```

## 参考

- [Skill1: Unified Evolution of Skill-Augmented Agents via Reinforcement Learning](https://arxiv.org/abs/2605.06130)
- [论文 HTML 版本](https://arxiv.org/html/2605.06130v3)
