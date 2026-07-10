>问题：如何理解 claude 的 dream mode 这跟 hermes 的 skill 沉淀在原理层面有啥区别，哪个效果会更好，优缺点分别是啥？

如果只看**原理层面**，Claude Dream Mode 和 Hermes 的 Skill 沉淀其实是在解决两个不同的问题。

一句话概括：

* **Claude Dream Mode = 优化“知道什么”（Declarative Memory，事实记忆）**
* **Hermes Skill = 优化“怎么做”（Procedural Memory，程序性知识）**
* **Dream 更容易维护；Skill 更容易带来收益，但也更容易失效。**

这两者并不是竞争关系，而是分别对应认知科学里的两类长期记忆。

---

# 先看 Claude Dream Mode 的原理

Anthropic 官方文档其实写得非常明确。

Dream 不是训练模型，也不是微调。

它本质上是一个**后台 Memory Consolidation（记忆巩固）过程**。

整个流程：

```
历史 Session
        +
Memory Store
        │
        ▼
Dream Job
（后台异步）
        │
        ▼
重新生成新的 Memory Store
```

Dream 会：

1. 读取所有历史 Session
2. 读取当前 Memory Store
3. 删除重复
4. 合并冲突
5. 更新过时事实
6. 抽取新的长期规律（Insight）
7. 输出一个新的 Memory Store（旧的不改）

官方甚至强调：

> Dream 不修改原 Memory，而是生成一个新的版本，可以 review 后决定是否采用。

所以 Dream 更像：

> **Memory GC（垃圾回收）+ Offline Summarization + Knowledge Distillation**

不是学习 workflow。

而是学习：

> "关于这个用户、这个项目，到底哪些事实值得长期记住？"

例如：

原来 Memory：

```
John 喜欢 Python
John 最近开始 Rust
John 不喜欢 Java
John 现在主要写 Rust
```

Dream 后：

```
用户主要使用 Rust。
Python 仍然熟悉。
Java 非首选。
```

就是一个**Knowledge Consolidation**。

---

# Hermes Skill 在干什么？

Hermes 完全不同。

Hermes 的 Skill 保存的是：

> **Procedure（流程）**

例如：

用户完成一次：

```
部署 Kubernetes
```

Hermes 会发现：

成功步骤：

```
kubectl apply
↓

helm install

↓

等待 rollout

↓

health check
```

然后自动生成一个 Skill：

```
Deploy Kubernetes Service

Step1

Step2

Step3
```

以后：

只要任务类似：

```
部署另一个服务
```

Hermes 会：

```
Semantic Search

↓

找到 Deploy Skill

↓

加载 Skill

↓

执行
```

整个过程几乎就是：

```
Experience

↓

Workflow Extraction

↓

Skill Library

↓

Retrieval

↓

Reuse
```

官方文档称之为：

> Procedural Memory（程序性记忆），并采用按需加载（Progressive Disclosure），只在相关任务时把 Skill 放入上下文，以避免上下文膨胀。

---

# 两者最大的区别

如果画成图：

Claude：

```
Experience

↓

Extract Facts

↓

Better Memory
```

Hermes：

```
Experience

↓

Extract Workflow

↓

Reusable Skill
```

一个抽的是：

> What is true.

另一个抽的是：

> How to do.

---

# 更底层一点

认知科学里其实对应：

```
Semantic Memory
```

↓

Claude Dream

例如：

> 用户喜欢中文。

---

```
Procedural Memory
```

↓

Hermes Skill

例如：

> 怎样写一个 MCP。

两者根本不是同一层。

---

# 为什么 Claude 不直接做 Skill？

Anthropic 的设计哲学其实偏：

Agent 自己 Planning。

Workflow 每次重新规划。

而不是：

```
Task

↓

固定 Workflow

↓

执行
```

Dream 更相信：

> 模型能力越来越强。

Workflow 不应该固化。

固化的是：

事实。

所以 Dream 输出 Memory。

不是 Prompt。

不是 Skill。

更不是 Tool。

---

# Hermes 为什么强调 Skill？

因为 Hermes 是 Agent。

Agent 最大的问题：

不是不知道。

而是每次都重新探索。

例如：

第一次：

```
Docker

↓

失败

↓

修复

↓

成功
```

第二次：

如果再重新探索就是浪费。

所以 Hermes：

```
成功 Workflow

↓

Skill
```

以后直接调用。

这其实就是：

Experience Replay。

---

# 从 AI Architecture 看

Dream：

```
Session

↓

Reflection

↓

Memory Compression

↓

Memory Store
```

Hermes：

```
Session

↓

Reflection

↓

Workflow Abstraction

↓

Skill Library
```

其实 Reflection 都有。

抽象对象不同。

---

# Dream 的优点

### ① Memory 越来越干净

不会：

```
重复

冲突

垃圾
```

Memory 保持稳定。

---

### ② 能发现隐含规律

例如：

历史：

```
喜欢 React

喜欢 Next.js

喜欢 Tailwind
```

Dream：

得到：

```
偏好现代 Frontend。
```

这是原来没有写过的。

属于：

Insight。

---

### ③ 不容易过拟合 Workflow

Workflow 会变化。

事实变化慢。

Dream 比较稳。

---

# Dream 的缺点

不能直接提升执行效率。

例如：

部署 Kubernetes。

Dream 不会：

```
记住整个流程
```

它只会：

```
用户最近部署过 Kubernetes。
```

Workflow 还是重新规划。

---

# Hermes Skill 优点

最大的优势：复用。

例如：

第一次：

```
花 20 分钟。
```

第二次：

```
2 分钟。
```

Skill 就像：

```
经验模板
```

所以：

复杂 Agent。

收益非常大。

---

# Hermes Skill 的缺点

### ① 容易过时

例如：

GitHub API 改版。

Skill：

全部失效。

需要更新。

---

### ② 容易 Context Explosion

虽然 Hermes 采用按需加载技能，但如果技能选择过于积极、技能本身过大，仍可能导致上下文快速增长，这是社区用户实际反馈过的问题。

---

### ③ 容易固化旧方法

例如：

Skill：

```
Always use pandas
```

后来：

polars 更好。

Skill：

反而限制模型。

---

# 如果做下一代 Agent，最佳方案是什么？

从目前的发展趋势来看，最合理的架构不是二选一，而是组合。

```
Experience
        │
        ▼
Reflection
        │
 ┌──────────────┬──────────────┐
 │              │
 ▼              ▼
Facts        Workflow
 │              │
 ▼              ▼
Dream       Skill
 │              │
 └──────┬───────┘
        ▼
 Retrieval + Planning
```

也就是说：

* **Dream** 负责把长期事实、偏好、项目知识压缩成高质量记忆。
* **Skill** 负责把成功的方法、操作流程、工具使用经验沉淀为可复用的程序性知识。
* 推理阶段再结合检索和规划，决定什么时候引用事实、什么时候加载技能。

这也是目前 Agent 系统中较为自然的长期演进方向：将**语义记忆（Semantic Memory）**与**程序性记忆（Procedural Memory）**分层管理，而不是试图用一种机制解决所有长期学习问题。
