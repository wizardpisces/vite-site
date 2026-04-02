# Agent 系统的五个核心范式

> 从 deepagents 源码出发，提炼 AI Agent 系统设计的通用范式

## 引言

分析 deepagents 源码后，我发现 Agent 系统的核心挑战可以归结为**五个范式问题**。这些问题不依赖于具体框架——无论你用 LangGraph、CrewAI 还是自建系统，都必须面对它们。

本文不是框架教程，而是试图回答：**构建一个生产级 Agent 系统，到底需要解决哪些本质问题？**

---

## 范式一：注意力经济学 — Less is More

### 核心命题

> **给 LLM 更多信息，不会让它更聪明，反而更蠢。**

这是 Agent 系统最反直觉的发现。

### 数学基础

Transformer 的自注意力机制是一个**零和博弈**：

```python
weights = softmax(scores)  # 所有权重之和 = 1
```

当你往 context 里塞入无关内容时：

```
场景 A：只有相关内容（3 个 keys）
  weights = [0.35, 0.30, 0.35]  # 相关内容分享 100% 注意力

场景 B：混入无关内容（3 相关 + 5 无关）
  weights = [0.18, 0.15, 0.17, 0.08, 0.06, 0.07, 0.09, 0.07]
  # 相关内容只分到 50% 注意力 — 被稀释了一半
```

**实测数据（Anthropic 研究）：**

- 10k tokens context（80% 相关）：准确率 87%
- 100k tokens context（20% 相关）：准确率 79%（**-8%**）

这不是偶然，是注意力机制的数学必然。

### 范式解法：渐进式披露（Progressive Disclosure）

**核心思想：** 把上下文当成稀缺资源来管理，而不是垃圾桶。

**deepagents 的实现：**

```
启动时注入（~150 tokens）：
  可用技能：
  - query-writing: 写 SQL 查询
  - schema-exploration: 探索数据库结构
  需要时用 read_file 加载详细内容。

Agent 决定需要时，才加载（+480 tokens）：
  read_file("./skills/query-writing/SKILL.md")
  → 获得完整 69 行 workflow
```

**实现机制（源码）：**

deepagents 的 `SkillsMiddleware` 启动时扫描 skills 目录，**只提取 YAML frontmatter**（name + description），不读 body：

```python
# 正则只匹配 --- 之间的 YAML 头部
frontmatter_pattern = r"^---\s*\n(.*?)\n---\s*\n"
match = re.match(frontmatter_pattern, content, re.DOTALL)
# 解析得到 name, description → 注入 system prompt
# body 不读，等 Agent 自己调用 read_file
```

**注意：** deepagents 的渐进式只有**两层**（索引 → 全文），不支持深层嵌套。如果知识庞大，设计策略是拆成多个平级 skill，而非嵌套。

### 范式启发

```
旧范式：信息量 ↑ → 效果 ↑
新范式：信噪比 ↑ → 效果 ↑

设计原则：
  1. 按需加载，不要预加载
  2. 索引和内容分离
  3. 让 Agent 自己决定何时加载什么
```

**行业印证：** Anthropic、Cloudflare、Cursor、Vercel 在生产实践中独立收敛到这个模式。

---

## 范式二：工具选择 — 从静态注册到动态检索

### 核心命题

> **工具不是越多越好。50+ 工具时准确率下降 23%。**

原因和范式一相同：工具描述占据 context，稀释注意力。但解法不同。

### 三个层次

**层次 1：静态注册**

```python
# 启动时确定，运行时不变
agent = Agent(tools=[tool1, tool2, ..., tool50])
```

问题：所有工具描述每次都注入，即使任务只需要 3 个。

**层次 2：能力过滤（deepagents 的位置）**

```python
# deepagents 的 FilesystemMiddleware
# 每次调用模型前检查：backend 不支持执行 → 移除 execute 工具
if not supports_execution(backend):
    tools.remove("execute")
```

这只是**基于环境能力的静态过滤**，不理解任务语义。

**层次 3：语义检索（业界前沿：Tool RAG）**

```python
# 从 500 工具中，根据任务语义检索 10 个最相关的
task = "查询加拿大客户数量"
tools = tool_rag.semantic_search(task, top_k=10)
# → [list_tables, get_schema, query_db, ...]
# 而不是注入全部 500 个工具描述
```

加上学习系统：记录每种任务类型下哪些工具组合成功率最高，下次优先选择。

### 范式启发

```
演进路径：
  静态列表 → 能力过滤 → 语义检索 → 学习优化

核心思想：
  工具选择本质上是一个「检索」问题，
  和 RAG 检索文档的逻辑完全一致。
```

---

## 范式三：消息完整性 — 协议约束下的自愈

### 核心命题

> **LLM API 有严格的消息协议。状态不一致时，系统应该自愈而不是崩溃。**

### 问题场景

OpenAI / Anthropic 的 API 要求：每个 `tool_calls` 必须有对应的 `ToolMessage`。

```python
# 这种消息序列会被 API 拒绝（400 Bad Request）
messages = [
    AIMessage(tool_calls=[{"id": "abc", "name": "search", ...}]),
    # 缺少 ToolMessage(tool_call_id="abc")
    HumanMessage(content="算了不搜了")
]
```

**何时出现？** 用户中断、网络超时、checkpoint 恢复、人工介入 — 这些在生产环境中都是常见场景。

### deepagents 的解法

核心就是：扫描消息链，**对每个没有配对 ToolMessage 的 tool_call，补一个**。

```python
# patch_tool_calls.py 的完整逻辑
for i, msg in enumerate(messages):
    if isinstance(msg, AIMessage) and msg.tool_calls:
        for tc in msg.tool_calls:
            # 用 tool_call_id 精确匹配后续的 ToolMessage
            found = next(
                (m for m in messages[i:]
                 if m.type == "tool" and m.tool_call_id == tc["id"]),
                None
            )
            if not found:
                # 补一条
                patched.append(ToolMessage(
                    content=f"Tool call {tc['name']} was cancelled",
                    tool_call_id=tc["id"],
                    name=tc["name"]
                ))
```

**匹配机制：** 结构化属性（`msg.tool_call_id`），不是字符串搜索。

### 范式启发

```
设计原则：
  系统应该假设状态可能不一致，并自动修复，
  而不是假设一切完美，出错时崩溃。

类比：
  TCP 协议不假设网络可靠 → 有重传机制
  Agent 系统不应假设消息完整 → 有修补机制
```

技术难度低（30 行代码），但多数框架没做。这不是技术问题，是**鲁棒性意识**问题。

---

## 范式四：上下文生命周期 — 压缩、卸载、恢复

### 核心命题

> **Agent 的上下文窗口是有限内存。长任务需要"虚拟内存"机制。**

### 类比操作系统

| OS 概念 | Agent 对应 |
|---------|-----------|
| 物理内存 | Context Window |
| 虚拟内存 | 历史卸载到文件 |
| 页面置换 | 自动总结 + 截断 |
| 缺页中断 | ContextOverflowError |

### deepagents 的实现

**三道防线：**

```python
# 防线 1：截断旧消息的大 tool args
# 早期的 tool 返回（如 5000 行文件内容）被截断
for msg in old_messages:
    if len(msg.tool_args) > threshold:
        msg.tool_args = msg.tool_args[:1000] + "...[truncated]"

# 防线 2：主动总结（85% 阈值）
total_tokens = count_tokens(messages, tools)
if total_tokens > 0.85 * model.max_tokens:
    summary = model.summarize(messages[:cutoff])
    backend.write(f"/conversation_history/{thread_id}.md", full_history)
    messages = [summary_message] + messages[cutoff:]

# 防线 3：被动降级（ContextOverflowError）
try:
    response = model.invoke(messages)
except ContextOverflowError:
    # 强制进入总结流程
    summary = summarize(messages)
    response = model.invoke([summary] + recent_messages)
```

### 范式启发

```
核心原则：
  1. 分层管理 — 热数据在 context，冷数据卸载到存储
  2. 预防优先 — 主动压缩（85% 阈值），而非等溢出
  3. 优雅降级 — 溢出时自动总结重试，而非直接失败
  4. 可恢复 — 历史写入文件，Agent 可以回溯

类比：
  不是"内存不够就崩溃"，
  而是"内存不够就换页到磁盘"。
```

---

## 范式五：可组合性 — 中间件模式

### 核心命题

> **Agent 的功能应该可以独立开发、测试、组合。**

### 问题：功能耦合

```python
# 坏：所有功能混在一起
class Agent:
    def run(self):
        self.patch_messages()     # 状态修补
        self.filter_tools()       # 工具过滤
        self.inject_skills()      # 技能注入
        self.check_tokens()       # 上下文管理
        response = self.call_llm()
        self.evict_large_output() # 大输出卸载
        return response
```

问题：加一个功能要改核心循环，测试要测整个系统。

### 解法：中间件栈

```python
# deepagents 的实际装配（graph.py）
middleware_stack = [
    TodoListMiddleware(),           # 规划
    SkillsMiddleware(...),          # 渐进式披露
    FilesystemMiddleware(...),      # 工具 + 大输出卸载
    SubAgentMiddleware(...),        # 子 agent
    SummarizationMiddleware(...),   # 上下文压缩
    PatchToolCallsMiddleware(),     # 状态修补
    MemoryMiddleware(...),          # 长期记忆
    HumanInTheLoopMiddleware(...)   # 人工介入
]
```

每个中间件有三个钩子：

```python
class Middleware:
    def before_agent(self, state):
        """Agent 运行前：修改 state"""
    
    def wrap_model_call(self, request, handler):
        """每次调用 LLM 前：修改 request（tools、messages、system_prompt）"""
    
    def wrap_tool_call(self, request, handler):
        """每次执行工具后：拦截和修改结果"""
```

### 范式启发

```
核心原则：
  1. 正交分解 — 每个中间件只负责一件事
  2. 顺序组合 — 中间件按顺序执行，形成处理管道
  3. 独立测试 — 每个中间件可以单独测试
  4. 可插拔 — 不需要的功能直接移除

这是 Agent 系统中真正的架构创新。
不在于某个中间件做了什么，
在于中间件模式本身的可组合性。
```

---

## 范式之外：几个值得辨析的概念

### Cognitive Blueprint：配置 vs 平台

Cognitive Blueprint 的思想是把 Agent 的配置（身份、工具、行为）和运行时引擎**彻底解耦**：

```yaml
# sql_expert.yaml — 配置层
cognitive_blueprint:
  identity: { name: "SQL-Expert" }
  tools: [{ protocol: "mcp://sqlite/query" }]
  behavior: { planning: { strategy: "hierarchical" } }
```

```python
# runtime.py — 运行时层（通用）
runtime = CognitiveRuntime()
agent = runtime.load_blueprint("sql_expert.yaml")
```

**理想很美好：** 配置即产品，可分发、可版本化、跨语言复用。

**现实（2026.03）：**
- ❌ 没有成熟的通用运行时引擎
- ❌ 没有标准的 blueprint schema
- ❌ Cursor、Claude Code 都不消费这个格式

**但思想已经在渗透：**
- Cursor 的 `.cursor/rules/` — 声明式 Agent 行为配置
- Claude Code 的 `CLAUDE.md` — Markdown 格式的 Agent 身份
- deepagents 的 `AGENTS.md` + `SKILL.md` — 分层配置

这些都是 Blueprint 的**雏形**，只是绑定了各自的运行时。真正的突破需要一个**通用运行时标准**。

**如果用于公司内部低代码：** 你需要自建运行时引擎。Blueprint 不是产品，是设计模式。

### 流式的本质：信息流控制

流式不是"最后一步逐字输出"，而是**对整个执行过程的选择性展示**。

**四个维度：**

| 维度 | 选项 | 价值 |
|------|------|------|
| **粒度** | token / message / task | 不同场景需要不同密度 |
| **内容** | thinking / tool_call / response | 隐藏或展示哪些环节 |
| **受众** | developer / user / audit | 同一过程，不同呈现 |
| **聚合** | 逐条 / 批量 / 摘要 | 减少信息过载 |

**实际例子：** 50 次 `read_file` 调用

```
全量展示（开发者）：
  🔧 read_file(a.py)  ✓
  🔧 read_file(b.py)  ✓
  ... 50 条

聚合展示（用户）：
  📁 正在读取 50 个文件... ✓

审计记录：
  {"ts": "...", "tool": "read_file", "file": "a.py", "tokens": 1200}
  ... 50 条 JSON
```

**deepagents 支持基础流式**（继承 LangGraph 的 `stream_mode`），但**选择性过滤需要应用层实现**。

---

## 总结：五个范式的关系

```
范式一（注意力经济学）
    ↓ 解决"给 LLM 什么"
范式二（工具选择）
    ↓ 解决"给 LLM 哪些工具"
范式三（消息完整性）
    ↓ 解决"消息格式正确"
范式四（上下文生命周期）
    ↓ 解决"长期运行不崩溃"
范式五（可组合性）
    ↓ 解决"如何优雅地实现以上所有"
```

**五个范式都指向同一个核心问题：**

> **在有限的 context window 内，如何高效地完成开放式任务？**

这个约束催生了渐进式披露（减少输入）、工具检索（精选工具）、上下文压缩（管理历史）、消息修补（保证格式）、中间件模式（组合能力）。

**deepagents 的贡献：** 用中间件模式把这五个范式的最佳实践打包成开箱即用的方案。不是每个范式都做到了业界最优，但提供了一个**可组合的基座**。

---

## 附录：deepagents 真实定位

```
deepagents ≠ 技术革新
deepagents = 工程整合 + 标准约定

贡献分解：
  60% — 把分散的最佳实践打包（上下文压缩、状态修补、渐进式披露）
  25% — 中间件架构（范式五的核心创新）
  15% — 标准约定（SKILL.md 格式、Backend 协议）
```

类比：Django 没有发明 ORM、模板引擎、路由系统，但把它们整合成了一个高效的框架。deepagents 对 Agent 系统做了同样的事。

---

*本文基于 deepagents 源码分析和 2026 年业界实践。核心观点：Agent 系统的本质挑战是在有限 context window 内高效完成开放式任务。所有设计模式都围绕这个约束展开。*
