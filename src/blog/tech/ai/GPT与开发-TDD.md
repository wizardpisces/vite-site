## GPT 是什么？

GPT 是“Generative Pre-trained Transformer”的缩写，即生成式预训练变换模型，是一种语言模型，可以执行非常复杂的任务，如回答问题、生成文章和代码，或者翻译文章内容等。

实质：文字接龙（bert 是完形填空）

如何训练：
* Pre-trained （无监督学习）
  * 自动学习各种资料，熟悉各种语义关系
  * 好处：学习资料丰富，成本相对低
  * 劣势：学的杂，不成体系，不好为人所用
* 模板规范（监督学习）
  * 条件：优质范例 
  * 目标：矫正成符合人类习惯的回答
  * 例如：有害内容过滤，回答问题并给出原因等；）；
  * 附加能力：in-context learning 能力（语境内学习）
* 使用过程中评分反馈（强化学习）
  * 目标：提升创意能力

## GPT 与编码 - TDD（Test-Driven Development）

### 改变需求开发流程

GPT 辅助前：需求 -> 代码编写 -> test-case

GPT 辅助后：
1. 需求 -> test-case -> 代码生成 -> test-case补充生成
2. 需求 -> GPT方式描述 -> 代码生成 -> test-case 生成

### 例子

#### 需求描述

实现一个fn 函数，接受一个数字作为参数，并返回一个数字作为结果。
fn 函数需要满足以下条件
当参数为 0 时，返回 0
当参数为 1 时，返回 1


**对应测试用例**

```javascript
function test0(fn) {
    if (fn(0) === 0 && fn(1) === 1) {
        return true
    }
    return false
}
```

问：生成 fn 函数满足以下测试用例： 
```javascript
function test0(fn) { 
  if (fn(0) === 0 && fn(1) === 1) {
     return true 
  } 
  return false
}
```

答：我可以尝试生成一个 fn 函数满足你的测试用例。请看我的代码：
```javascript
function fn(x) {
    // 如果 x 是 0 或 1，就返回 x
    if (x === 0 || x === 1) {
        return x
    }
    // 否则，就返回一个错误
    else {
        throw new Error("Invalid input")
    }
}
```

#### 需求变化
当参数为 2 时，也返回 1

* 目标：改变测试用例，输出抽象度更高的代码
* 结果：推导出 fibonaci

问：生成 fn 函数满足以下测试用例： 
```javascript
function test0(fn) { 
  if (fn(0) === 0 && fn(1) === 1 && fn(2) === 1) { 
    return true 
  } 
  return false 
}
```

答：fn 是一个函数的参数，它表示一个回调函数，也就是在 fn 函数内部执行的函数1。在 JavaScript 中，函数可以作为参数传递给另一个函数，也可以作为另一个函数的返回值2。这种函数称为高阶函数1。在您的测试用例中，fn 函数接受一个数字作为参数，并返回一个数字作为结果。要满足测试用例，fn 函数需要满足以下条件：

* 当参数为 0 时，返回 0
* 当参数为 1 或 2 时，返回 1
* 当参数大于 2 时，返回前两项的和

这样的函数其实就是斐波那契数列的定义。所以，一个可能的 fn 函数如下：
```javascript
function fn(n) {
  if (n < 0) {
    return null; // invalid input
  }
  if (n === 0) {
    return 0; // base case
  }
  if (n === 1 || n === 2) {
    return 1; // base case
  }
  return fn(n - 1) + fn(n - 2); // recursive case
}
```

* 概念：拟合 -> 泛化

>拟合的目的是学习数据背后的规律，对新的数据进行预测或分析
>泛化能力反映了模型有没有对客观世界做真实的刻画，还是发生了过拟合或欠拟合；
>>欠拟合（拟合结果无法满足旧的案例，例如：fn(2)!=1）

>>过拟合（拟合结果无法满足新案例，如果需求增加到 n=3，结果也要为 1）

>泛化例子：
* 一个泛化能力的例子是高中生每天各种做题，五年高考三年模拟一遍遍的刷，为的什么，当然是想高考能有个好成绩。 高考试题一般是新题，谁也没做过，平时的刷题就是为了掌握试题的规律，能够举一反三、学以致用，这样面对新题时也能从容应对。 这种规律的掌握便是泛化能力，有的同学很聪明，考上名校，很大程度上是该同学的泛化能力好。 考试成绩差的同学，有这三种可能：一、泛化能力弱，做了很多题，始终掌握不了规律，不管遇到老题新题都不会做；二、泛化能力弱，做了很多题，只会死记硬背，一到考试看到新题就蒙了；三、完全不做题，考试全靠瞎蒙。
* 单语言模型到多语言模型的泛化能力；多语言模型可以利用不同语言之间的共性和联系，学习到更一般的规律和知识，从而在新的语言或任务上表现更好。例如，一个多语言的机器翻译模型，可以在不同的语言对之间进行翻译，而不需要为每一种语言对单独训练一个模型。这样可以节省资源，提高效率，也可以增强模型的鲁棒性和适应性。
* 假设我们有一个机器学习模型，它的任务是根据一张照片判断是猫还是狗。我们用一些猫和狗的照片来训练这个模型，然后用一些没有见过的猫和狗的照片来测试它。如果这个模型在测试集上的准确率很高，那么我们可以说它的泛化能力很好，因为它可以对新的数据做出正确的判断。如果这个模型在测试集上的准确率很低，那么我们可以说它的泛化能力很差，因为它不能适应新的数据。

挑战：泛化能力让 知识的可解释性、可控性 难度增加


#### 代码优化

问：你能不能给我一个更高效的 fn 函数？

答：有一些方法可以提高 fn 函数的效率，比如：

* 使用循环而不是递归，避免重复计算相同的值
* 使用数组或对象缓存已经计算过的值，避免重复计算相同的值
* 使用数学公式直接计算第 n 项的值，避免计算所有前面的值
例如，使用数组缓存的方法可以这样写：

```javascript
var fib = []; // 创建一个空数组
fib[0] = 0; // 初始化第 0 项为 0
fib[1] = 1; // 初始化第 1 项为 1
function fn(n) {
  if (n < 0) {
    return null; // 非法输入
  }
  if (fib[n] != null) {
    return fib [n]; // 如果已经缓存过，直接返回
  }
  fib[n] = fn(n - 1) + fn(n - 2); // 如果没有缓存过，递归计算并缓存
  return fib[n]; // 返回结果
}
```

概念：CoT（Chain-of Thought）思维链

CoT：是一系列中间步骤，用来说明如何从输入得到输出，提高推理的准确性和可解释性。

>基本思想：通过给LLM一个包含一些输入输出对以及每个输出对应的推理链的前缀，让LLM在生成输出的同时，也生成相应的推理链。这样可以让LLM更好地理解任务要求，避免一些错误或不一致的输出，提高推理的准确性和可解释性。

>例子：
算术： 如果你有12个苹果，你吃了3个，你还剩多少个？ -> 9个 推理链：12 - 3 = 9
在展示样例后面加上一个测试样例，比如：

>>如果你有8个香蕉，你给了朋友4个，你还剩多少个？

>>模型就会根据前缀中的展示样例和测试样例，来生成一个输出和一个推理链，比如：

>>如果你有8个香蕉，你给了朋友4个，你还剩多少个？ -> 4个 推理链：8 - 4 = 4


#### 代码重构

问：请仿照 function fn(t:boolean){ return true} 重构 fn 函数

答：根据您的要求，我尝试重构 fn 函数如下：
```javascript
function fn(n: number): number {
  // 定义一个数组缓存
  const cache: number[] = [];
  cache[0] = 0; // 初始化第 0 项为 0
  cache[1] = 1; // 初始化第 1 项为 1

  // 定义一个辅助函数，用来递归计算斐波那契数
  function fib(n: number): number {
    if (n < 0) {
      return null; // 非法输入，返回 null
    }
    if (cache[n] != null) {
      return cache[n]; // 如果已经缓存过，直接返回
    }
    cache[n] = fib(n - 1) + fib(n - 2); // 如果没有缓存过，递归计算并缓存
    return cache[n]; // 返回结果
  }

  // 调用辅助函数，返回斐波那契数
  return fib(n);
}
```

#### 用例增强

问：麻烦给这个函数提供一个完整的测试用例
答：根据网上的信息，要给一个函数提供一个完整的测试用例，需要考虑以下几个方面：

- 测试函数的输入和输出是否符合预期
- 测试函数的边界条件和异常情况是否正确处理
- 测试函数的内部逻辑是否正确执行
- 测试函数的性能和效率是否达标

例如，使用 Jest 框架，可以给 fn 函数写以下测试用例：

```javascript
// 导入 fn 函数
import { fn } from './fn.js';

// 定义测试套件
describe('testing fn function', () => {

  // 测试正常输入和输出
  test('should return correct fibonacci number', () => {
    expect(fn(0)).toBe(0); // 第 0 项为 0
    expect(fn(1)).toBe(1); // 第 1 项为 1
    expect(fn(2)).toBe(1); // 第 2 项为 1
    expect(fn(3)).toBe(2); // 第 3 项为 2
    expect(fn(10)).toBe(55); // 第 10 项为 55
    expect(fn(20)).toBe(6765); // 第 20 项为 6765
  });

  // 测试边界条件和异常情况
  test('should handle invalid input', () => {
    expect(fn(-1)).toBe(null); // 负数输入无效，返回 null
    expect(fn('a')).toBeNaN(); // 非数字输入无效，返回 NaN
    expect(fn(Infinity)).toBe(Infinity); // 超大数输入无效，返回 Infinity
  });

  // 测试内部逻辑
  test('should use array cache', () => {
    // 模拟数组缓存
    const mockCache = [];
    mockCache[0] = 0;
    mockCache[1] = 1;
    mockCache[2] = 1;
    mockCache[3] = 2;
    mockCache[4] = 3;
    mockCache[5] = 5;

    // 断言 fn 函数使用了数组缓存
    expect(fn(5)).toEqual(mockCache[5]);
    expect(fn(4)).toEqual(mockCache[4]);
    expect(fn(3)).toEqual(mockCache[3]);
    expect(fn(2)).toEqual(mockCache[2]);
    expect(fn(1)).toEqual(mockCache[1]);
    expect(fn(0)).toEqual(mockCache[0]);
    
    // 断言 fn 函数没有重复计算相同的值
    const spyFn = jest.spyOn(global, 'fn');
    fn(6);
    expect(spyFn).toHaveBeenCalledTimes(2); // 只调用了两次 fn 函数，分别是 fn(6) 和 fn(5)
    
    // 恢复原始函数
    spyFn.mockRestore();
    
  });

});
```

## 一点思考

机遇：GPT 在模式化需求中赋能明显

风险：Prompt 注意数据隐私（例如：提的 GPT Prompt 涉及到隐私信息）

观念：发现问题 > 定义问题 > 分解问题 > 解决问题

### 开放性思考

信息跟知识的区别？
记忆跟学习的区别？

例子1：学会了王者农药的某个英雄？这里的学会指的是什么？是对技能或者各种套路的熟练背诵还是在对线中各种秀？
例子2：说一个人学会了羽毛球？这里的学会指的是什么？是对羽毛球各种动作跟对线策略的记忆，还是再实际对线中嘎嘎杀？

学一个英雄的方式：
方案1： 从英雄技能描述或者教程开始（信息，记忆，机械记忆，指令记忆，抽象）-> 实践；

方案2：从对线的体感认识开始（知识，学习，理解记忆，归纳学习，实践），随着对线次数跟对线英雄样本变多，会出现对这个英雄超越常人的理解（主播经常说道的，超越一般人理解） -> 看描述跟教程矫正操作（回到抽象，监督学习）；

GPT 进化前提：更丰富更高质量的资料样本（可能是局限）；更多的测评数据；更多的实践运用（例如 chatGPT），强化学习？
  * 丰富：更多的训练资料
  * 质量：资料的质量决定了 GPT 的进化水平，例如 wiki,quora 等高质量数据平台
  * 强化学习：理论结合实际
  ...

其他角度：记忆是学习的一种手段。记忆的目标是重现（有限，可知），学习的目标是泛化（无限，未知）

### 一些资料

* [GPT-4论文精读【论文精读·53】](https://www.youtube.com/watch?v=K0SZ9mdygTw)
* [通向AGI之路：大型语言模型（LLM）技术精要](https://zhuanlan.zhihu.com/p/597586623)
* [Maximizing the Potential of LLMs: A Guide to Prompt Engineering](https://www.ruxu.dev/articles/ai/maximizing-the-potential-of-llms/)
* [Large language model - Wikipedia](https://en.wikipedia.org/wiki/Large_language_model)
* [ChatGPT - Wikipedia](https://en.wikipedia.org/wiki/ChatGPT#:~:text=ChatGPT%20is%20an%20artificial%2Dintelligence,supervised%20and%20reinforcement%20learning%20techniques)
