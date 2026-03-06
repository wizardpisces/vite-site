*论文发布时间：2023-05-25*

NVIDIA、Caltech、UT Austin 和 Stanford 联合发布的 **VOYAGER**（论文标题为《[Voyager: An Open-Ended Embodied Agent with Large Language Models](https://arxiv.org/abs/2305.16291)》）是 LLM 驱动的 **Embodied Agent（具身智能体）** 领域的标杆性工作。
简单来说，这篇论文让 GPT-4 在 Minecraft 中**自主探索、自主学技能、自主积累知识库**——不需要人类干预，不需要梯度训练，不需要奖励函数，Agent 凭借"好奇心"驱动，持续发现新物品、解锁科技树、穿越多种地形，并把学到的技能存入一个**不断增长的代码库**，供未来复用。

![Figure 1: VOYAGER 在 Minecraft 中持续发现新物品和技能，显著超越所有基线方法。X 轴为 Prompt 迭代次数，VOYAGER 在 160 次迭代中发现 63 种独特物品，是对手的 3.3 倍。](https://arxiv.org/html/2305.16291v2/x1.png)

## VOYAGER 解决了什么问题？

**核心问题：现有的 LLM Agent 无法"终身学习"——它们不会积累技能，也不会自主探索。**

在 VOYAGER 之前，LLM 驱动的 Agent（如 ReAct、Reflexion、AutoGPT）虽然能完成指定任务，但有一个根本缺陷：

```
现有 Agent 的困境：
────────────────────

ReAct / Reflexion:
  → 给定任务 → 推理+行动 → 完成/失败 → 结束
  → 不会主动提出下一个任务
  → 每次任务都从零开始，不积累经验

AutoGPT:
  → 给定高层目标 → 分解子任务 → 逐个执行
  → 有任务分解能力，但没有技能积累
  → 不会把成功经验存下来供未来复用

共同问题：
  ✗ 无自动课程——不知道"接下来该学什么"
  ✗ 无技能库——学过的东西不保存，下次还得从头来
  ✗ 无自我验证——不知道自己是否真的完成了任务
```

以 Minecraft 为例：一个好的玩家应该像人类一样——先学砍木头、做工作台，再学采矿、炼铁，最后挑战挖钻石。每个技能都是在之前技能的基础上复合而来的。但现有 Agent 要么无法自主设定学习目标，要么无法把学到的技能存起来复用。

## 这个问题真实存在吗？

**真实存在，且是 Agent 从"工具"走向"自主智能体"的核心挑战。**

*   **Minecraft 是完美的测试床：** 不像国际象棋或 Atari 有固定目标和奖励，Minecraft 是**完全开放**的——没有终点、没有固定剧情、程序化生成的无限世界。这要求 Agent 自己决定"该干啥"和"怎么干"。
*   **终身学习是 AGI 的基石：** 如果一个 Agent 每次任务都从零开始、不能复用之前的经验，那它永远只是一个"一次性脚本执行器"。真正的智能体需要**持续进化**。
*   **RL 已经触顶：** DreamerV3 和 VPT 在 Minecraft 中取得了不错的成绩，但它们需要海量训练数据、精心设计的奖励函数，而且学到的策略很难迁移到新环境。

## 为什么现在才有人去解决？

1.  **GPT-4 的代码生成能力达到临界点：** 论文的消融实验显示，GPT-3.5 的代码生成质量远不如 GPT-4（发现物品数相差 5.7 倍）。用代码作为行动空间是 VOYAGER 的核心设计，而这依赖于 GPT-4 级别的编程能力。
2.  **"代码即行动"范式的成熟：** Code as Policies、ProgPrompt 等前序工作证明了代码可以作为比低级动作更好的行动空间——代码天然具有**可组合性**（函数调用函数）、**可解释性**（人类可读）和**时间扩展性**（一个函数可以包含多步操作）。
3.  **开放世界环境框架（MineDojo）的可用性：** 有了 MineDojo 和 Mineflayer API，Agent 可以通过 JavaScript 代码控制 Minecraft 角色，不再需要处理像素级视觉输入。

## 它是如何解决的？

VOYAGER 的核心是三个协同工作的模块：**自动课程（Automatic Curriculum）→ 技能库（Skill Library）→ 迭代提示机制（Iterative Prompting Mechanism）**。

![Figure 2: VOYAGER 三大核心组件——自动课程负责提出探索目标，技能库负责存储和检索可复用的代码技能，迭代提示机制通过环境反馈、执行错误和自我验证持续改进代码。](https://arxiv.org/html/2305.16291v2/x2.png)

### 1. 自动课程（Automatic Curriculum）——"接下来该学什么？"

不同于给 Agent 一个固定目标（"去挖钻石"），VOYAGER 让 GPT-4 根据当前状态**自主生成下一个任务**。

![Figure 3: 自动课程的任务提议。GPT-4 根据 Agent 当前的背包、位置、生物群系、已完成/失败的任务等信息，自底向上地提出适合当前能力水平的下一个任务。](https://arxiv.org/html/2305.16291v2/x3.png)

```
自动课程的工作方式：
────────────────────

输入给 GPT-4 的信息：
  • 当前背包: {'cobblestone': 4, 'stone_pickaxe': 1, 'coal': 1, ...}
  • 当前装备: 石镐
  • 附近方块: dirt, water, iron_ore, stone
  • 生物群系: plains
  • 已完成任务: ["砍树", "做工作台", "做木镐", "做石镐", "采煤"]
  • 已失败任务: ["做铁镐"]（之前铁矿不够）

指令核心: "我的终极目标是发现尽可能多样化的东西"

GPT-4 的推理 → 输出:
  "你已经有了石镐和煤，附近有铁矿。下一个任务应该是采集铁矿。"
  Task: "Mine 3 iron_ore"
```

**渐进式信息暴露：** 为了让 Agent 从基础技能开始，论文设计了一个 warm-up schedule——前几个任务只暴露核心背包信息，随着完成任务数增加，逐步加入生物群系、生命值、附近实体等更丰富的上下文。

### 2. 技能库（Skill Library）——"把学到的东西存起来"

这是 VOYAGER 最具开创性的设计。每当 Agent 成功完成一个任务，生成的代码就被存入技能库，以**函数描述的 Embedding 向量**为索引。

![Figure 4: 技能库的存储和检索。上：新技能通过描述的 Embedding 向量索引后存入向量数据库。下：面对新任务时，系统检索最相关的 Top-5 技能作为上下文，供 GPT-4 参考和组合。](https://voyager.minedojo.org/assets/images/skill_library.png)

```
技能库的运作：
────────────────

存储（任务成功后）：
  craftStoneShovel()    → embedding("用石头和木棍制作石铲") → 存入向量DB
  combatZombieWithSword() → embedding("用剑战斗僵尸") → 存入向量DB
  smeltRawIron()        → embedding("用炉子冶炼铁矿石") → 存入向量DB

检索（面对新任务时）：
  新任务: "Craft an iron pickaxe"
  → GPT-3.5 生成建议: "需要铁锭和木棍，先冶炼铁矿"
  → 查询向量DB → 返回 Top-5 相关技能:
    1. smeltRawIron()
    2. craftStoneShovel()   (结构相似)
    3. mineIronOre()
    4. craftCraftingTable()
    5. craftSticks()
  → 这些技能作为 in-context examples 注入 GPT-4 的 prompt

关键优势：
  ✓ 复合性: craftIronPickaxe() 内部调用 smeltRawIron() 和 craftSticks()
  ✓ 可解释性: 每个技能都是人类可读的 JavaScript 函数
  ✓ 抗遗忘: 技能永远不会丢失（对比 RL 的灾难性遗忘）
  ✓ 可迁移: 在新世界中可以直接复用已有技能库
```

### 3. 迭代提示机制（Iterative Prompting）——"代码不对就改，改到对为止"

LLM 生成的代码不可能一次就对。VOYAGER 通过三类反馈信号**迭代优化**代码：

```
迭代提示的三类反馈：
────────────────────

① 环境反馈（Environment Feedback）
  代码执行后的游戏状态变化
  例: "I cannot make an iron chestplate because I need: 7 more iron ingots"
  → GPT-4 意识到铁锭不够，先去采更多铁矿

② 执行错误（Execution Errors）
  JavaScript 解释器的报错信息
  例: "acacia_axe is not a valid item"
  → GPT-4 发现没有 acacia_axe 这个物品，改成 wooden_axe

③ 自我验证（Self-Verification）
  用另一个 GPT-4 实例检查任务是否真正完成
  例: 任务是 "Mine 3 wood logs"
       背包有 {'oak_log': 2, 'spruce_log': 2} = 4 个木头
       → 验证器: "success = true"（总数超过 3）
  如果失败，验证器还会给出改进建议（critique）

循环流程（最多 4 轮）：
  生成代码 → 执行 → 收集反馈 → 改进代码 → 执行 → ...
  → 直到自我验证通过 → 存入技能库 → 请求下一个任务
  → 或 4 轮后放弃 → 标记为失败任务 → 课程提出新任务
```

### 4. 整体架构协同

```
┌────────────────────────────────────────────────────────────┐
│                    VOYAGER 主循环                            │
│                                                              │
│  ① 自动课程 (GPT-4)                                         │
│     输入: Agent 状态 + 已完成/失败任务                       │
│     输出: 下一个任务（如 "Mine 3 iron_ore"）                 │
│        │                                                     │
│        ↓                                                     │
│  ② 技能检索                                                  │
│     输入: 任务描述 + 环境反馈                                │
│     输出: Top-5 相关技能代码（from 向量DB）                  │
│        │                                                     │
│        ↓                                                     │
│  ③ 代码生成 (GPT-4)                                         │
│     输入: 任务 + 检索到的技能 + Agent 状态 + 反馈            │
│     输出: JavaScript 函数                                    │
│        │                                                     │
│        ↓                                                     │
│  ④ 执行 → 环境反馈 + 执行错误                               │
│        │                                                     │
│        ↓                                                     │
│  ⑤ 自我验证 (GPT-4)                                         │
│     成功 → 存入技能库 → 回到 ①                              │
│     失败 → 带 critique 回到 ③（最多 4 轮）                  │
│     卡住 → 回到 ① 换任务                                    │
└────────────────────────────────────────────────────────────┘
```

## 实验结果

### 探索能力

![Figure 5: 地图覆盖率鸟瞰图。VOYAGER 穿越了 2.3 倍长的距离，跨越草原、沙漠、河流、雪原等多种地形；基线方法的 Agent 往往困在局部区域。](https://voyager.minedojo.org/assets/images/map.png)

```
160 次 Prompt 迭代后的物品发现数：
────────────────────────────────
VOYAGER:     63 种独特物品 ← 3.3x 领先
AutoGPT:     ~19 种
Reflexion:   ~5 种
ReAct:       ~4 种
```

### 科技树解锁

![Figure: 科技树掌握速度对比。VOYAGER 是唯一解锁钻石工具的方法，且在木/石/铁三个层级分别快 15.3x / 8.5x / 6.4x。](https://voyager.minedojo.org/assets/images/tech_tree.png)

```
科技树 (木 → 石 → 铁 → 钻石) 解锁速度（Prompt 迭代次数）：
──────────────────────────────────────────────────────────
                    木工具    石工具    铁工具    钻石工具
VOYAGER             6±2      11±2     21±7     102 (1/3)
AutoGPT             92±72    94±72    135±103  N/A (0/3)
Reflexion           N/A      N/A      N/A      N/A
ReAct               N/A      N/A      N/A      N/A

VOYAGER 是唯一一个解锁钻石级别的方法
木工具快 15.3x | 石工具快 8.5x | 铁工具快 6.4x
```

### 零样本迁移

```
清空背包 → 放入全新世界 → 给 4 个未见过的任务：
─────────────────────────────────────────────────
                 钻石镐   金剑    岩浆桶   指南针
VOYAGER          19±3    18±7   21±5    18±2    ← 全部 3/3 成功
VOYAGER 无技能库  36     30±9   27±9    26±3    ← 也能做但更慢
AutoGPT+技能库   39     30     N/A     30      ← 只能成功一部分
AutoGPT          N/A    N/A    N/A     N/A     ← 全部失败
ReAct/Reflexion  N/A    N/A    N/A     N/A     ← 全部失败

关键发现：
  • 技能库不仅提升 VOYAGER，还能 plug-and-play 提升 AutoGPT
  • 这证明技能库是通用的"经验资产"，不绑定特定框架
```

### 消融实验

![Figure: 消融实验结果。左图：移除自动课程（换随机课程后物品发现数下降 93%）、技能库、GPT-4 的影响。右图：移除环境反馈、执行错误、自我验证的影响。所有组件都是不可或缺的。](https://voyager.minedojo.org/assets/images/ablation.png)

关键发现：

*   **自动课程不可或缺：** 换成随机课程后物品发现数下降 93%，因为打乱顺序会让 Agent 遇到"不可能完成"的任务。
*   **自我验证是最重要的反馈：** 移除后物品发现数下降 73%，因为没有验证器，Agent 不知道何时该进入下一个任务。
*   **GPT-4 >> GPT-3.5：** 代码生成能力相差 5.7 倍，说明 VOYAGER 的设计依赖强模型。

## 还有更好的解决方案吗？

VOYAGER 的三大模块分别有各自的改进空间：

*   **自动课程：** 目前依赖 GPT-4 的"世界知识"来提议任务，面对 GPT-4 不了解的领域（非 Minecraft）可能会提出不合理的任务。后续工作可以引入更结构化的课程设计。
*   **技能库 vs 记忆流：** [Generative Agents](./Stanford%20%26%20Google%20-%20Generative%20Agents%20-%20Interactive%20Simulacra%20of%20Human%20Behavior.md) 用自然语言记忆流存储经验，VOYAGER 用代码存储技能。两者的哲学不同——代码更精确可执行，自然语言更灵活通用。[MemOS](./MemOS%20-%20A%20Memory%20OS%20for%20AI%20System.md) 试图统一管理不同形态的记忆。
*   **视觉感知的缺失：** VOYAGER 完全不看屏幕，靠 Mineflayer API 获取结构化状态。这绕开了视觉问题，但也限制了它执行需要视觉反馈的任务（如建造 3D 结构）。论文用"人类替代视觉"做了建造 Demo，暗示多模态是未来方向。
*   **成本问题：** GPT-4 API 比 GPT-3.5 贵 15 倍，而 VOYAGER 严重依赖 GPT-4 的代码生成质量。不过随着开源模型能力的提升，这个瓶颈正在被打破。

## 冷思考："代码即行动"的边界在哪？

### 1. Minecraft 是一个"友好"的测试环境

VOYAGER 的成功很大程度上依赖于 Mineflayer 提供的**高级 API**——Agent 不需要处理像素、不需要精确操控鼠标键盘。`mineBlock(bot, "stone", 3)` 一行代码就能搞定一个在 RL 中需要大量训练才能学会的技能。

如果换成一个没有现成 API 的环境（比如真实世界的机器人），"代码即行动"的范式还能不能工作？这是一个开放问题。

### 2. 技能库的"天花板"

技能库会一直增长，但**检索质量**会随规模增大而下降吗？论文的 Top-5 检索准确率是 96.5%，但这是在 ~300 个技能的规模上测试的。当技能库膨胀到数千甚至数万时，向量检索的精度和效率可能成为新的瓶颈。

### 3. 真正的贡献：Agent 范式的第三极

```
2023 年 Agent 范式的三足鼎立：

  Generative Agents (Stanford)      VOYAGER (NVIDIA)           ReAct (Princeton)
  ──────────────────────            ──────────────            ──────────────────
  记忆流 + 反思 + 规划              自动课程 + 技能库          推理 + 行动交替
  自然语言作为行动空间              代码作为行动空间            自然语言作为行动空间
  社会模拟 / 角色扮演               具身探索 / 终身学习         知识问答 / 决策
  强调"像人"                        强调"会学习"               强调"会推理"
```

VOYAGER 证明了一个关键洞察：**LLM 最擅长的不是直接"做事"，而是"写代码让别人做事"**。把代码作为行动空间，天然获得了可组合性（函数调用函数）和抗遗忘性（代码存了就不会忘），这比用自然语言描述行动或用 RL 学低级策略都更高效。

## 总结

VOYAGER 的核心回答了一个问题：**"LLM Agent 如何实现终身学习？"**

答案是三个模块的协同：**自动课程**让 Agent 知道"下一步该学什么"，**技能库**让 Agent 把学到的东西存下来并复用，**迭代提示**让 Agent 能从失败中修正。三者形成一个正向飞轮——越学越多、越学越快、越学越复杂。

从更大的视角看，VOYAGER 开创了"**代码作为 Agent 记忆**"的范式。[Generative Agents](./Stanford%20%26%20Google%20-%20Generative%20Agents%20-%20Interactive%20Simulacra%20of%20Human%20Behavior.md) 用自然语言记录经验，VOYAGER 用可执行代码记录技能——两者分别解决了"Agent 如何记住经历"和"Agent 如何记住能力"这两个互补问题。
