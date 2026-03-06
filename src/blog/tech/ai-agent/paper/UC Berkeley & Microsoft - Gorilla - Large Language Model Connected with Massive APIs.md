*论文发布时间：2023-05-24*

UC Berkeley 和微软研究院联合发布的 **Gorilla**（论文标题为《[Gorilla: Large Language Model Connected with Massive APIs](https://arxiv.org/abs/2305.15334)》）解决了一个核心问题：**LLM 在调用 API 时严重幻觉——编造不存在的 API、传错参数、用错库。** Gorilla 通过在 1,645 个真实 API 上微调 LLaMA-7B，并引入"检索感知训练"，使其在 API 调用准确率上**超越 GPT-4**，同时将幻觉率从 GPT-4 的 37% 降到接近 0。

项目地址：[gorilla.cs.berkeley.edu](https://gorilla.cs.berkeley.edu)

## Gorilla 解决了什么问题？

**核心问题：LLM 调 API 时会编造——编不存在的 API 名、编不存在的参数、编不存在的库。**

```
2023 年中的尴尬现实：
────────────────────

用户: "帮我找一个 Torch Hub 上的模型，把录音转成文字"

GPT-4 的回答:
  torch.hub.load('pytorch/fairseq', 'wav2vec2_large_960h')
  → 这个模型根本不存在！GPT-4 编造了一个看起来合理但虚假的 API

Claude 的回答:
  选了一个错误的库

Gorilla 的回答:
  正确识别任务 → 返回真实存在的、参数正确的 API 调用

三类典型错误：
  ① 幻觉: 调用根本不存在的 API（最严重）
  ② 参数错误: API 名对了但参数不对
  ③ 选错 API: 功能不匹配

为什么即使 GPT-4 也会犯这些错？
  → API 数量太多（仅 HuggingFace 就有 20 万+模型）
  → API 之间功能高度重叠（光"图像分类"就有几十个模型）
  → API 文档频繁更新（模型升级、仓库迁移）
  → 全靠 LLM 从训练数据中"回忆"，记错就编
```

## 它是如何解决的？

Gorilla 的方案分为三步：**构建 API 基准数据集 → 检索感知训练 → AST 精确评估**。

### Step 1: APIBench——首个大规模 API 调用基准

```
数据来源（三大模型平台）：
──────────────────────────

HuggingFace:  925 个 API（从 20 万+模型中按任务类型取 Top-20）
TensorFlow Hub: 626 个 API（v2 全量，过滤掉文档不全的）
Torch Hub:      95 个 API（全量收录）
──────────────────────────
合计: 1,645 个 API

每个 API 被结构化为 JSON:
{
  "domain": "Object Detection",
  "framework": "PyTorch",
  "functionality": "Traffic Object Detection, Lane Detection",
  "api_name": "HybridNets",
  "api_call": "torch.hub.load('datvuthanh/hybridnets', 'hybridnets', pretrained=True)",
  "api_arguments": {...},
  "performance": {"dataset": "BDD100K", "mAP@0.5": "77.3%"},
  "description": "..."
}

指令生成（Self-Instruct）:
  用 GPT-4 为每个 API 生成 10 条用户指令
  → 共 16,450 条 {指令, API} 训练对
  只需 18 条人工示例作为种子
```

### Step 2: 检索感知训练——Gorilla 的核心创新

```
普通微调 vs 检索感知训练：
──────────────────────────

普通微调（没有检索器）:
  训练数据: "用户指令 → 正确 API 调用"
  模型学到: 把指令映射到记住的 API（全靠记忆）
  问题: API 文档更新了，模型还在调旧版本

检索感知训练（Gorilla 的做法）:
  训练数据: "用户指令 + 参考 API 文档 → 正确 API 调用"
                       ↑
                  训练时就把检索到的文档拼进去

  具体格式:
  ┌──────────────────────────────────────────────┐
  │ User: 帮我做图像分类                          │
  │ Use this API documentation for reference:     │
  │ <检索到的 API 文档 JSON>                      │
  │                                               │
  │ Assistant: hub.load('google/imagenet/...', .) │
  └──────────────────────────────────────────────┘

  模型学到:
    ① 理解用户意图
    ② 解析文档中的 API 描述
    ③ 根据文档生成正确调用（而不是靠记忆）

推理时两种模式:
  Zero-shot: 用户指令直接输入，模型靠记忆回答
  With Retriever: 先用 BM25/GPT-Index 检索最相关的 API 文档
                  拼接到用户指令后面，再输入模型
```

**为什么检索感知训练比"先微调再加检索器"好？**

```
对比实验（Table 2 的关键发现）：
────────────────────────────────

方案 A: 微调时不带检索 + 推理时加检索
  Torch Hub:     54.83%（Oracle 检索）
  HuggingFace:   45.58%（Oracle 检索）
  → 推理时加检索有时反而干扰模型（BM25 检索会让准确率暴跌 21%+）

方案 B: 微调时带检索 + 推理时带检索（Gorilla 的方案）
  Torch Hub:     67.20%（Oracle 检索）← +12.37%
  HuggingFace:   91.26%（Oracle 检索）← +45.68%
  → 训练时就学会了"怎么读文档"，推理时文档才能真正帮上忙

核心洞察:
  如果训练时没见过"文档拼接在指令后面"的格式
  推理时突然塞进来一段文档，模型不知道怎么用
  → 反而被干扰，准确率下降
```

### Step 3: AST 子树匹配——精确评估 API 调用

```
为什么不能用普通的字符串匹配？
────────────────────────────────

同一个 API 调用可能有多种合法写法:
  torch.hub.load('pytorch/vision', 'densenet121', pretrained=True)
  torch.hub.load('pytorch/vision', 'densenet121')  ← pretrained 是默认参数

传统评估: 字符串不完全匹配 → 判为错误
AST 评估: 解析为语法树 → 检查关键节点是否匹配 → 正确！

Gorilla 的评估方法:
  ① 把模型输出的代码解析为 AST（抽象语法树）
  ② 找到 API 调用节点（如 torch.hub.load）
  ③ 检查关键参数是否匹配数据库中的 API
  ④ 忽略可选参数（如 pretrained=True）

幻觉的精确定义:
  如果模型输出的 API 调用在整个数据库中找不到任何子树匹配
  → 判定为幻觉（调用了完全不存在的 API）
```

## 实验结果

### 整体准确率

```
Zero-shot（不使用检索器）:
                    Torch Hub    HuggingFace    TensorFlow Hub
─────────────────────────────────────────────────────────────
LLaMA 7B             0.00%         0.00%          0.00%
GPT-3.5              48.38%       16.81%         41.75%
GPT-4                38.70%       19.80%         18.20%
Claude               18.81%        6.19%          9.19%
Gorilla 7B           59.13%       71.68%         83.79%  ← 全面碾压

Gorilla 7B 零样本准确率比 GPT-4 高 20.43%
→ 7B 参数的微调模型在垂直领域碾压通用大模型
```

### 幻觉率

```
Zero-shot 幻觉率（越低越好）:
                    Torch Hub    HuggingFace    TensorFlow Hub
─────────────────────────────────────────────────────────────
LLaMA 7B            100.00%       97.57%        100.00%  ← 全是幻觉
GPT-3.5              18.81%       35.73%         47.88%
GPT-4                36.55%       37.16%         78.65%  ← GPT-4 幻觉比 3.5 更严重！
Claude               65.59%       77.65%         88.46%
Gorilla 7B            6.98%       10.95%          5.40%  ← 接近零幻觉

意外发现: GPT-4 的幻觉率比 GPT-3.5 更高
  → 论文推测 RLHF 在"如实性"上对 GPT-3.5 的调优更强
  → GPT-4 更"自信"地编造不存在的 API
```

### 适应 API 文档变更

```
检索感知训练的独特优势——适应 API 更新:

场景 1: 模型升级
  原始: FCN 使用 ResNet-50 骨干网络
  更新: FCN 升级为 ResNet-101 骨干网络
  → 只需更新检索数据库中的文档
  → Gorilla 自动生成新版本的 API 调用

场景 2: 仓库迁移
  原始: pytorch/vision
  更新: NVIDIA/DeepLearningExamples:torchhub
  → 同样只需更新文档，不用重新训练

普通微调的模型做不到这一点:
  API 改了 → 模型还在调旧版本 → 必须重新微调
```

### 约束感知的 API 选择

```
带约束的 API 调用（Torch Hub 子集）:

用户: "帮我找一个 ImageNet 准确率 ≥ 80% 的图像分类模型"
→ ResNeXt-101 (84.2%) ✓  vs  MobileNetV2 (71.88%) ✗

                  Zero-shot   BM25    GPT-Index   Oracle
────────────────────────────────────────────────────────
GPT-3.5            73.94%    62.67%    81.69%    80.98%
GPT-4              62.67%    56.33%    71.11%    69.01%
Gorilla            71.83%    57.04%    71.83%    78.16%

约束满足率:
GPT-3.5            43.66%                       69.01%
GPT-4              43.66%                       59.15%
Gorilla            47.88%                       67.60%

→ Gorilla 在约束场景下与 GPT-3.5 持平，优于 GPT-4
→ 说明 Gorilla 不仅会调 API，还能理解参数权衡
```

## 还有更好的解决方案吗？

Gorilla 有几个明确的局限：

*   **仅覆盖 ML API：** 数据集只包含 HuggingFace、TorchHub、TensorHub 的模型调用，不覆盖 RESTful API、数据库查询等更广泛的工具类型。
*   **单步调用：** 和 Toolformer 一样，每次只生成一个 API 调用，不支持"先搜索再计算"这种链式调用。
*   **检索器质量是瓶颈：** Oracle 检索器下准确率 67-91%，但换成 BM25 实际检索器后暴跌到 17-42%。检索不准，整个系统就崩。
*   **不处理执行结果：** Gorilla 只负责"生成正确的 API 调用代码"，不关心执行结果的整合和后续推理。

后续演化方向：

*   **Function Calling** (2023.06): OpenAI 将 API 调用内置到模型 API 层面，用 JSON Schema 描述工具，无需为每个工具单独微调。
*   **Gorilla OpenFunctions** (2024): Gorilla 团队后续推出了支持通用 Function Calling 的版本，覆盖了 RESTful API。
*   **MCP** (2024.11): 标准化了工具发现和调用协议，使得"检索可用工具"这个环节也标准化了。

## 冷思考：Gorilla 在工具调用演化中的位置

### 1. Toolformer → HuggingGPT → Gorilla：三种路线的碰撞

这三篇论文几乎同期发表（2023 年 2-5 月），各自代表了一条不同的技术路线：

```
让 LLM 会调 API 的三条路线（2023）：
──────────────────────────────────────

Toolformer (2023.02) — 自监督微调路线:
  思路: 让模型自己发现什么时候该调工具
  方法: loss 过滤生成训练数据 → 微调
  工具: 5 个写死的
  加新工具: 重新跑整套采样-过滤-微调流程
  核心创新: 自监督数据构造

HuggingGPT (2023.03) — 纯 Prompt 路线:
  思路: 让 LLM 当"项目经理"读工具说明书
  方法: few-shot prompt，零训练
  工具: HuggingFace 上几十万个，动态选择
  加新工具: 写个模型描述就行
  核心创新: LLM 作为控制器的架构

Gorilla (2023.05) — 检索增强微调路线:
  思路: 在海量 API 上微调，训练时就加入检索
  方法: Self-Instruct + 检索感知微调
  工具: 1,645 个（含结构化元数据）
  加新工具: 更新检索数据库，不用重新训练
  核心创新: 检索感知训练 + AST 评估

三条路线的权衡:
  Toolformer:  精度高但扩展性差（5 个工具）
  HuggingGPT: 扩展性好但不可靠（GPT-3.5 规划准确率 ~50%）
  Gorilla:     精度和扩展性兼顾，但依赖检索器质量
```

### 2. 检索感知训练的深层意义

Gorilla 最重要的实验发现不是"Gorilla 比 GPT-4 准"，而是：**微调时不带检索 + 推理时加检索，效果反而可能变差。**

```
这个发现挑战了一个常见假设:
────────────────────────────

常见假设: "模型先训好，推理时再加 RAG（检索增强生成）就行"

Gorilla 的反例:
  微调时不带检索 + 推理时加 BM25 检索:
    Torch Hub:    37.63%（比零样本的 59.13% 暴跌 21.5%）
    HuggingFace:  11.28%（比零样本的 71.68% 暴跌 60.4%）

  → 推理时突然出现的检索文档，模型不知道怎么用
  → 反而被当成噪声，严重干扰输出

启示:
  如果你打算用 RAG，训练时就应该让模型见过 RAG 的格式
  → "怎么训"和"怎么用"必须一致
  → 这对当前所有 RAG 系统都有参考价值
```

### 3. 自举链条的延续

Gorilla 的数据构造同样符合 [Toolformer](./Meta%20-%20Toolformer%20-%20Language%20Models%20Can%20Teach%20Themselves%20to%20Use%20Tools.md) 分析中讨论的"自举范式"：

```
Gorilla 的自举前置条件:
───────────────────────

前置条件: GPT-4 的 Self-Instruct 能力
  Gorilla 的训练数据由 GPT-4 生成
  每个 API 生成 10 条用户指令
  → 需要 GPT-4 能理解 API 文档并生成合理的用户场景

自举逻辑:
  GPT-4 生成指令 → 人工给 18 个种子示例 → 批量生成 16,450 条
  → 用这些数据微调 LLaMA-7B → 得到在 API 调用上超越 GPT-4 的模型

矛盾之处:
  用 GPT-4 生成训练数据 → 训练出的模型在 API 调用上超越 GPT-4
  → 这说明 GPT-4 的 API 调用能力不是"不够"，而是"不够聚焦"
  → 微调把通用能力"蒸馏"成了垂直领域的专精能力
```

## 总结

Gorilla 通过**检索感知微调**在海量 API 调用场景中实现了比 GPT-4 更高的准确率和更低的幻觉率。它最有价值的贡献不是模型本身，而是两个实验发现：一是证明了**训练时不带检索 + 推理时加检索可能适得其反**，挑战了"先训后 RAG"的朴素假设；二是揭示了**GPT-4 的幻觉率竟然比 GPT-3.5 更高**，暗示了模型能力增强和幻觉抑制之间的张力。从 Toolformer（5 个写死工具）到 HuggingGPT（prompt 调度万级工具）到 Gorilla（微调 + 检索调度千级 API），工具调用的规模和可靠性都在快速提升，最终汇入了 Function Calling / MCP 的标准化轨道。
