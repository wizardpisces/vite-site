# Claude Sonnet 5 的 Token 消耗更多了？一文看懂 Token 的演化

Anthropic 发布 Claude Sonnet 5 后，在更新说明里专门提到一件事：

>Claude Sonnet 5 uses a new tokenizer. The same input text produces approximately 30% more tokens than on Claude Sonnet 4.6. The exact increase depends on the content. 

Sonnet 5 使用了新的 Tokenizer，同样的文本，大约会比之前的 Claude 模型多产生 30% 的 Token。
那么问题来了：

> 同样一句话，为什么 Token 会变多？
>
> Token 不应该是固定的吗？
>
> 是不是 Anthropic 在变相涨价？

要理解上面的问题，首先得搞清楚 Token 是什么？

Token 从来不是自然存在的计量单位，它只是模型选择的一种"编码方式"。

理解这一点，也就理解了为什么不同模型，即使面对完全相同的一段文字，也可能得到完全不同的 Token 数。

## Token 是什么？

很多人第一次接触 LLM，会觉得：

```
一句中文 → Tokenizer → Token
```

仿佛 Token 就像汉字一样，是天然存在的。

实际上并不是。

模型根本不能理解文字。

Transformer 能处理的只有数字。

真正的数据流是：

```
文本 → Tokenizer → [5318, 99122, 8129, ...] → Embedding → 向量 → Transformer
```

Tokenizer 更像是一种编译器。

它负责把人类语言翻译成模型能够理解的编号。

所以：

> Token 是人为设计出来的。不是自然规律。

同一句话，可以切成完全不同的 Token

例如：

```
internationalization
```

一种 Tokenizer 切出来：

```
international  ization
```

另一种：

```
inter  national  ization
```

还有一种：

```
i  n  t  e  ...
```

甚至：

```
internationalization
```

整个就是一个 Token。

模型都可以训练。

只是训练效率不同。

所以：

> Token 的多少，从来没有唯一答案。

## Tokenizer 的目标

这是很多人最大的误区。

大家潜意识都会觉得：

> Token 越少，模型越先进。

事实上。

Tokenizer 真正优化的是：

> 模型最终效果。

而不是：

> Token 数。

举个例子。

假设有一个函数：

```python
calculate_total_price_after_discount()
```

一种 Tokenizer 切出来：

```
calculate_total_price_after_discount
```

整个就是一个 Token。

模型看到：

```
582931
```

结束。

另一种切出来：

```
calculate  total  price  after  discount
```

虽然 Token 多了。

但是模型可以分别理解：

```
calculate  →  动作
total      →  聚合
price      →  价格
discount   →  折扣
```

Attention 更容易建立语义联系。

模型反而可能更聪明。

因此：

> Token 更多，并不意味着模型更差。

## Tokenizer 怎么训练的？

Tokenizer 本身也是训练出来的。

例如语料：

```
apple
application
apply
```

开始时，每个字符都是一个 Token：

```
a  p  p  l  e
```

算法不断统计：

哪些字符组合出现最多。

发现：

```
app
```

出现频率极高。

于是把 `a` `p` `p` 这三个 Token 合并成一个新 Token：

```
app
```

继续训练。

后来：

```
apple
```

又出现很多。

继续合并。

最后得到：

```
app  apple  lication  ly
```

这就是经典的 **BPE（Byte Pair Encoding）**。

它的核心思想只有一句话：

> 不断把最常一起出现的片段合并。

## Tokenizer 的演化

**第一代：Word Level**

```
I  love  AI
```

一个词一个 Token。

问题：

```
loving  loved  lovely
```

全部都是新词。

词典无限膨胀。

**第二代：Character Level**

```
l  o  v  e
```

没有未知词。

但是：

```
internationalization
```

会变成二十多个 Token。

上下文迅速变长。

Transformer 成本暴涨。

**第三代：Subword**

今天几乎所有 LLM 都属于这一代。

思想非常简单：

> 常见片段作为 Token。

例如：

```
international  ization
```

或者：

```
inter  national  ization
```

既避免未知词。

又不会 Token 太长。

今天大家熟悉的 GPT、Claude、Gemini、Llama，基本都属于这一类。

区别只是：切法不同。

### GPT 为什么后来又开始使用 Byte-Level？

GPT-2 引入了一个重要变化。

以前：

```
汉
```

就是一个 Unicode 字符。

GPT-2：直接处理 UTF-8。

例如：

```
汉
```

底层其实是：

```
E6  B1  89
```

三个 Byte。

这样做最大的优点：<u>任何字符、任何 Emoji、任何语言，都一定可以编码。</u>

不会出现未知字符。

代价就是：有时候 Token 会变多。

## 那 Sonnet 5 为什么 Token 更多？

这也是目前大家最关心的问题。

官方没有公布 Tokenizer 的具体实现。

没有论文、没有 Vocabulary、没有 Merge Rules。

所以没人知道它到底长什么样。

官方目前只公布了：

- 使用新的 Tokenizer
- 同样文本约增加 30% Token
- 更适合 Coding 和 Agent

下面是新 Tokenizer 的推测：

**推测一：代码语料占比更高**

Claude 今天最大的优势不是聊天，而是：

- Coding
- Agent
- MCP
- Tool Calling

因此，Tokenizer 很可能重新学习了：

```
async  await  import  SELECT  FROM  JSON  Markdown  XML
```

这些高频模式，而不是传统自然语言。

**推测二：更多关注语义，而不是压缩率**

Tokenizer 最初目标：

> Token 越少越好。

今天越来越多研究发现：

> 压缩率最高，并不等于模型效果最好。

有时候，适当增加 Token，反而让 Transformer 更容易学习。

**推测三：结构化文本得到优化**

Agent 今天大量输出：

```
{
  "name":"search"
}
```

或者：

```
</tool_call>
```

这些以前几乎没有。

新的 Tokenizer 很可能针对 JSON、XML、Markdown 进行了专门优化。

<u>所以它大概率仍属于现代 subword tokenizer 家族，但重新设计了训练目标和词表，而不是完全发明了一种全新的 tokenizer。</u>

### 那是不是意味着 API 更贵了？

答案其实有两层。

如果比较的是：

> 每百万 Token 单价。

没有变化。

但是如果比较：

> 完成同一个任务。

情况就复杂得多。

如果以前：8000 Token，现在：10000 Token，那么成本确实会上升。

但另一方面，如果 Sonnet 5 一次就完成，以前需要两轮，最终总 Token 反而可能下降。

所以真正应该比较的是：

> Cost per Task（完成一个任务的成本）

而不是：

> Cost per Token。

## 写在最后

> Token 从来不是自然单位。

它更像一种压缩格式。

ZIP、RAR、7z，面对同一份文件，压缩后的大小可以完全不同。

Tokenizer 也是如此。同样一句话，不同模型，可以得到完全不同的 Token 数。

而模型设计者真正追求的，也不是"切得最少"，而是让 Transformer 更容易学习、更稳定推理、更高效完成任务。

也许未来几年，我们讨论模型时，会越来越少比较"每百万 Token 多少钱"，而更多比较：

> 完成同一个任务，到底需要多少成本。
