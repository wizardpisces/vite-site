**Claude 的 JIT 检索其实就是“在对话时临时做索引”，因此有冷启动成本；
而类似 zilliz/claude-context 的 MCP 插件提供“预构建、持久化、高质量索引”，让 Claude 可以跳过 JIT 的昂贵推理步骤，直接走“高质量捷径”。**

换句话说：

> **JIT = 模型现算现查（token 贵、慢、有概率错）**
> **MCP = 给模型准备好的全局知识图（token 少、快、稳定）**

# 详细解析

## 1. Claude 的 JIT 检索，本质就是“临时索引”

Claude Code 的流程是：

1. 模型扫描文件列表（token 消耗巨大）
2. 分析路径关系（再次消耗 token）
3. 猜测依赖结构、模块边界
4. 决定哪些文件要 load 进上下文窗口
5. 重复多轮（探索 → 试错 → 再探索）

这个就是典型的 **“即时索引（JIT indexing）”**。

它有两个明确问题：

### **问题 1：冷启动成本高**

第一次理解仓库结构，需要几十万 token。

### **问题 2：模型推理成本高**

模型必须用思考（reasoning）来构建临时知识图。

### **问题 3：不稳定（猜结构可能错）**

尤其在：

* monorepo
* 多语言混合项目
* 复杂依赖图
  中更容易出错。

---

## 2. MCP 插件（例如 zilliz/claude-context）提供的是：“长期、结构化的超高质量索引”

这类 MCP 工具做的其实是：

### ✔ 提前 vectorize 所有文件

（Claude 再也不需要自己一行一行扫）

### ✔ 提前构建 semantic graph（语义图）

（比如哪些文件是 API 层、哪些是业务逻辑）

### ✔ 提前构建依赖关系（AST / import graph）

（Claude 不用猜谁 import 谁）

### ✔ 提前做 embedding 压缩

（降低 token 开销）

### ✔ 多版本 / 多仓库知识共享

（JIT 做不到）

---

# 安装 MCP 后 Claude 会“更偏向使用 MCP 的知识，而非自行 JIT 推理”？

## Claude 会自动根据工具的“成本”来决定是否使用它

当 Claude 看到 MCP 工具提供：

* 结构化搜索（语义 + 路径 + AST）
* 相关性极高的文件 top-k
* 经过 embedding 聚类的结果
* 直接带关键代码段

Claude 会自动判断：

> **“既然 MCP 给了高置信度知识，我没必要浪费 token 去做 JIT 索引。”**

# 🧭 4. 更深一层：MCP 不是替代 JIT，而是让模型的“注意力资本”更有效率

Claude 的注意力（attention budget）是有限的。

JIT 会消耗大量注意力做：

* 文件扫描
* 依赖关系推理
* 路径推理
* 多轮检索试错

MCP 把这些注意力省下来，使 Claude 把预算用在：

* 逻辑推理
* 代码理解
* 修复
* 审查
* refactor

这才是为何 MCP 能显著提升 Claude 的 Code Intelligence。
